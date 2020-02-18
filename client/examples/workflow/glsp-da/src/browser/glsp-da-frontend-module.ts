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
import { OpenHandler } from "@theia/core/lib/browser";
import { DebugSessionContribution } from "@theia/debug/lib/browser/debug-session-contribution";
import { ContainerModule, interfaces } from "inversify";

import { MockDebugDiagramModifier } from "./mock-debug-diagram-modifier";
import { MockDebugSessionContribution, MockDebugSessionFactory } from "./mock-debug-session-contribution";
import { MockEditorManager } from "./mock-editor-manager";


export default new ContainerModule((bind: interfaces.Bind) => {
    // add your contribution bindings here

    bind(DebugSessionContribution).to(MockDebugSessionContribution);
    bind(MockDebugDiagramModifier).toSelf().inSingletonScope();
    bind(MockEditorManager).toSelf().inSingletonScope();
    bind(MockDebugSessionFactory).toSelf().inSingletonScope();
    bind(OpenHandler).toService(MockEditorManager);
});
