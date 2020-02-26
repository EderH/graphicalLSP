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
import { Action, AnnotateStackAction, ClearStackAnnotationAction, IActionDispatcher } from "@glsp/sprotty-client/lib";
import { DebugSession } from "@theia/debug/lib/browser/debug-session";
import { DebugStackFrame } from "@theia/debug/lib/browser/model/debug-stack-frame";

import { MockEditorManager } from "./mock-editor-manager";


export class AnnotateStack {

    private actionDispatcher: IActionDispatcher;

    private editorManager: MockEditorManager;
    private currentFrame: DebugStackFrame;
    private session: DebugSession;

    constructor(session: DebugSession, editorManager: MockEditorManager) {
        this.session = session;
        this.editorManager = editorManager;
        this.session.onDidChange(() => {
            if (this.session.currentFrame && (this.currentFrame !== this.session.currentFrame)) {
                if (this.currentFrame) {
                    this.sendAction(new ClearStackAnnotationAction(this.currentFrame.raw.name));
                }
                this.currentFrame = this.session.currentFrame;
                this.sendAction(new AnnotateStackAction(this.currentFrame.raw.name));
            }
        });
    }


    private sendAction(action: Action) {
        const currentEditor = this.editorManager.currentDiagramEditor;
        if (currentEditor) {
            this.actionDispatcher = currentEditor.actionDispatcher;
            if (this.actionDispatcher) {
                this.actionDispatcher.dispatch(action);
            }
        }
    }

    public clearAnnotationSet() {
        this.sendAction(new ClearStackAnnotationAction(this.currentFrame.raw.name));
    }
}
