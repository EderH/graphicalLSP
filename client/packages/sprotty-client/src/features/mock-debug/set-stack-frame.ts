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
import { VNode } from "snabbdom/vnode";
import {
    Action,
    Command,
    CommandExecutionContext,
    CommandReturn,
    IVNodePostprocessor,
    mergeStyle,
    SModelElement,
    TYPES
} from "sprotty/lib";

import { HighlightableElement, isHighlightable } from "./model";


export class SetStackFrameAction implements Action {
    static readonly KIND = 'setStackFrame';
    kind = SetStackFrameAction.KIND;
    constructor(readonly elementId: string) {
    }
}

export class ResolvedSetStackFrame {
    element: HighlightableElement;
}

@injectable()
export class SetStackFrameCommand extends Command {

    static readonly KIND = SetStackFrameAction.KIND;

    constructor(
        @inject(TYPES.Action) public action: SetStackFrameAction
    ) {
        super();
    }

    resolvedSetStackFrame: ResolvedSetStackFrame;

    execute(context: CommandExecutionContext): CommandReturn {
        const index = context.root.index;
        const element = index.getById(this.action.elementId);
        if (element && isHighlightable(element)) {
            this.resolvedSetStackFrame = { element };
            element.current = !element.current;
        }
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        if (this.resolvedSetStackFrame) {
            this.resolvedSetStackFrame.element.current = !this.resolvedSetStackFrame.element.current;
        }
        return context.root;
    }

    redo(context: CommandExecutionContext): CommandReturn {
        return this.execute(context);
    }

}

@injectable()
export class ElementHighlighter implements IVNodePostprocessor {

    decorate(vnode: VNode, element: SModelElement): VNode {
        if (isHighlightable(element)) {
            mergeStyle(vnode, { border: '1px solid #bada55' });
        }
        return vnode;
    }

    postUpdate(): void {
    }
}
