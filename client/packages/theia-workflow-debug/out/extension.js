"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const vscode = require("vscode");
const workflow_debug_adapter_1 = require("./workflow-debug-adapter");
function activate(context) {
    // register a configuration provider for 'mock' debug type
    const provider = new ConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider(workflow_debug_adapter_1.WorkflowDebugAdapter.DebugType, provider));
}
exports.activate = activate;
function deactivate() {
    // nothing to do
}
exports.deactivate = deactivate;
class ConfigurationProvider {
    /**
     * Massage a debug configuration just before a debug session is being launched,
     * e.g. add all missing attributes to the debug configuration.
     */
    resolveDebugConfiguration(folder, config, token) {
        // if launch.json is missing or empty
        if (!config.type && !config.request && !config.name) {
            config.type = workflow_debug_adapter_1.WorkflowDebugAdapter.DebugType;
            config.name = 'Launch';
            config.request = 'launch';
            config.program = '${file}';
            config.stopOnEntry = true;
        }
        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
                return undefined; // abort launch
            });
        }
        return config;
    }
}
//# sourceMappingURL=extension.js.map