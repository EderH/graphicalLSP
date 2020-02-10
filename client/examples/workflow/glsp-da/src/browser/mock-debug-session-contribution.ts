/********************************************************************************
 * Copyright (C) 2018 Red Hat, Inc. and others.
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
import { LabelProvider, WebSocketConnectionProvider } from "@theia/core/lib/browser";
import { BreakpointManager } from "@theia/debug/lib/browser/breakpoint/breakpoint-manager";
import { DebugPreferences } from "@theia/debug/lib/browser/debug-preferences";
import { DebugSession } from "@theia/debug/lib/browser/debug-session";
import { DebugSessionConnection } from "@theia/debug/lib/browser/debug-session-connection";
import {
    DebugSessionContribution,
    DebugSessionFactory,
    DefaultDebugSessionFactory
} from "@theia/debug/lib/browser/debug-session-contribution";
import { DebugSessionOptions } from "@theia/debug/lib/browser/debug-session-options";
import { DebugAdapterPath } from "@theia/debug/lib/common/debug-service";
import { FileSystem } from "@theia/filesystem/lib/common";
import { OutputChannelManager } from "@theia/output/lib/common/output-channel";
import { TerminalService } from "@theia/terminal/lib/browser/base/terminal-service";
import { inject, injectable } from "inversify";
import { IWebSocket } from "vscode-ws-jsonrpc/lib/socket/socket";

import { MockEditorManager } from "./mock-editor-manager";

@injectable()
export class MockDebugSessionContribution implements DebugSessionContribution {

    @inject(MockEditorManager)
    protected readonly editorManager: MockEditorManager;
    @inject(TerminalService)
    protected readonly terminalService: TerminalService;
    @inject(WebSocketConnectionProvider)
    protected readonly connectionProvider: WebSocketConnectionProvider;
    @inject(BreakpointManager)
    protected readonly breakpoints: BreakpointManager;
    @inject(LabelProvider)
    protected readonly labelProvider: LabelProvider;
    @inject(MessageClient)
    protected readonly messages: MessageClient;
    @inject(OutputChannelManager)
    protected readonly outputChannelManager: OutputChannelManager;
    @inject(DebugPreferences)
    protected readonly debugPreferences: DebugPreferences;
    @inject(FileSystem)
    protected readonly fileSystem: FileSystem;

    debugType = "mock-debug";
    debugSessionFactory(): DebugSessionFactory {
        return new MockDebugSessionFactory(this.terminalService, this.editorManager, this.breakpoints, this.labelProvider,
            this.messages, this.outputChannelManager, this.connectionProvider, this.debugPreferences, this.fileSystem);
    }
}

@injectable()
export class MockDebugSessionFactory extends DefaultDebugSessionFactory {

    constructor(
        protected readonly terminalService: TerminalService,
        protected readonly editorManager: MockEditorManager,
        protected readonly breakpoints: BreakpointManager,
        protected readonly labelProvider: LabelProvider,
        protected readonly messages: MessageClient,
        protected readonly outputChannelManager: OutputChannelManager,
        protected readonly connectionProvider: WebSocketConnectionProvider,
        protected readonly debugPreferences: DebugPreferences,
        protected readonly fileSystem: FileSystem,
    ) {
        super();
    }

    get(sessionId: string, options: DebugSessionOptions): DebugSession {
        const connection = new DebugSessionConnection(
            sessionId,
            () => new Promise<IWebSocket>(resolve =>
                this.connectionProvider.openChannel(`${DebugAdapterPath}/${sessionId}`, channel => {
                    resolve(channel);
                }, { reconnecting: false })
            ),
            this.getTraceOutputChannel());

        return new DebugSession(
            sessionId,
            options,
            connection,
            this.terminalService,
            this.editorManager,
            this.breakpoints,
            this.labelProvider,
            this.messages,
            this.fileSystem);
    }
}
