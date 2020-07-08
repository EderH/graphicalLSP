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
import { GLSPClientContribution } from "@glsp/theia-integration/lib/browser";
import { FrontendApplicationContribution, OpenHandler, WidgetFactory } from "@theia/core/lib/browser";
import { DebugSessionContribution } from "@theia/debug/lib/browser/debug-session-contribution";
import { ContainerModule, interfaces } from "inversify";
import { DiagramConfiguration, DiagramManager, DiagramManagerProvider } from "sprotty-theia/lib";

import { StateMachineDebugSessionContribution } from "./debugger/state-machine-debug-session-contribution";
import { StateMachineDiagramConfiguration } from "./diagram/state-machine-diagram-configuration";
import { StateMachineDiagramManager } from "./diagram/state-machine-diagram-manager";
import { StateMachineGLSPDiagramClient } from "./diagram/state-machine-glsp-diagram-client";
import { StateMachineGLSPClientContribution } from "./language/state-machine-glsp-client-contribution";

export default new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind, isBound: interfaces.IsBound, rebind: interfaces.Rebind) => {
    bind(StateMachineGLSPClientContribution).toSelf().inSingletonScope();
    bind(GLSPClientContribution).toService(StateMachineGLSPClientContribution);

    bind(DebugSessionContribution).to(StateMachineDebugSessionContribution);

    bind(StateMachineGLSPDiagramClient).toSelf().inSingletonScope();

    bind(DiagramConfiguration).to(StateMachineDiagramConfiguration).inSingletonScope();
    bind(StateMachineDiagramManager).toSelf().inSingletonScope();
    bind(FrontendApplicationContribution).toService(StateMachineDiagramManager);
    bind(OpenHandler).toService(StateMachineDiagramManager);
    bind(WidgetFactory).toService(StateMachineDiagramManager);
    bind(DiagramManagerProvider).toProvider<DiagramManager>((context) => {
        return () => {
            return new Promise<DiagramManager>((resolve) => {
                const diagramManager = context.container.get<StateMachineDiagramManager>(StateMachineDiagramManager);
                resolve(diagramManager);
            });
        };
    });
});
