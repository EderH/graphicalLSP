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
import { bindContributionProvider } from "@theia/core";
import { OpenHandler } from "@theia/core/lib/browser";
import { ContainerModule } from "inversify";

import {
    DebugSessionContribution,
    DebugSessionContributionRegistry,
    DebugSessionContributionRegistryImpl,
    DebugSessionFactory,
    DefaultDebugSessionFactory
} from "./debug-session-contribution";


export default new ContainerModule(bind => {
    // add your contribution bindings here

    bindContributionProvider(bind, DebugSessionContribution);
    bind(OpenHandler).toService(DebugSessionFactory);
    bind(DebugSessionFactory).to(DefaultDebugSessionFactory).inSingletonScope();

    bind(DebugSessionContributionRegistryImpl).toSelf().inSingletonScope();
    bind(DebugSessionContributionRegistry).toService(DebugSessionContributionRegistryImpl);

});
