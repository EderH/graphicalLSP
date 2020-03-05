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
import { inject, injectable } from "inversify";
import {
    Action,
    CommandExecutionContext,
    CommandReturn,
    MouseListener,
    SModelElement,
    SystemCommand,
    TYPES
} from "sprotty/lib";

import { Breakpoint } from "./model";

export class SetBreakpointAction implements Action {
    static readonly KIND = 'setBreakpoint';
    kind = SetBreakpointAction.KIND;
    constructor(readonly breakpointId: string) {
    }
}

@injectable()
export class SetBreakpointCommand extends SystemCommand {
    static readonly KIND = SetBreakpointAction.KIND;

    constructor(
        @inject(TYPES.Action) public action: SetBreakpointAction
    ) {
        super();
    }
    execute(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        const element = index.getById(this.action.breakpointId);
        if (element && element instanceof Breakpoint) {
            element.checked = !element.checked;
        }
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        const element = index.getById(this.action.breakpointId);
        if (element && element instanceof Breakpoint) {
            element.checked = !element.checked;
        }
        return context.root;
    }

    redo(context: CommandExecutionContext): CommandReturn {
        return this.execute(context);
    }
}

export class SetBreakpointMouseListener extends MouseListener {
    doubleClick(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const breakpoint = getBreakpoint(target);
        if (breakpoint) {
            return [new SetBreakpointAction(breakpoint.id)];
        }
        return [];
    }
}

export function getBreakpoint(element: SModelElement): Breakpoint & SModelElement | undefined {
    if (element instanceof Breakpoint) {
        return element;
    }
    return undefined;
}








