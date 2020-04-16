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
import { GLSPDiagramWidget } from "@glsp/theia-integration/lib/browser";
import { ApplicationShell, WidgetOpenerOptions } from "@theia/core/lib/browser";
import URI from "@theia/core/lib/common/uri";
import { DebugSession } from "@theia/debug/lib/browser/debug-session";
import { DebugSource } from "@theia/debug/lib/browser/model/debug-source";
import { DebugStackFrame } from "@theia/debug/lib/browser/model/debug-stack-frame";

import { GLSPDebugEditorManager } from "../glsp-debug-editor-manager";




export class AnnotateStack {

    private actionDispatcher: IActionDispatcher;

    private shell: ApplicationShell;
    private currentFrame: DebugStackFrame;
    private session: DebugSession;
    private editorManager: GLSPDebugEditorManager;

    constructor(session: DebugSession, shell: ApplicationShell, editorManager: GLSPDebugEditorManager) {
        this.session = session;
        this.shell = shell;
        this.editorManager = editorManager;
        this.session.onDidChange(() => this.annotateStack());
    }


    private async sendAction(action: Action): Promise<void> {

        const widgets = this.shell.getWidgets("main");
        if (widgets) {
            for (const currentDiagram of widgets)
                if (currentDiagram instanceof GLSPDiagramWidget && this.currentFrame.source && currentDiagram.uri.path.base === this.currentFrame.source.uri.path.base) {
                    this.actionDispatcher = currentDiagram.actionDispatcher;
                    if (this.actionDispatcher) {
                        this.actionDispatcher.dispatch(action);
                    }
                }
        }
    }

    public async annotateStack(): Promise<void> {
        if (this.session.currentFrame && (this.currentFrame !== this.session.currentFrame)) {
            if (this.currentFrame) {
                await this.clearStackAnnotation();
            }
            this.currentFrame = this.session.currentFrame;
            setTimeout(() => 2000);
            await this.sendAction(new AnnotateStackAction(this.currentFrame.raw.name));
        }
    }

    public async clearStackAnnotation(): Promise<void> {
        await this.sendAction(new ClearStackAnnotationAction(this.currentFrame.raw.name));
    }

    get source(): DebugSource | undefined {
        return this.currentFrame && this.currentFrame.source && this.session && this.session.getSource(this.currentFrame.source);
    }

    get uri(): URI | undefined {
        return this.currentFrame && this.currentFrame.source && this.currentFrame.source.uri;
    }

    async open(options: WidgetOpenerOptions = {
        mode: 'reveal'
    }): Promise<void> {
        if (this.source) {
            await this.source.open({
                ...options
            });
        } else {
            if (this.uri) {
                await this.editorManager.open(this.uri, {
                    ...options
                });
            }
        }
    }
}
