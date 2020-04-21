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
import { CommandContribution } from "@theia/core";
import { OpenHandler } from "@theia/core/lib/browser";
import { ContainerModule, interfaces } from "inversify";

import { GLSPBreakpointDiagramManager } from "./breakpoint/glsp-breakpoint-diagram-manager";
import { GLSPBreakpointManager } from "./breakpoint/glsp-breakpoint-manager";
import { GLSPEventFlowDiagramManager } from "./event-flow/glsp-event-flow-diagram-manager";
import { GLSPDebugEditorManager } from "./glsp-debug-editor-manager";
import { GLSPDebugFrontendContribution } from "./glsp-debug-frontend-contribution";
import { GLSPDebugSessionFactory } from "./glsp-debug-session-factory";
import { GLSPStackFrameDiagramManager } from "./stackframe/glsp-stackframe-diagram-manager";
import { SelectOptionsDialogProps } from "./view/dialog";
import { GLSPDebugBreakpointsSource } from "./view/glsp-debug-breakpoints-source";
import { GLSPDebugEventsWidget } from "./view/glsp-debug-events-widget";


export default new ContainerModule((bind: interfaces.Bind) => {
    // add your contribution bindings here

    bind(GLSPStackFrameDiagramManager).toSelf().inSingletonScope();

    bind(SelectOptionsDialogProps).toSelf().inSingletonScope();

    bind(GLSPDebugEventsWidget).toDynamicValue(({ container }) => GLSPDebugEventsWidget.createWidget(container));
    bind(GLSPEventFlowDiagramManager).toSelf().inSingletonScope();

    bind(GLSPDebugSessionFactory).toSelf().inSingletonScope();

    bind(GLSPDebugEditorManager).toSelf().inSingletonScope();
    bind(OpenHandler).toService(GLSPDebugEditorManager);

    bind(GLSPBreakpointManager).toSelf().inSingletonScope();
    bind(GLSPBreakpointDiagramManager).toSelf().inSingletonScope();

    bind(GLSPDebugBreakpointsSource).toSelf().inSingletonScope();

    bind(GLSPDebugFrontendContribution).toSelf().inSingletonScope();
    bind(CommandContribution).to(GLSPDebugFrontendContribution);

});
