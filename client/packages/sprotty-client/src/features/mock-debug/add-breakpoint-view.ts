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
import { inject } from "inversify";
import { Action, CommandExecutionContext, CommandReturn, SystemCommand, TYPES } from "sprotty";

import { addBreakpointView, hasBreakpoint, removeBreakpointView } from "./model";


export class AddBreakpointViewAction implements Action {
    static readonly KIND = 'addBreakpointView';
    kind = AddBreakpointViewAction.KIND;
}

export class RemoveBreakpointViewAction implements Action {
    static readonly KIND = 'removeBreakpointView';
    kind = RemoveBreakpointViewAction.KIND;
}

export class AddBreakpointViewCommand extends SystemCommand {
    static readonly KIND = AddBreakpointViewAction.KIND;

    constructor(
        @inject(TYPES.Action) public action: AddBreakpointViewAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        index.all().filter(hasBreakpoint).forEach(addBreakpointView);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        index.all().filter(hasBreakpoint).forEach(removeBreakpointView);

        return context.root;
    }

    redo(context: CommandExecutionContext): CommandReturn {
        return this.execute(context);
    }
}

export class RemoveBreakpointViewCommand extends SystemCommand {
    static readonly KIND = RemoveBreakpointViewAction.KIND;

    constructor(@inject(TYPES.Action) public action: RemoveBreakpointViewAction) {
        super();
    }

    execute(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        index.all().filter(hasBreakpoint).forEach(removeBreakpointView);
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        index.all().filter(hasBreakpoint).forEach(addBreakpointView);
        return context.root;
    }

    redo(context: CommandExecutionContext): CommandReturn {
        return this.execute(context);
    }
}
