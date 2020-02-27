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

    private _connected = false;
    private _isValid = true;
    private _isException = false;
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
            //const serverFilename = "example1.wf";
            this.debugger.connect(this._port, this._host, () => {
                this._connected = true;
                this.debugger.setEncoding('utf8');
                console.log("Connected to " + this._host + ":" + this._port);

                if (this._sourceFile !== '') {
                    let serverFilename = this.getServerPath(this._sourceFile);
                    if (serverFilename !== undefined && serverFilename !== '') {
                        this.sendToServer('file', serverFilename);
                    }
                }
                for (let i = 0; i < this._queuedCommands.length; i++) {
                    this.sendToServer(this._queuedCommands[i]);
                }
                this._queuedCommands.length = 0;
            });

            this.debugger.on('data', (data: string) => {
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
        const index = data.indexOf('|');
        let command: string = '';
        let response: string = '';
        if (index >= 0) {
            response = (index < data.length - 1 ? data.substring(index + 1) : '').trim();
            command = data.substring(0, index).trim();
        }
        console.log("command: " + command + "   response: " + response);

        if (command === 'end') {
            this.disconnectFromDebugger();
            return;
        }

        if (command === 'next') {
            //this.sendEvent('onDebuggerMessage', data);
            this.sendEvent('stopOnStep');
        }

        if (command === 'vars' || command === 'next') {

        }

        if (command === 'stack' || command === 'next') {
            let id = 0;
            const entry = <StackEntry>{ id: ++id, line: 0, name: response, file: this._sourceFile };
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
            message += ' | ' + data;
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
        this.sendToServer('continue');
    }

    /**
     * Step to the next/previous non empty line.
     */
    public step(event = 'stopOnStep') {
        if (!this.verifyDebug(this._sourceFile)) {
            return;
        }
        if (event == 'stopOnEntry') {
            this.sendEvent(event);
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
            data += bp + "|";
        });


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
    public setFunctionBreakPoint(breakpoint: string): MockFunctionBreakpoint {

        const bp = <MockFunctionBreakpoint>{ id: this._breakpointId++, name: breakpoint, verified: false }

        this._functionBreakpoints.set(bp.id, bp);

        // this.verifyBreakpoints(path);

        return bp;
    }

    /*
	 * Clear breakpoint in file with given line.
	 */
    public clearBreakPoint(path: string, line: number): MockBreakpoint | undefined {
        let bps = this._breakPoints.get(path);
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
    /*private fireEventsForLine(ln: number, stepEvent?: string): boolean {

        const line = this._sourceLines[ln].trim();

        // if 'log(...)' found in source -> send argument to debug console
        const matches = /log\((.*)\)/.exec(line);
        if (matches && matches.length === 2) {
            this.sendEvent('output', matches[1], this._sourceFile, ln, matches.index)
        }

        // if word 'exception' found in source -> throw exception
        if (line.indexOf('exception') >= 0) {
            this.sendEvent('stopOnException');
            return true;
        }

        // is there a breakpoint?
        const breakpoints = this._breakPoints.get(this._sourceFile);
        if (breakpoints) {
            const bps = breakpoints.filter(bp => bp.line === ln);
            if (bps.length > 0) {

                // send 'stopped' event
                this.sendEvent('stopOnBreakpoint');

                // the following shows the use of 'breakpoint' events to update properties of a breakpoint in the UI
                // if breakpoint is not yet verified, verify it now and send a 'breakpoint' update event
                if (!bps[0].verified) {
                    bps[0].verified = true;
                    this.sendEvent('breakpointValidated', bps[0]);
                }
                return true;
            }
        }

        // non-empty line
        if (stepEvent && line.length > 0) {
            this.sendEvent(stepEvent);
            return true;
        }

        // nothing interesting found -> continue
        return false;
    } */

    private sendEvent(event: string, ...args: any[]) {
        setImmediate(_ => {
            this.emit(event, ...args);
        });
    }
}
