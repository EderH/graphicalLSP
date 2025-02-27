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
import { BaseGLSPServerContribution } from "@glsp/theia-integration/lib/node";
import { IConnection } from "@theia/languages/lib/node";
import { injectable } from "inversify";
import * as net from "net";
import { createSocketConnection } from "vscode-ws-jsonrpc/lib/server";

import { StateMachineLanguage } from "../common/state-machine-language";

function getPort(): number | undefined {
    const arg = process.argv.filter(arg => arg.startsWith('--STATEMACHINE_LSP='))[0];
    if (!arg) {
        return undefined;
    } else {
        return Number.parseInt(arg.substring('--STATEMACHINE_LSP='.length), 10);
    }
}

@injectable()
export class StateMachineGLServerContribution extends BaseGLSPServerContribution {
    readonly id = StateMachineLanguage.Id;
    readonly name = StateMachineLanguage.Name;

    readonly description = {
        id: 'stateMachine',
        name: 'StateMachine',
        documentSelector: ['stateMachine'],
        fileEvents: [
            '**/*.stateMachine'
        ]
    };

    start(clientConnection: IConnection): void {
        const socketPort = getPort();
        if (socketPort) {
            const socket = new net.Socket();
            const serverConnection = createSocketConnection(socket, socket, () => {
                socket.destroy();
            });
            this.forward(clientConnection, serverConnection);
            socket.connect(socketPort);
        } else {
            console.error("Error when trying to connect to State Machine GLSP server");
        }
    }
}
