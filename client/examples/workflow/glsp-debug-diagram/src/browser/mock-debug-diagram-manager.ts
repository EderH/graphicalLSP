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
import { ApplicationShell, WidgetManager } from "@theia/core/lib/browser";
import { DebugFrontendApplicationContribution } from "@theia/debug/lib/browser/debug-frontend-application-contribution";
import { DebugSessionManager } from "@theia/debug/lib/browser/debug-session-manager";
import { DebugWidget } from "@theia/debug/lib/browser/view/debug-widget";
import { inject, injectable, postConstruct } from "inversify";

import { MockDebugBreakpointsSource } from "./debug-breakpoints-source";
import { MockEditorManager } from "./mock-editor-manager";
import { AnnotateStack } from "./stackframe/annotate-stack";


@injectable()
export class MockDebugDiagramManager {

    @inject(DebugFrontendApplicationContribution) protected readonly debugFrontend: DebugFrontendApplicationContribution;
    @inject(DebugSessionManager) protected readonly debugManager: DebugSessionManager;
    @inject(MockEditorManager) protected readonly editorManager: MockEditorManager;
    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    @inject(MockDebugBreakpointsSource) protected readonly debugSource: MockDebugBreakpointsSource;
    @inject(ApplicationShell) protected readonly shell: ApplicationShell;
    // @inject(ActiveBreakpoints) protected readonly activeBreakpoints: ActiveBreakpoints;

    private sessions = new Map<string, AnnotateStack>();

    @postConstruct()
    protected init(): void {
        this.debugManager.onDidStartDebugSession(
            session => {
                this.sessions.set(session.id, new AnnotateStack(session, this.shell));
            });
        /*this.debugManager.onDidStopDebugSession(session => {
            const annotateStack = this.sessions.get(session.id);
            if (annotateStack) {
                annotateStack.annotateStack();
            }
        });*/
        this.debugManager.onDidDestroyDebugSession(session => {
            const annotateStack = this.sessions.get(session.id);
            if (annotateStack) {
                annotateStack.clearStackAnnotation();
            }
            this.sessions.delete(session.id);
        });
        /*
                this.activeBreakpoints.onDidChangeBreakpoint(event => {
                    const breakpoints = event.breakpoints;
                    breakpoints.forEach(breakpoint => console.log("Breakpoint: " + breakpoint));
                });*/

        this.widgetManager.onDidCreateWidget(({ factoryId, widget }) => {
            if (factoryId === DebugWidget.ID && widget instanceof DebugWidget) {
                const breakpointWidget = widget['sessionWidget']['breakpoints'];
                breakpointWidget.source = this.debugSource;
            }
        });
    }
}
