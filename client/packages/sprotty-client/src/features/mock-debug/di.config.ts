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
import "../../../css/glsp-sprotty.css";

import { ContainerModule } from "inversify";
import { configureCommand, configureView, TYPES } from "sprotty/lib";

import { AddBreakpointViewCommand, RemoveBreakpointViewCommand } from "./add-breakpoint-view";
import { Breakpoint } from "./model";
import { AddBreakpointCommand, RemoveBreakpointCommand, SetBreakpointMouseListener } from "./set-breakpoint";
import { AnnotateStackCommand, ClearStackAnnotationCommand, ElementHighlighter } from "./set-stack-frame";
import { BreakpointView } from "./view";


const glspMockDebugModule = new ContainerModule((bind, _unbind, isBound) => {
    configureCommand({ bind, isBound }, AnnotateStackCommand);
    configureCommand({ bind, isBound }, ClearStackAnnotationCommand);
    configureCommand({ bind, isBound }, AddBreakpointCommand);
    configureCommand({ bind, isBound }, RemoveBreakpointCommand);
    configureCommand({ bind, isBound }, AddBreakpointViewCommand);
    configureCommand({ bind, isBound }, RemoveBreakpointViewCommand);
    bind(TYPES.MouseListener).to(SetBreakpointMouseListener);
    bind(TYPES.IVNodePostprocessor).to(ElementHighlighter).inSingletonScope();
    configureView({ bind, isBound }, Breakpoint.TYPE, BreakpointView);
});

export default glspMockDebugModule;
