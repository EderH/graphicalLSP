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
import { Action, Command, CommandExecutionContext, SModelRoot, TYPES } from "sprotty/lib";

import { HighlightableElement, isHighlightable } from "./model";


export class SetStackFrameAction implements Action {
    static readonly KIND = 'setStackFrame';
    kind = SetStackFrameAction.KIND;
    constructor(readonly elementId: string) {
    }
}

export class ResolvedSetStackFrame {
    element: HighlightableElement;
    isCurrent: boolean;
}

@injectable()
export class SetStackFrameCommand extends Command {

    static readonly KIND = SetStackFrameAction.KIND;

    constructor(@inject(TYPES.Action) public action: SetStackFrameAction) {
        super();
    }

    resolvedSetStackFrame: ResolvedSetStackFrame;

    execute(context: CommandExecutionContext): SModelRoot {
        const index = context.root.index;
        const element = index.getById(this.action.elementId);
        if (element && isHighlightable(element)) {
            this.resolvedSetStackFrame.element = { element };
            this.resolvedSetStackFrame.isCurrent = true;

        }
        return context.root;
    }

    undo(context: CommandExecutionContext): SModelRoot {
        if (this.resolvedSetStackFrame) {
            this.resolvedSetStackFrame.isCurrent = false;
        }
        return context.root;
    }

    redo(context: CommandExecutionContext): SModelRoot {
        return this.execute(context);
    }
}
