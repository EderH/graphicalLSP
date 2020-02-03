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

export interface MockBreakpoint {
    id: number;
    line: number;
    verified: boolean;
}

/**
 * A Mock runtime with minimal debugger functionality.
 */
export class MockRuntime extends EventEmitter {


    private debugger = new Net.Socket();
    private host = '127.0.0.1';
    private port = 5056;

    // the initial (and one and only) file we are 'debugging'
    private _sourceFile!: string;

    public get sourceFile() {
        return this._sourceFile;
    }

    // the contents (= lines) of the one and only file
    private _sourceLines: string[] = [];

    // This is the next line that will be 'executed'
    // private _currentLine = 0;

    // maps from sourceFile to array of Mock breakpoints
    private _breakPoints = new Map<string, MockBreakpoint[]>();

    // since we want to send breakpoint events, we will assign an id to every event
    // so that the frontend can match events with breakpoints.
    private _breakpointId = 1;


    constructor() {
        super();
    }


    /**
     * Start executing the given program.
     */
    public start(program: string, stopOnEntry: boolean) {

        // this.loadSource(program);
        // this._currentLine = -1;
        this._sourceFile = program;
        this.verifyBreakpoints(this._sourceFile);

        this.connectToDebugger();

        /*if (stopOnEntry) {
            // we step once
            this.step('stopOnEntry');
        } else {
            // we just start to run until we hit a breakpoint or an exception
            this.continue();
        } */
    }

    public connectToDebugger() {
        const serverFilename = "example1.wf";
        this.debugger.connect(this.port, this.host, () => {
            this.debugger.setEncoding('utf8');
            console.log("Connected to " + this.host + ":" + this.port);
            this.sendEvent('onStatusChange', 'CSCS: Connected to ' + this.host + ":" + this.port);
            this.sendToServer('file', serverFilename);
            this.sendEvent('stopOnEntry');

        });

        this.debugger.on('data', (data: string) => {
            this.processFromDebugger(data);
            console.log('Received: ' + data.replace(/\s/g, ""));
        });

        this.debugger.on('close', function () {
            console.log('Connection closed');
        });
    }

    public processFromDebugger(data: string) {
        // this.sendEvent('output', data.toString().trim(), "", -1, '\n');
        if (data === 'end') {
            this.sendEvent('end');
        }
        this.sendEvent('onDebuggerMessage', data);
        console.log('Test2');
    }

    disconnectFromDebugger() {
        this.sendToServer('bye');
        this.debugger.end();
        this.sendEvent('end');
    }

    public sendToServer(cmd: string, data = "") {
        let message = cmd;
        if (data !== '' || cmd.indexOf('|') < 0) {
            message += ' | ' + data;
        }
        console.log(message);
        this.debugger.write(message + "\n");
    }

    /**
     * Continue execution to the end/beginning.
     */
    public continue() {
        this.sendToServer('continue');
    }

    /**
     * Step to the next/previous non empty line.
     */
    public step(event = 'stopOnStep') {
        this.sendToServer('step');
        this.sendEvent(event);
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
        frames.push({
            index: 0,
            name: 'test',
            file: this._sourceFile,
            line: 1
        });
        return {
            frames: frames,
            count: 1
        };
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
    public clearBreakpoints(path: string): void {
        this._breakPoints.delete(path);
    }

    // private methods

    private loadSource(file: string) {
        if (this._sourceFile !== file) {
            this._sourceFile = file;
            this._sourceLines = readFileSync(this._sourceFile).toString().split('\n');
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
