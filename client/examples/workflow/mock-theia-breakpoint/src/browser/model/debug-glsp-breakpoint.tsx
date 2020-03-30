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
import "../../../src/browser/style/index.css";

import { DISABLED_CLASS, WidgetOpenerOptions } from "@theia/core/lib/browser";
import { TreeElement } from "@theia/core/lib/browser/source-tree";
import URI from "@theia/core/lib/common/uri";
import { DebugSource } from "@theia/debug/lib/browser/model/debug-source";
import * as React from "react";

import { GLSPBreakpoint } from "../breakpoint/breakpoint-marker";
import { DebugBreakpoint, DebugBreakpointDecoration, DebugBreakpointOptions } from "./debug-breakpoint";

export class DebugGLSPBreakpoint extends DebugBreakpoint<GLSPBreakpoint> implements TreeElement {

    constructor(readonly origin: GLSPBreakpoint, readonly options: DebugBreakpointOptions) {
        super(new URI(origin.uri), options);
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
        return super.isEnabled();
    }

    get name(): string {
        return this.origin.name;
    }

    protected readonly setBreakpointEnabled = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setEnabled(event.target.checked);
    }

    remove(): void {
        const breakpoints = this.breakpoints.getGLSPBreakpoints();
        const newBreakpoints = breakpoints.filter(b => b.id !== this.id);
        if (breakpoints.length !== newBreakpoints.length) {
            this.breakpoints.setGLSPBreakpoints(newBreakpoints);
        }
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

    protected doRender(): React.ReactNode {
        return <React.Fragment>
            <span className='line-info' title={this.labelProvider.getLongName(this.uri)}>
                <span className='name'>{this.name} </span>
                <span className='path'>{this.labelProvider.getLongName(this.uri)} </span>
            </span>
        </React.Fragment>;
    }

    protected getBreakpointDecoration(message?: string[]): DebugBreakpointDecoration {
        return {
            className: 'theia-debug-breakpoint',
            message: message || ['GLSPBreakpoint']
        };
    }

    get source(): DebugSource | undefined {
        return this.raw && this.raw.source && this.session && this.session.getSource(this.raw.source);
    }

    async open(options: WidgetOpenerOptions = {
        mode: 'reveal'
    }): Promise<void> {
        if (this.source) {
            await this.source.open({
                ...options
            });
        } else {
            await this.editorManager.open(this.uri, {
                ...options
            });
        }
    }

}
