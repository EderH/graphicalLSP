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
import { NodeProps, TreeNode, WidgetManager } from "@theia/core/lib/browser";
import { SourceTreeWidget } from "@theia/core/lib/browser/source-tree";
import { MenuPath } from "@theia/core/lib/common";
import { DebugViewModel } from "@theia/debug/lib/browser/view/debug-view-model";
import { DebugWidget } from "@theia/debug/lib/browser/view/debug-widget";
import { Container, inject, injectable, interfaces, postConstruct } from "inversify";

import { GLSPDebugEventsSource } from "./glsp-debug-events-source";


@injectable()
export class GLSPDebugEventsWidget extends SourceTreeWidget {

    static CONTEXT_MENU: MenuPath = ['debug-event-context-menu'];
    static createContainer(parent: interfaces.Container): Container {
        const child = SourceTreeWidget.createContainer(parent, {
            contextMenuPath: GLSPDebugEventsWidget.CONTEXT_MENU,
            virtualized: false,
            scrollIfActive: true
        });
        child.bind(GLSPDebugEventsSource).toSelf();
        child.unbind(SourceTreeWidget);
        child.bind(GLSPDebugEventsWidget).toSelf();
        return child;
    }
    static createWidget(parent: interfaces.Container): GLSPDebugEventsWidget {
        return GLSPDebugEventsWidget.createContainer(parent).get(GLSPDebugEventsWidget);
    }


    @inject(GLSPDebugEventsSource)
    protected readonly eventsSource: GLSPDebugEventsSource;
    @inject(WidgetManager)
    protected readonly widgetManager: WidgetManager;
    protected viewModel: DebugViewModel;

    @postConstruct()
    protected init(): void {
        super.init();
        this.widgetManager.onDidCreateWidget(({ factoryId, widget }) => {
            if (factoryId === DebugWidget.ID && widget instanceof DebugWidget) {
                this.viewModel = widget['sessionWidget']['model'];
                this.id = 'debug:events:' + this.viewModel.id;
            }
        });
        this.title.label = 'Events';
        this.toDispose.push(this.eventsSource);
        this.source = this.eventsSource;
    }

    protected getDefaultNodeStyle(node: TreeNode, props: NodeProps): React.CSSProperties | undefined {
        return undefined;
    }

}
