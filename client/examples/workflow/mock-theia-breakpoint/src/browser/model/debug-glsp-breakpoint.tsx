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
import { DISABLED_CLASS } from "@theia/core/lib/browser";
import { TreeElement } from "@theia/core/lib/browser/source-tree";
import * as React from "react";

import { GLSPBreakpoint } from "../breakpoint/breakpoint-marker";
import { MockBreakpointManager } from "../breakpoint/mock-breakpoint-manager";




export class DebugGLSPBreakpoint implements TreeElement {


    constructor(readonly origin: GLSPBreakpoint, readonly breakpoints: MockBreakpointManager) {
    }

    get enabled(): boolean {
        return this.breakpoints.breakpointsEnabled && this.origin.enabled;
    }

    setEnabled(enabled: boolean): void {
        const breakpoints = this.breakpoints.getGLSPBreakpoints();
        const breakpoint = breakpoints.find(b => b.id === this.origin.id);
        if (breakpoint && breakpoint.enabled !== enabled) {
            breakpoint.enabled = enabled;
            this.breakpoints.setGLSPBreakpoints(breakpoints);
        }
    }

    protected isEnabled(): boolean {
        return this.breakpoints.breakpointsEnabled;
    }

    get name(): string {
        return this.origin.name;
    }

    protected doRender(): React.ReactNode {
        return <span className='line-info'>{this.name}</span>;
    }

    protected readonly setBreakpointEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setEnabled(event.target.checked);
    }

    render(): React.ReactNode {
        const classNames = ['theia-source-breakpoint'];
        if (!this.isEnabled()) {
            classNames.push(DISABLED_CLASS);
        }
        return <div title={this.origin.name} className={classNames.join(' ')}>
            <span className='theia-debug-breakpoint-icon' />
            <input type='checkbox' checked={this.origin.enabled} onChange={this.setBreakpointEnabled} />
            {this.doRender()}
        </div>;
    }

}
