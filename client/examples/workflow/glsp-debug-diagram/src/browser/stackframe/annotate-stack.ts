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
import { ApplicationShell } from "@theia/core/lib/browser";
import { DebugSession } from "@theia/debug/lib/browser/debug-session";
import { DebugStackFrame } from "@theia/debug/lib/browser/model/debug-stack-frame";




export class AnnotateStack {

    private actionDispatcher: IActionDispatcher;

    private shell: ApplicationShell;
    private currentFrame: DebugStackFrame;
    private session: DebugSession;

    constructor(session: DebugSession, shell: ApplicationShell) {
        this.session = session;
        this.shell = shell;
        this.session.onDidChange(() => this.annotateStack());
    }


    private sendAction(action: Action) {
        const widgets = this.shell.widgets;
        for (const currentDiagram of widgets)
            if (currentDiagram instanceof GLSPDiagramWidget && this.currentFrame.source && currentDiagram.uri.path.base === this.currentFrame.source.uri.path.base) {
                this.actionDispatcher = currentDiagram.actionDispatcher;
                if (this.actionDispatcher) {
                    this.actionDispatcher.dispatch(action);
                }
            }
    }

    public async annotateStack() {
        if (this.session.currentFrame && (this.currentFrame !== this.session.currentFrame)) {
            if (this.currentFrame) {
                this.clearStackAnnotation();
            }
            this.currentFrame = this.session.currentFrame;
            this.sendAction(new AnnotateStackAction(this.currentFrame.raw.name));
        }
    }

    public clearStackAnnotation() {
        this.sendAction(new ClearStackAnnotationAction(this.currentFrame.raw.name));
    }
}
