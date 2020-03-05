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
import { MessageClient } from "@theia/core";
import { LabelProvider } from "@theia/core/lib/browser";
import URI from "@theia/core/lib/common/uri";
import { DebugSession } from "@theia/debug/lib/browser/debug-session";
import { DebugSessionConnection } from "@theia/debug/lib/browser/debug-session-connection";
import { DebugSessionOptions } from "@theia/debug/lib/browser/debug-session-options";
import { FileSystem } from "@theia/filesystem/lib/common";
import { TerminalService } from "@theia/terminal/lib/browser/base/terminal-service";

import { MockBreakpointManager } from "./breakpoint/mock-breakpoint-manager";
import { MockEditorManager } from "./mock-editor-manager";
import { DebugBreakpoint, DebugBreakpointOptions } from "./model/debug-breakpoint";
import { DebugFunctionBreakpoint } from "./model/debug-function-breakpoint";


export class MockDebugSession extends DebugSession {

    constructor(
        readonly id: string,
        readonly options: DebugSessionOptions,
        protected readonly connection: DebugSessionConnection,
        protected readonly terminalServer: TerminalService,
        protected readonly editorManager: MockEditorManager,
        protected readonly breakpoints: MockBreakpointManager,
        protected readonly labelProvider: LabelProvider,
        protected readonly messages: MessageClient,
        protected readonly fileSystem: FileSystem) {
        super(id, options, connection, terminalServer, editorManager, breakpoints, labelProvider, messages, fileSystem);
    }

    protected async updateBreakpoints(options: {
        uri?: URI,
        sourceModified: boolean
    }): Promise<void> {
        if (this.updatingBreakpoints) {
            return;
        }
        const { uri } = options;
        for (const affectedUri of this.getAffectedUris(uri)) {

            if (affectedUri.toString() === MockBreakpointManager.FUNCTION_URI.toString()) {
                await this.sendFunctionBreakpoints(affectedUri);
            }
        }
    }

    protected readonly _functionBreakpoints = new Map<string, DebugBreakpoint[]>();

    getFunctionBreakpoints(): DebugFunctionBreakpoint[] {
        const breakpoints = [];
        const uri = MockBreakpointManager.FUNCTION_URI;
        if (uri) {
            for (const breakpoint of this._functionBreakpoints.get(uri.toString()) || []) {
                if (breakpoint instanceof DebugFunctionBreakpoint) {
                    breakpoints.push(breakpoint);
                }
            }
        }
        return breakpoints;
    }

    protected async sendFunctionBreakpoints(affectedUri: URI): Promise<void> {
        const all = this.breakpoints.getFunctionBreakpoints().map(origin =>
            new DebugFunctionBreakpoint(origin, this.asDebugBreakpointOptions())
        );
        const enabled = all.filter(b => b.enabled);
        if (this.capabilities.supportsFunctionBreakpoints) {
            try {
                const response = await this.sendRequest('setFunctionBreakpoints', {
                    breakpoints: enabled.map(b => b.origin.raw)
                });
                response.body.breakpoints.map((raw, index) => {
                    // node debug adapter returns more breakpoints sometimes
                    if (enabled[index]) {
                        enabled[index].update({ raw });
                    }
                });
            } catch (error) {
                // could be error or promise rejection of DebugProtocol.SetFunctionBreakpoints
                if (error instanceof Error) {
                    console.error(`Error setting breakpoints: ${error.message}`);
                } else {
                    // handle adapters that send failed DebugProtocol.SetFunctionBreakpoints for invalid breakpoints
                    const genericMessage: string = 'Function breakpoint not valid for current debug session';
                    const message: string = error.message ? `${error.message}` : genericMessage;
                    console.warn(`Could not handle function breakpoints: ${message}, disabling...`);
                    enabled.forEach(b => b.update({
                        raw: {
                            verified: false,
                            message
                        }
                    }));
                }
            }
        }
        this.setFunctionBreakpoints(affectedUri, all);
    }

    protected setFunctionBreakpoints(uri: URI, breakpoints: DebugBreakpoint[]): void {
        this._functionBreakpoints.set(uri.toString(), breakpoints);
        this.fireDidChangeBreakpoints(uri);
    }

    protected asDebugBreakpointOptions(): DebugBreakpointOptions {
        const { labelProvider, breakpoints, editorManager } = this;
        return { labelProvider, breakpoints, editorManager, session: this };
    }

    protected *getAffectedUris(uri?: URI): IterableIterator<URI> {
        if (uri) {
            yield uri;
        } else {
            for (const uriString of this.breakpoints.getUris()) {
                yield new URI(uriString);
            }
            yield MockBreakpointManager.FUNCTION_URI;
        }
    }

}
