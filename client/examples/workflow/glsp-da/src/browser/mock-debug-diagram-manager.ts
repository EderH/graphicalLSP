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
import { DebugFrontendApplicationContribution } from "@theia/debug/lib/browser/debug-frontend-application-contribution";
import { DebugSessionManager } from "@theia/debug/lib/browser/debug-session-manager";
import { DebugStackFrame } from "@theia/debug/lib/browser/model/debug-stack-frame";
import { inject, injectable, postConstruct } from "inversify";

import { MockEditorManager } from "./mock-editor-manager";



@injectable()
export class MockDebugDiagramManager {

    private actionDispatcher: IActionDispatcher;

    @inject(MockEditorManager) protected readonly editorManager: MockEditorManager;
    @inject(DebugFrontendApplicationContribution) protected readonly debugFrontend: DebugFrontendApplicationContribution;
    @inject(DebugSessionManager) protected readonly debugManager: DebugSessionManager;
    private currentFrame: DebugStackFrame;

    @postConstruct()
    protected init(): void {
        this.debugManager.onDidStartDebugSession(
            current => current.onDidChange(() => {
                if (current.currentFrame && (this.currentFrame !== current.currentFrame)) {
                    if (this.currentFrame) {
                        this.sendAction(new ClearStackAnnotationAction(this.currentFrame.raw.name));
                    }
                    this.currentFrame = current.currentFrame;
                    this.sendAction(new AnnotateStackAction(this.currentFrame.raw.name));
                }
            }));
        this.debugManager.onDidDestroyDebugSession(() => this.sendAction(new ClearStackAnnotationAction(this.currentFrame.raw.name)));
    }

    protected sendAction(action: Action) {
        const currentEditor = this.editorManager.currentDiagramEditor;
        if (currentEditor) {
            this.actionDispatcher = currentEditor.actionDispatcher;
            if (this.actionDispatcher) {
                this.actionDispatcher.dispatch(action);
            }
        }
    }
}
