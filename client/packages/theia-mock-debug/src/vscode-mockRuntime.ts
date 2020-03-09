/********************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import "reflect-metadata";

import { EventEmitter } from "events";
import { readFileSync } from "fs";
import { DebugProtocol } from "vscode-debugprotocol";


const Net = require("net");

export interface MockFunctionBreakpoint {
    id: number;
    name: string;
    verified: boolean;
}

export interface MockBreakpoint {
    id: number;
    line: number;
    verified: boolean;
}

export interface StackEntry {
    id: number;
    line: number;
    name: string;
    file: string;
}

/**
 * A Mock runtime with minimal debugger functionality.
 */
export class MockRuntime extends EventEmitter {


    private debugger = new Net.Socket();
    private _host = '127.0.0.1';
    private _port = 5056;
    private _connectType = 'sockets';
    private _serverBase = '';

    private _localVariables = new Array<DebugProtocol.Variable>();

    public get localVariables() {
        return this._localVariables;
    }

    private _globalVariables = new Array<DebugProtocol.Variable>();
    public get globalVariables() {
        return this._globalVariables;
    }

    private _connected = false;
    private _isValid = true;
    private _isException = false;
    private _continue = false;
    private _currentElement: string;
    private _init = true;
    // the initial (and one and only) file we are 'debugging'
    private _sourceFile!: string;


    public get sourceFile() {
        return this._sourceFile;
    }

    // the contents (= lines) of the one and only file
    private _sourceLines: string[] = [];

    // This is the next line that will be 'executed'
    // private _currentLine = 0;

    private _stackTrace = new Array<StackEntry>();

    private _queuedCommands = new Array<string>();

    // maps from sourceFile to array of Mock breakpoints
    private _breakPoints = new Map<string, MockBreakpoint[]>();
    private _functionBreakpoints = new Map<number, MockFunctionBreakpoint>();

    // since we want to send breakpoint events, we will assign an id to every event
    // so that the frontend can match events with breakpoints.
    private _breakpointId = 1;


    constructor() {
        super();
    }


    /**
     * Start executing the given program.
     */
    public start(program: string, stopOnEntry: boolean, connectType: string,
        host: string, port: number, serverBase = "") {

        this._connectType = connectType;
        this._host = host;
        this._port = port;
        this._serverBase = serverBase;

        if (host === "127.0.0.1") {
            this._serverBase = "";
        }

        // this.loadSource(program);
        // this._currentLine = -1;
        this._sourceFile = program;
        this.verifyBreakpoints(this._sourceFile);

        this.connectToDebugger();

        if (stopOnEntry) {
            // we step once
            console.log("StopOnEntry");
            this.step('stopOnEntry');
        } else {
            // we just start to run until we hit a breakpoint or an exception
            this.continue();
        }
    }

    public connectToDebugger() {
        if (this._connected) {
            return;
        }

        if (this._connectType === "sockets") {
            // const serverFilename = "example1.wf";
            this.debugger.connect(this._port, this._host, () => {
                this._connected = true;
                this.debugger.setEncoding('utf8');
                console.log("Connected to " + this._host + ":" + this._port);

                this._init = false;
                if (this._sourceFile !== '') {
                    const serverFilename = this.getServerPath(this._sourceFile);
                    if (serverFilename !== undefined && serverFilename !== '') {
                        this.sendToServer('file', serverFilename);
                    }
                    this.sendBreakpointsToServer();
                }
                for (let i = 0; i < this._queuedCommands.length; i++) {
                    this.sendToServer(this._queuedCommands[i]);
                    console.log("QUEue:" + this._queuedCommands.length);
                }
                this._queuedCommands.length = 0;
            });

            this.debugger.on('data', (data: string) => {
                console.log("HALLLOO");
                this.processFromDebugger(data);
                console.log('Received: ' + data.replace(/\s/g, ""));
            });

            this.debugger.on('close', () => {
                this._connected = false;
                console.log('Connection closed');
            });
        }
    }

    public processFromDebugger(data: string) {
        if (!this.isValid()) {
            return;
        }
        // this.sendEvent('output', data.toString().trim(), "", -1, '\n');
        // const index = data.indexOf('|');
        const lines = data.split('\n');
        const command = lines[0];
        let startVarsData = 1;
        let startStackData = 1;

        /*if (index >= 0) {
            response = (index < data.length - 1 ? data.substring(index + 1) : '').trim();
            command = data.substring(0, index).trim();
        }*/
        console.log("command: " + command + "   response: " + lines.toString());


        if (command === 'end') {
            this.disconnectFromDebugger();
            return;
        }

        if (command === 'vars' || command === 'next' || command === 'exc') {
            this._localVariables.length = 0;
            this._globalVariables.length = 0;
        }

        if (command === 'exc') {
            this.sendEvent('stopOnException');
            this._isException = true;

            const msg = lines.length < 2 ? '' : lines[1];
            const headerMsg = 'Exception thrown. ' + msg + ' ';
            if (this._stackTrace.length < 1) {
                console.log(headerMsg);
            } else {
                const entry = this._stackTrace[0];
                console.log(headerMsg, entry.file, entry.name);
            }
            return;
        }

        if (command === 'next') {
            startVarsData++;
            this._currentElement = lines[1];
            console.log("Next ELement:" + this._currentElement);
            if (this._continue) {
                const bp = this.getBreakpoint(this._currentElement);
                if (bp) {
                    this.runOnce('stopOnStep');
                } else {
                    // this.sendToServer('continue');
                    console.log("CONTINUE2");
                }
            } else {
                this.runOnce('stopOnStep');
            }
        }

        if (command === 'vars' || command === 'next') {
            const nbVarsLines = Number(lines[startVarsData]);
            this.fillVars(lines, startVarsData, nbVarsLines);
            startStackData = startVarsData + nbVarsLines + 1;
        }

        if (command === 'stack' || command === 'next') {
            this.fillStackTrace(lines, startStackData);
        }

    }

    fillVars(lines: string[], startVarsData: number, nbVarsLines: number) {
        let counter = 0;
        for (let i = startVarsData + 1; i < lines.length && counter < nbVarsLines; i++) {
            counter++;
            const line = lines[i];
            const tokens = line.split(':');
            if (tokens.length < 4) {
                continue;
            }
            const name = tokens[0];
            const globLoc = tokens[1];
            const type = tokens[2];
            let value = tokens.slice(3).join(':').trimRight();
            if (type === 'string') {
                value = '"' + value + '"';
            }
            const item = {
                name: name,
                type: type,
                value: value,
                variablesReference: 0
            };
            if (globLoc === '1') {
                this._globalVariables.push(item);
            } else {
                this._localVariables.push(item);
            }
        }
    }

    fillStackTrace(lines: string[], start = 0): void {
        let id = 0;
        console.log("Lines:" + lines.length + " start: " + start);
        this._stackTrace.length = 0;
        for (let i = start; i < lines.length; i++) {
            const line = lines[i].trim();
            console.log("Line:" + line);
            const entry = <StackEntry>{ id: ++id, line: 0, name: line, file: this._sourceFile };
            this._stackTrace.push(entry);
        }
    }

    public makeInvalid() {
        this._isValid = false;
    }
    public isValid(): boolean {
        return this._isValid;
    }

    disconnectFromDebugger() {
        if (!this.isValid()) {
            return;
        }
        this.sendToServer('bye');
        this.debugger.end();
        this._connected = false;
        this.sendEvent('end');
        this.makeInvalid();
    }

    public sendToServer(command: string, data = "") {
        let message = command;
        if (data !== '' || command.indexOf('|') < 0) {
            message += '|' + data;
        }
        console.log(message);
        if (!this._connected) {
            this._queuedCommands.push(message);
            return;
        }
        this.debugger.write(message + "\n");
    }

    /**
     * Continue execution to the end/beginning.
     */
    public continue() {
        if (!this.verifyDebug(this._sourceFile)) {
            return;
        }
        this._continue = true;
        this.sendToServer('continue');
    }

    /**
     * Step to the next/previous non empty line.
     */
    public step(event = 'stopOnStep') {
        if (!this.verifyDebug(this._sourceFile)) {
            return;
        }
        this._continue = false;
        if (this._init) {
            this.runOnce(event);
        } else {
            this.sendToServer('step');
        }
    }

    private verifyException(): boolean {
        if (this._isException) {
            this.disconnectFromDebugger();
            return false;
        }
        return true;
    }

    public verifyDebug(file: string): boolean {
        return this.verifyException() && file !== null &&
            typeof file !== 'undefined' &&
            (file.endsWith('wf'));
    }

    /**
     * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
     */
    public stack(startFrame: number, endFrame: number): any {

        //  const words = this._sourceLines[this._currentLine];

        const frames = new Array<any>();
        // every word of the current line becomes a stack frame.
        /*for (let i = startFrame; i < Math.min(endFrame, words.length); i++) {
            const name = words[i];	// use a word of the line as the stackframe name
            frames.push({
                /*index: i,
                name: `${name}(${i})`,
                file: this._sourceFile,
                line: this._currentLine
            });
        } */
        for (let i = 0; i < this._stackTrace.length; i++) {
            const entry = this._stackTrace[i];
            frames.push({
                index: entry.id,
                name: entry.name,
                file: entry.file,
                line: entry.line
            });
        }
        /* frames.push({
            index: 0,
            name: 'test',
            file: this._sourceFile,
            line: 1
        }); */
        return {
            frames: frames,
            count: this._stackTrace.length
        };
    }

    public sendBreakpointsToServer() {
        if (!this._connected) {
            return;
        }

        let data = '';
        this._functionBreakpoints.forEach(bp => {
            data += bp.name + '|';
        });

        console.log("DATA: " + data);
        this.sendToServer('setbp', data);
    }

    /*
	 * Set breakpoint in file with given line.
	 */
    public setBreakPoint(path: string, line: number): MockBreakpoint {

        const bp = <MockBreakpoint>{ verified: false, line, id: this._breakpointId++ };
        let bps = this._breakPoints.get(path);
        if (!bps) {
            bps = new Array<MockBreakpoint>();
            this._breakPoints.set(path, bps);
        }
        bps.push(bp);

        this.verifyBreakpoints(path);

        return bp;
    }

    /*
     * Set breakpoint in file with given line.
     */
    public setFunctionBreakpoint(breakpoint: string): MockFunctionBreakpoint {

        const bp = <MockFunctionBreakpoint>{ id: this._breakpointId++, name: breakpoint, verified: false };
        if (!this._functionBreakpoints.has(bp.id)) {
            this._functionBreakpoints.set(bp.id, bp);
        }

        // this.verifyBreakpoints(path);

        return bp;
    }

    public getBreakpoint(element: string): MockFunctionBreakpoint | undefined {
        this._functionBreakpoints.forEach(bp => {
            if (bp.name === element) {
                return bp;
            }
        });
        return undefined;
    }

    /*
	 * Clear breakpoint in file with given line.
	 */
    public clearBreakPoint(path: string, line: number): MockBreakpoint | undefined {
        const bps = this._breakPoints.get(path);
        if (bps) {
            const index = bps.findIndex(bp => bp.line === line);
            if (index >= 0) {
                const bp = bps[index];
                bps.splice(index, 1);
                return bp;
            }
        }
        return undefined;
    }

    /*
     * Clear all breakpoints for file.
     */
    public clearBreakpoints(): void {
        this._functionBreakpoints.clear();
    }

    // private methods

    private loadSource(file: string) {
        if (this._sourceFile !== file) {
            this._sourceFile = file;
            this._sourceLines = readFileSync(this._sourceFile).toString().split('\n');
        }
    }

    getServerPath(pathname: string) {
        // TODO serverbase
        if (this._serverBase === "") {
            return pathname;
        }
    }

    private runOnce(stepEvent?: string) {
        this.fireEventsForElement(this._currentElement, stepEvent);
    }

    /**
     * Run through the file.
     * If stepEvent is specified only run a single step and emit the stepEvent.
     */
    /*private run(reverse = false, stepEvent?: string) {
        if (reverse) {
            for (let ln = this._currentLine - 1; ln >= 0; ln--) {
                if (this.fireEventsForLine(ln, stepEvent)) {
                    this._currentLine = ln;
                    return;
                }
            }
            // no more lines: stop at first line
            this._currentLine = 0;
            this.sendEvent('stopOnEntry');
        } else {
            for (let ln = this._currentLine + 1; ln < this._sourceLines.length; ln++) {
                if (this.fireEventsForLine(ln, stepEvent)) {
                    this._currentLine = ln;
                    return true;
                }
            }
            // no more lines: run to end
            this.sendEvent('end');
        }
    } */

    private verifyBreakpoints(path: string): void {
        const bps = this._breakPoints.get(path);
        if (bps) {
            this.loadSource(path);
            bps.forEach(bp => {
                if (!bp.verified && bp.line < this._sourceLines.length) {
                    const srcLine = this._sourceLines[bp.line].trim();

                    // if a line is empty or starts with '+' we don't allow to set a breakpoint but move the breakpoint down
                    if (srcLine.length === 0 || srcLine.indexOf('+') === 0) {
                        bp.line++;
                    }
                    // if a line starts with '-' we don't allow to set a breakpoint but move the breakpoint up
                    if (srcLine.indexOf('-') === 0) {
                        bp.line--;
                    }
                    // don't set 'verified' to true if the line contains the word 'lazy'
                    // in this case the breakpoint will be verified 'lazy' after hitting it once.
                    if (srcLine.indexOf('lazy') < 0) {
                        bp.verified = true;
                        this.sendEvent('breakpointValidated', bp);
                    }
                }
            });
        }
    }

    /**
     * Fire events if line has a breakpoint or the word 'exception' is found.
     * Returns true is execution needs to stop.
     */
    private fireEventsForElement(currentElement: string, stepEvent?: string): boolean {

        // is there a breakpoint?
        const bp = this.getBreakpoint(currentElement);
        if (bp) {
            console.log("STOPONBREAKPOINT");
            this.sendEvent('stopOnBreakpoint');
            if (!bp.verified) {
                bp.verified = true;
                this.sendEvent('breakpointValidated', bp);
            }
            return true;
        }

        if (stepEvent) {
            this.sendEvent(stepEvent);
            return true;
        }

        return false;
    }

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }
}
