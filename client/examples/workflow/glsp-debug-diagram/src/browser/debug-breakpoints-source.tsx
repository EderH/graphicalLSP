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
import { LabelProvider, WidgetManager } from "@theia/core/lib/browser";
import { TreeElement, TreeSource } from "@theia/core/lib/browser/source-tree";
import { DebugState } from "@theia/debug/lib/browser/debug-session";
import { DebugSessionManager } from "@theia/debug/lib/browser/debug-session-manager";
import { DebugViewModel } from "@theia/debug/lib/browser/view/debug-view-model";
import { DebugWidget } from "@theia/debug/lib/browser/view/debug-widget";
import { inject, injectable, postConstruct } from "inversify";
import { MockBreakpointManager } from "mock-breakpoint/lib/browser/breakpoint/mock-breakpoint-manager";
import { DebugGLSPBreakpoint } from "mock-breakpoint/lib/browser/model/debug-glsp-breakpoint";

import { MockDebugSession } from "./mock-debug-session";
import { MockEditorManager } from "./mock-editor-manager";


@injectable()
export class MockDebugBreakpointsSource extends TreeSource {

    @inject(MockBreakpointManager)
    protected readonly breakpoints: MockBreakpointManager;
    @inject(DebugSessionManager)
    protected readonly manager: DebugSessionManager;
    @inject(MockEditorManager)
    protected readonly editorManager: MockEditorManager;
    @inject(LabelProvider)
    protected readonly labelProvider: LabelProvider;
    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    private viewModel: DebugViewModel;

    constructor() {
        super({
            placeholder: 'No breakpoints'
        });
    }

    @postConstruct()
    protected init(): void {
        this.fireDidChange();
        this.widgetManager.onDidCreateWidget(({ factoryId, widget }) => {
            if (factoryId === DebugWidget.ID && widget instanceof DebugWidget) {
                this.viewModel = widget['sessionWidget']['model'];
                this.toDispose.push(this.viewModel.onDidChangeBreakpoints(() => this.fireDidChange()));
                this.toDispose.push(this.breakpoints.onDidChangeGLSPBreakpoints(() => this.fireDidChange()));
            }
        });
    }

    getCurrentSession(): MockDebugSession | undefined {
        let currentSession = this.viewModel.currentSession;
        if (!currentSession) {
            currentSession = this.manager.currentSession;
        }
        if (currentSession && currentSession instanceof MockDebugSession) {
            return currentSession;
        }

        return undefined;
    }

    getGLSPBreakpoints(): DebugGLSPBreakpoint[] {
        const session = this.getCurrentSession();
        if (session && session.state > DebugState.Initializing) {
            return session.getGLSPBreakpoints();
        }
        const { labelProvider, breakpoints, editorManager } = this;
        return this.breakpoints.getGLSPBreakpoints().map(origin => new DebugGLSPBreakpoint(origin, { labelProvider, breakpoints, editorManager }));
    }

    *getElements(): IterableIterator<TreeElement> {

        for (const breakpoint of this.getGLSPBreakpoints()) {
            yield breakpoint;
        }

    }
}
