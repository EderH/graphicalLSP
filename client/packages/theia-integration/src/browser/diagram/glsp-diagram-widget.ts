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
    Action,
    AddBreakpointAction,
    DiagramServer,
    IActionDispatcher,
    ModelSource,
    OperationKind,
    RemoveBreakpointAction,
    RequestModelAction,
    RequestOperationsAction,
    RequestTypeHintsAction,
    SaveModelAction,
    SModelElement,
    TYPES
} from "@glsp/sprotty-client/lib";
import { Saveable, SaveableSource } from "@theia/core/lib/browser";
import { Disposable, DisposableCollection, Emitter, Event, MaybePromise } from "@theia/core/lib/common";
import { EditorPreferences } from "@theia/editor/lib/browser";
import { Container } from "inversify";
import { FunctionBreakpoint } from "mock-breakpoint/lib/browser/breakpoint/breakpoint-marker";
import { DiagramWidget, DiagramWidgetOptions } from "sprotty-theia/lib";

import { GLSPTheiaDiagramServer, NotifyingModelSource } from "./glsp-theia-diagram-server";
import { GLSPTheiaSprottyConnector } from "./glsp-theia-sprotty-connector";

export class GLSPDiagramWidget extends DiagramWidget implements SaveableSource {

    saveable = new SaveableGLSPModelSource(this.actionDispatcher, this.diContainer.get<ModelSource>(TYPES.ModelSource));
    breakpointService = new GLSPBreakpointService(this.actionDispatcher, this.diContainer.get<ModelSource>(TYPES.ModelSource), this, this.connector);

    constructor(options: DiagramWidgetOptions, readonly widgetId: string, readonly diContainer: Container,
        readonly editorPreferences: EditorPreferences, readonly connector?: GLSPTheiaSprottyConnector) {
        super(options, widgetId, diContainer, connector);
        this.updateSaveable();
        const prefUpdater = editorPreferences.onPreferenceChanged(() => this.updateSaveable());
        this.toDispose.push(prefUpdater);
        this.toDispose.push(this.saveable);

    }

    protected updateSaveable() {
        this.saveable.autoSave = this.editorPreferences['editor.autoSave'];
        this.saveable.autoSaveDelay = this.editorPreferences['editor.autoSaveDelay'];
    }

    protected initializeSprotty() {
        const modelSource = this.diContainer.get<ModelSource>(TYPES.ModelSource);
        if (modelSource instanceof DiagramServer)
            modelSource.clientId = this.id;
        if (modelSource instanceof GLSPTheiaDiagramServer && this.connector)
            this.connector.connect(modelSource);

        this.disposed.connect(() => {
            if (modelSource instanceof GLSPTheiaDiagramServer && this.connector)
                this.connector.disconnect(modelSource);
        });

        this.actionDispatcher.dispatch(new RequestModelAction({
            sourceUri: this.options.uri.replace("file://", ""),
            needsClientLayout: `${this.viewerOptions.needsClientLayout}`,
            ...this.options
        }));
        this.actionDispatcher.dispatch(new RequestOperationsAction());
        this.actionDispatcher.dispatch(new RequestTypeHintsAction(this.options.diagramType));
    }
}

export class GLSPBreakpointService {

    protected breakpoints: FunctionBreakpoint[] = [];
    readonly breakpointsChangedEmitter: Emitter<void> = new Emitter<void>();

    constructor(
        readonly actionDispather: IActionDispatcher,
        readonly modelSource: ModelSource,
        readonly diagramWidget: GLSPDiagramWidget,
        readonly connector?: GLSPTheiaSprottyConnector
    ) {

        if (NotifyingModelSource.is(this.modelSource)) {
            const notifyingModelSource = this.modelSource as NotifyingModelSource;
            notifyingModelSource.onHandledAction((action) => {
                if (action instanceof AddBreakpointAction) {
                    this.addBreakpoint(action.selectedElements);
                } else if (action instanceof RemoveBreakpointAction) {
                    this.removeBreakpoint(action.selectedElements);
                }

            });
        }
        this.onBreakpointsChanged(() => {
            if (connector) {
                connector.sendBreakpoints(this.getBreakpoints());
            }
        });
    }

    get onBreakpointsChanged(): Event<void> {
        return this.breakpointsChangedEmitter.event;
    }

    public addBreakpoint(selectedElements: SModelElement[]) {
        for (const selectedElement of selectedElements) {
            const breakpoint = this.breakpoints.find(b => b.raw.name === selectedElement.id);
            if (!breakpoint) {
                this.breakpoints.push(FunctionBreakpoint.create({ name: selectedElement.id, condition: this.getCurrentWidgetPath() }));
            }
        }
        this.breakpointsChangedEmitter.fire();
    }

    protected getCurrentWidgetPath(): string | undefined {
        if (this.connector) {
            const widget = this.connector.shell.currentWidget;
            if (widget instanceof GLSPDiagramWidget) {
                return widget.uri.path.toString();
            }
        }
        return undefined;
    }

    public removeBreakpoint(selectedElements: SModelElement[]) {
        const oldLength = this.breakpoints.length;
        for (const selectedElement of selectedElements) {
            this.breakpoints = this.breakpoints.filter(bp => bp.raw.name !== selectedElement.id);
            if (this.breakpoints.length !== oldLength) {
            }
        }
        this.breakpointsChangedEmitter.fire();
    }

    public restoreBreakpoints() {
        // this.breakpoints.forEach(breakpoint => new AddBreakpointAction(breakpoint))
    }

    public getBreakpoints() {
        return this.breakpoints;
    }
}

export class SaveableGLSPModelSource implements Saveable, Disposable {
    isAutoSave: "on" | "off" = "on";
    autoSaveDelay: number = 500;

    private autoSaveJobs = new DisposableCollection();
    private isDirty: boolean = false;
    readonly dirtyChangedEmitter: Emitter<void> = new Emitter<void>();

    constructor(readonly actionDispatcher: IActionDispatcher, readonly modelSource: ModelSource) {
        if (NotifyingModelSource.is(this.modelSource)) {
            const notifyingModelSource = this.modelSource as NotifyingModelSource;
            notifyingModelSource.onHandledAction((action) => {
                this.dirty = this.dirty || isModelManipulation(action);
            });
        }
    }

    get onDirtyChanged(): Event<void> {
        return this.dirtyChangedEmitter.event;
    }

    save(): MaybePromise<void> {
        return this.actionDispatcher.dispatch(new SaveModelAction())
            .then(() => { this.dirty = false; });
    }

    get dirty(): boolean {
        return this.isDirty;
    }

    set dirty(newDirty: boolean) {
        const oldValue = this.isDirty;
        if (oldValue !== newDirty) {
            this.isDirty = newDirty;
            this.dirtyChangedEmitter.fire(undefined);
        }
        this.scheduleAutoSave();
    }

    set autoSave(isAutoSave: "on" | "off") {
        this.isAutoSave = isAutoSave;
        if (this.shouldAutoSave) {
            this.scheduleAutoSave();
        } else {
            this.autoSaveJobs.dispose();
        }
    }

    get autoSave(): "on" | "off" {
        return this.isAutoSave;
    }

    protected scheduleAutoSave() {
        if (this.shouldAutoSave) {
            this.autoSaveJobs.dispose();
            const autoSaveJob = window.setTimeout(() => this.doAutoSave(), this.autoSaveDelay);
            const disposableAutoSaveJob = Disposable.create(() => window.clearTimeout(autoSaveJob));
            this.autoSaveJobs.push(disposableAutoSaveJob);
        }
    }

    protected doAutoSave() {
        if (this.shouldAutoSave) {
            this.save();
        }
    }

    protected get shouldAutoSave(): boolean {
        return this.dirty && this.autoSave === 'on';
    }

    dispose(): void {
        this.autoSaveJobs.dispose();
        this.dirtyChangedEmitter.dispose();
    }
}

function isModelManipulation(action: Action): boolean {
    const kind = action.kind;
    return kind === OperationKind.CREATE_NODE ||
        kind === OperationKind.CREATE_CONNECTION ||
        kind === OperationKind.DELETE_ELEMENT ||
        kind === OperationKind.CHANGE_BOUNDS ||
        kind === OperationKind.CHANGE_CONTAINER ||
        kind === OperationKind.CREATE_CONNECTION ||
        kind === OperationKind.GENERIC;
}
