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
import "sprotty-theia/css/theia-sprotty.css";

import { createStateMachineDiagramContainer } from "@glsp-examples/state-machine-sprotty/lib";
import { GLSP_TYPES, IActionDispatcher, registerDefaultTools, TYPES } from "@glsp/sprotty-client/lib";
import { GLSPTheiaDiagramServer } from "@glsp/theia-integration/lib/browser";
import { TheiaContextMenuService } from "@glsp/theia-integration/lib/browser/diagram/glsp-theia-context-menu-service";
import { SelectionService } from "@theia/core";
import { Container, inject, injectable } from "inversify";
import { DiagramConfiguration, TheiaDiagramServer, TheiaSprottySelectionForwarder } from "sprotty-theia/lib";

import { StateMachineLanguage } from "../../common/state-machine-language";

@injectable()
export class StateMachineDiagramConfiguration implements DiagramConfiguration {
    @inject(SelectionService) protected selectionService: SelectionService;
    @inject(TheiaContextMenuService) protected readonly contextMenuService: TheiaContextMenuService;

    diagramType: string = StateMachineLanguage.DiagramType;

    createContainer(widgetId: string): Container {
        const container = createStateMachineDiagramContainer(widgetId);
        container.bind(TYPES.ModelSource).to(GLSPTheiaDiagramServer).inSingletonScope();
        container.bind(TheiaDiagramServer).toService(GLSPTheiaDiagramServer);
        // container.rebind(KeyTool).to(TheiaKeyTool).inSingletonScope()
        container.bind(TYPES.IActionHandlerInitializer).to(TheiaSprottySelectionForwarder);
        container.bind(SelectionService).toConstantValue(this.selectionService);
        container.bind(GLSP_TYPES.IContextMenuService).toConstantValue(this.contextMenuService);
        if (this.contextMenuService instanceof TheiaContextMenuService) {
            this.contextMenuService.connect(container.get<IActionDispatcher>(TYPES.IActionDispatcher));
        }
        registerDefaultTools(container);
        return container;
    }
}
