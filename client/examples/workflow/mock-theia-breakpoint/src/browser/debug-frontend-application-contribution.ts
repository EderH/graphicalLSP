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
import { CommandContribution, CommandRegistry } from "@theia/core";
import { Widget } from "@theia/core/lib/browser";
import { DebugCommands } from "@theia/debug/lib/browser/debug-frontend-application-contribution";
import { DebugBreakpointsWidget } from "@theia/debug/lib/browser/view/debug-breakpoints-widget";
import { inject, injectable } from "inversify";

import { MockBreakpointManager } from "./breakpoint/mock-breakpoint-manager";


@injectable()
export class DebugFrontendApplicationContribution implements CommandContribution {

    @inject(MockBreakpointManager) protected readonly breakpointManager: MockBreakpointManager;

    registerCommands(registry: CommandRegistry): void {
        registry.unregisterCommand(DebugCommands.ENABLE_ALL_BREAKPOINTS);
        registry.unregisterCommand(DebugCommands.DISABLE_ALL_BREAKPOINTS);
        registry.unregisterCommand(DebugCommands.REMOVE_ALL_BREAKPOINTS);
        registry.registerCommand(DebugCommands.ENABLE_ALL_BREAKPOINTS, {
            execute: () => this.breakpointManager.enableAllBreakpoints(true),
            isEnabled: () => this.breakpointManager.hasBreakpoints()
        });
        registry.registerCommand(DebugCommands.DISABLE_ALL_BREAKPOINTS, {
            execute: () => this.breakpointManager.enableAllBreakpoints(false),
            isEnabled: () => this.breakpointManager.hasBreakpoints()
        });

        registry.registerCommand(DebugCommands.REMOVE_ALL_BREAKPOINTS, {
            execute: () => this.breakpointManager.removeBreakpoints(),
            isEnabled: () => this.breakpointManager.hasBreakpoints(),
            isVisible: widget => !(widget instanceof Widget) || (widget instanceof DebugBreakpointsWidget)
        });
    }

}
