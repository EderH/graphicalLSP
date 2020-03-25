/********************************************************************************
 * Copyright (C) 2018 TypeFox and others.
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
import { NodeProps, TreeNode } from "@theia/core/lib/browser";
import { SourceTreeWidget } from "@theia/core/lib/browser/source-tree";
import { MenuPath } from "@theia/core/lib/common";
import { Container, injectable, interfaces, postConstruct } from "inversify";


@injectable()
export class DebugIrgendwasWidget extends SourceTreeWidget {

    static CONTEXT_MENU: MenuPath = ['debug-irgendwas-context-menu'];
    static EDIT_MENU = [...DebugIrgendwasWidget.CONTEXT_MENU, 'a_edit'];
    static REMOVE_MENU = [...DebugIrgendwasWidget.CONTEXT_MENU, 'b_remove'];
    static ENABLE_MENU = [...DebugIrgendwasWidget.CONTEXT_MENU, 'c_enable'];
    static createContainer(parent: interfaces.Container): Container {
        const child = SourceTreeWidget.createContainer(parent, {
            contextMenuPath: DebugIrgendwasWidget.CONTEXT_MENU,
            virtualized: false,
            scrollIfActive: true
        });
        child.unbind(SourceTreeWidget);
        child.bind(DebugIrgendwasWidget).toSelf();
        return child;
    }
    static createWidget(parent: interfaces.Container): DebugIrgendwasWidget {
        return DebugIrgendwasWidget.createContainer(parent).get(DebugIrgendwasWidget);
    }


    @postConstruct()
    protected init(): void {
        super.init();
        this.id = 'debug:irgendwas:';
        this.title.label = 'IRgendwas';
    }

    protected getDefaultNodeStyle(node: TreeNode, props: NodeProps): React.CSSProperties | undefined {
        return undefined;
    }

}
