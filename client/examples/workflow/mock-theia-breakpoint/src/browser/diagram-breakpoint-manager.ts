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
import { LabelProvider } from "@theia/core/lib/browser";
import { EditorManager } from "@theia/editor/lib/browser";
import { inject, injectable } from "inversify";

import { FunctionBreakpoint } from "./breakpoint/breakpoint-marker";
import { MockBreakpointManager } from "./breakpoint/mock-breakpoint-manager";
import { DebugFunctionBreakpoint } from "./model/debug-function-breakpoint";


@injectable()
export class DiagramBreakpointManager {

    constructor(
        @inject(MockBreakpointManager) readonly breakpointManager: MockBreakpointManager,
        @inject(LabelProvider) readonly labelProvider: LabelProvider,
        @inject(EditorManager) readonly editorManager: EditorManager
    ) { }

    public setBreakpoints(breakpoints: FunctionBreakpoint[]) {
        if (breakpoints.length === 0) {
            this.breakpointManager.removeBreakpoints();
        } else {
            breakpoints.forEach(breakpoint => {
                const options = { labelProvider: this.labelProvider, breakpoints: this.breakpointManager, editorManager: this.editorManager };
                new DebugFunctionBreakpoint(breakpoint, options);
                console.log("Condition: " + breakpoint.raw.condition);
                this.breakpointManager.setFunctionBreakpoints(breakpoints);
            });
        }
    }
}
