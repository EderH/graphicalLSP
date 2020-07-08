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
import { injectable } from "inversify";
import { Point, SModelRoot } from "sprotty";

import { isSelected } from "../../utils/smodel-util";
import { AddBreakpointAction, RemoveBreakpointAction } from "../glsp-debug/add-breakpoint";
import { hasBreakpointFeature } from "../glsp-debug/model";
import { MenuItem } from "./context-menu-service";
import { IContextMenuItemProvider } from "./menu-providers";

@injectable()
export class BreakpointContextMenuItemProvider implements IContextMenuItemProvider {
    getItems(root: Readonly<SModelRoot>, lastMousePosition?: Point): Promise<MenuItem[]> {
        const selectedElements = Array.from(root.index.all().filter(isSelected).filter(hasBreakpointFeature));
        return Promise.resolve([
            {
                id: "addBreakpoint",
                label: "Add Breakpoint",
                sortString: "z",
                group: "breakpoint",
                actions: [new AddBreakpointAction(selectedElements)],
                isEnabled: () => selectedElements.length > 0,
                isVisible: () => true,
                isToggled: () => false
            },
            {
                id: "removeBreakpoint",
                label: "Remove Breakpoint",
                sortString: "z",
                group: "breakpoint",
                actions: [new RemoveBreakpointAction(selectedElements)],
                isEnabled: () => selectedElements.length > 0,
                isVisible: () => true,
                isToggled: () => false
            }
        ]);
    }
}
