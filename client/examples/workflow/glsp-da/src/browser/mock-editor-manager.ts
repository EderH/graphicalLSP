/********************************************************************************
 * Copyright (C) 2017 TypeFox and others.
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
import { WorkflowDiagramManager } from "@glsp-examples/workflow-theia/lib/browser/diagram/workflow-diagram-manager";
import { OpenerOptions } from "@theia/core/lib/browser";
import URI from "@theia/core/lib/common/uri";
import { EditorManager, EditorWidget } from "@theia/editor/lib/browser";
import { inject, injectable } from "inversify";


// import { OpenerOptions, BaseWidget } from "@theia/core/lib/browser";
// import URI from "@theia/core/lib/common/uri";
// import { EditorWidget } from "@theia/editor/lib/browser/editor-widget";
@injectable()
export class MockEditorManager extends EditorManager {

    @inject(WorkflowDiagramManager)
    protected readonly workflowDiagramManager: WorkflowDiagramManager;

    async open(uri: URI, options?: OpenerOptions): Promise<EditorWidget> {
        const editor = await super.open(uri, options);
        this.revealSelection(editor, options);
        return editor;
    }
}
