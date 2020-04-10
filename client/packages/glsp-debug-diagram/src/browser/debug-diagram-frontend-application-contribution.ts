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
import {
    DisableBreakpointAction,
    EnableBreakpointAction,
    RemoveBreakpointAction,
    SModelElement,
    SModelRoot,
    SModelRootListener
} from "@glsp/sprotty-client/lib";
import { GLSPDiagramWidget } from "@glsp/theia-integration/lib/browser";
import { CommandContribution, CommandRegistry } from "@theia/core";
import { ApplicationShell, Widget, WidgetManager } from "@theia/core/lib/browser";
import { DebugCommands } from "@theia/debug/lib/browser/debug-frontend-application-contribution";
import { DebugSessionManager } from "@theia/debug/lib/browser/debug-session-manager";
import { DebugBreakpointsWidget } from "@theia/debug/lib/browser/view/debug-breakpoints-widget";
import { DebugWidget } from "@theia/debug/lib/browser/view/debug-widget";
import { inject, injectable, postConstruct } from "inversify";
import { MockBreakpointManager } from "mock-breakpoint/lib/browser/breakpoint/mock-breakpoint-manager";

import { MockDebugBreakpointsSource } from "./debug-breakpoints-source";
import { MockEditorManager } from "./mock-editor-manager";
import { AnnotateStack } from "./stackframe/annotate-stack";


@injectable()
export class DebugDiagramFrontendApplicationContribution implements CommandContribution, SModelRootListener {


    @inject(MockBreakpointManager) protected readonly breakpointManager: MockBreakpointManager;
    @inject(DebugSessionManager) protected readonly debugManager: DebugSessionManager;
    @inject(MockEditorManager) protected readonly editorManager: MockEditorManager;
    @inject(WidgetManager) protected readonly widgetManager: WidgetManager;
    @inject(MockDebugBreakpointsSource) protected readonly debugSource: MockDebugBreakpointsSource;
    @inject(ApplicationShell) protected readonly shell: ApplicationShell;

    private sessions = new Map<string, AnnotateStack>();

    @postConstruct()
    protected init(): void {
        this.debugManager.onDidStartDebugSession(
            session => {
                this.sessions.set(session.id, new AnnotateStack(session, this.shell, this.editorManager));
            });

        this.debugManager.onDidDestroyDebugSession(session => {
            const annotateStack = this.sessions.get(session.id);
            if (annotateStack) {
                annotateStack.clearStackAnnotation();
            }
            this.sessions.delete(session.id);
        });

        this.widgetManager.onDidCreateWidget(({ factoryId, widget }) => {
            if (factoryId === DebugWidget.ID && widget instanceof DebugWidget) {
                const breakpointWidget = widget['sessionWidget']['breakpoints'];
                breakpointWidget.source = this.debugSource;
            }
            if (widget instanceof GLSPDiagramWidget) {
                // this.restorBreakpoints(widget);
            }
        });

        this.shell.onDidAddWidget(widget => {
            if (widget instanceof GLSPDiagramWidget) {

            }
        });
    }

    modelRootChanged(root: Readonly<SModelRoot>): void {
        console.log("MODEL CHANGED ASWEELLLLL");
        if (root && root instanceof GLSPDiagramWidget) {
            this.restorBreakpoints(root);
        }
    }

    registerCommands(registry: CommandRegistry): void {
        registry.unregisterCommand(DebugCommands.ENABLE_ALL_BREAKPOINTS);
        registry.unregisterCommand(DebugCommands.DISABLE_ALL_BREAKPOINTS);
        registry.unregisterCommand(DebugCommands.REMOVE_ALL_BREAKPOINTS);
        registry.registerCommand(DebugCommands.ENABLE_ALL_BREAKPOINTS, {
            execute: () => { this.breakpointManager.enableAllBreakpoints(true); this.setEnableAllBreakpoints(true); },
            isEnabled: () => this.breakpointManager.hasBreakpoints()
        });
        registry.registerCommand(DebugCommands.DISABLE_ALL_BREAKPOINTS, {
            execute: () => { this.breakpointManager.enableAllBreakpoints(false); this.setEnableAllBreakpoints(false); },
            isEnabled: () => this.breakpointManager.hasBreakpoints()
        });

        registry.registerCommand(DebugCommands.REMOVE_ALL_BREAKPOINTS, {
            execute: () => this.removeAllBreakpoints(),
            isEnabled: () => this.breakpointManager.hasBreakpoints(),
            isVisible: widget => !(widget instanceof Widget) || (widget instanceof DebugBreakpointsWidget)
        });
    }

    restorBreakpoints(widget: GLSPDiagramWidget) {
        const bpMap = this.getAllBreakpointsByDiagram();
        if (bpMap) {
            const breakpoints = bpMap.get(widget.uri.path.toString());
            if (breakpoints) {
                widget.actionDispatcher.dispatch(new EnableBreakpointAction(breakpoints));
            }
        }
    }

    getAllBreakpointsByDiagram(): Map<string, SModelElement[]> {
        const bpMap: Map<string, SModelElement[]> = new Map;
        for (const breakpoint of this.breakpointManager.getGLSPBreakpoints()) {
            let bps = bpMap.get(breakpoint.uri);
            if (!bps) {
                bps = new Array<SModelElement>();
                bpMap.set(breakpoint.uri, bps);
            }
            bps.push(breakpoint.element);
        }
        return bpMap;
    }

    setEnableAllBreakpoints(enable: boolean) {
        const bpMap = this.getAllBreakpointsByDiagram();
        for (const key of bpMap.keys()) {
            const breakpoints = bpMap.get(key);
            if (breakpoints) {
                if (enable) {
                    this.enableDiagramBreakpoints(key, breakpoints);
                } else {
                    this.disableDiagramBreakpoints(key, breakpoints);
                }
            }
        }
    }

    enableDiagramBreakpoints(diagramUri: string, breakpoints: SModelElement[]) {
        const widget = this.findWidget(diagramUri);
        if (widget) {
            widget.actionDispatcher.dispatch(new EnableBreakpointAction(breakpoints));
        }
    }

    disableDiagramBreakpoints(diagramUri: string, breakpoints: SModelElement[]) {
        const widget = this.findWidget(diagramUri);
        if (widget) {
            widget.actionDispatcher.dispatch(new DisableBreakpointAction(breakpoints));
        }
    }

    removeAllBreakpoints() {
        const bpMap = this.getAllBreakpointsByDiagram();
        for (const key of bpMap.keys()) {
            const breakpoints = bpMap.get(key);
            if (breakpoints) {
                this.removeDiagramBreakpoints(key, breakpoints);
            }
        }
    }

    removeDiagramBreakpoints(diagramUri: string, breakpoints: SModelElement[]) {
        const widget = this.findWidget(diagramUri);
        if (widget) {
            widget.actionDispatcher.dispatch(new RemoveBreakpointAction(breakpoints));
        }
    }

    findWidget(diagramUri: string): GLSPDiagramWidget | undefined {
        const widgets = this.shell.getWidgets("main").filter(w => w instanceof GLSPDiagramWidget) as GLSPDiagramWidget[];
        const widget = widgets.find(w => w.uri.path.toString() === diagramUri);
        if (widget) {
            return widget;
        }
        return undefined;
    }
}
