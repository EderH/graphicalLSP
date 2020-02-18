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
import { SetStackFrameAction } from "@glsp/sprotty-client/lib/";
import { DebugViewModel } from "@theia/debug/lib/browser/view/debug-view-model";
import { inject, injectable, postConstruct } from "inversify";
import { IActionDispatcher } from "sprotty";
import { DiagramWidget } from "sprotty-theia/lib";

import { MockEditorManager } from "./mock-editor-manager";

@injectable()
export class MockDebugDiagramModifier {

    protected actionDispatcher: IActionDispatcher;

    @inject(MockEditorManager)
    protected readonly editorManager: MockEditorManager;

    @inject(DebugViewModel)
    protected readonly viewModel: DebugViewModel;

    @postConstruct()
    protected init(): void {
        this.viewModel.onDidChange(() => this.setCurrentStackFrameElement());
    }

    protected setCurrentStackFrameElement() {
        const currentEditor = this.editorManager.currentEditor;
        if (currentEditor && (currentEditor instanceof DiagramWidget)) {
            this.actionDispatcher = currentEditor.actionDispatcher;
            if (this.actionDispatcher && this.viewModel.currentFrame) {
                const elementId = this.viewModel.currentFrame.raw.name;
                this.actionDispatcher.dispatch(new SetStackFrameAction(elementId));
            }
        }
    }
}
