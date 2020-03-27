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
import "../../src/browser/style/index.css";

import { CommandContribution } from "@theia/core";
import { FrontendApplicationContribution } from "@theia/core/lib/browser";
import { ContainerModule, interfaces } from "inversify";

import { MockBreakpointManager } from "./breakpoint/mock-breakpoint-manager";
import { DebugFrontendApplicationContribution } from "./debug-frontend-application-contribution";



export default new ContainerModule((bind: interfaces.Bind) => {
    // add your contribution bindings here

    bind(MockBreakpointManager).toSelf().inSingletonScope();
    bind(DebugFrontendApplicationContribution).toSelf().inSingletonScope();
    bind(CommandContribution).to(DebugFrontendApplicationContribution);
    bind(FrontendApplicationContribution).toService(DebugFrontendApplicationContribution);
});
