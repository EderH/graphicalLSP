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
import { GLSPBreakpointManager } from "@glsp/theia-debug-diagram/lib/browser/breakpoint/glsp-breakpoint-manager";
import { DebugGLSPEditorManager } from "@glsp/theia-debug-diagram/lib/browser/debug-glsp-editor-manager";
import { GLSPDiagramManager, GLSPTheiaSprottyConnector } from "@glsp/theia-integration/lib/browser";
import { MessageService } from "@theia/core";
import { ApplicationShell, WidgetManager } from "@theia/core/lib/browser";
import { EditorManager } from "@theia/editor/lib/browser";
import { inject, injectable } from "inversify";
import { TheiaFileSaver } from "sprotty-theia/lib";

import { StateMachineLanguage } from "../../common/state-machine-language";
import { StateMachineGLSPDiagramClient } from "./state-machine-glsp-diagram-client";




@injectable()
export class StateMachineDiagramManager extends GLSPDiagramManager {
    readonly diagramType = StateMachineLanguage.DiagramType;
    readonly iconClass = "fa fa-project-diagram";
    readonly label = StateMachineLanguage.Label + " Editor";

    private _diagramConnector: GLSPTheiaSprottyConnector;

    constructor(
        @inject(DebugGLSPEditorManager) debugGLSPEditorManager: DebugGLSPEditorManager,
        @inject(StateMachineGLSPDiagramClient) diagramClient: StateMachineGLSPDiagramClient,
        @inject(TheiaFileSaver) fileSaver: TheiaFileSaver,
        @inject(WidgetManager) widgetManager: WidgetManager,
        @inject(EditorManager) editorManager: EditorManager,
        @inject(MessageService) messageService: MessageService,
        @inject(GLSPBreakpointManager) breakpointManager: GLSPBreakpointManager,
        @inject(ApplicationShell) shell: ApplicationShell) {
        super();
        // tslint:disable-next-line: max-line-length
        this._diagramConnector = new GLSPTheiaSprottyConnector({ diagramClient, fileSaver, editorManager, widgetManager, diagramManager: this, messageService, breakpointManager, shell });
        debugGLSPEditorManager.diagramManager = this;
    }

    get fileExtensions() {
        return [StateMachineLanguage.FileExtension];
    }
    get diagramConnector() {
        return this._diagramConnector;
    }
}
