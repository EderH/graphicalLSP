import { TreeElement, TreeSource } from "@theia/core/lib/browser/source-tree";
import { DebugState } from "@theia/debug/lib/browser/debug-session";
import { DebugSessionManager } from "@theia/debug/lib/browser/debug-session-manager";
import { inject, injectable, postConstruct } from "inversify";
import { GLSPBreakpoint } from "mock-breakpoint/lib/browser/breakpoint/breakpoint-marker";
import { MockBreakpointManager } from "mock-breakpoint/lib/browser/breakpoint/mock-breakpoint-manager";
import { DebugGLSPBreakpoint } from "mock-breakpoint/lib/browser/model/debug-glsp-breakpoint";

import { MockDebugSession } from "./mock-debug-session";

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

@injectable()
export class MockDebugBreakpointsSource extends TreeSource {

    @inject(MockBreakpointManager)
    protected readonly breakpoints: MockBreakpointManager;
    @inject(DebugSessionManager)
    protected readonly manager: DebugSessionManager;

    constructor() {
        super({
            placeholder: 'No breakpoints'
        });
    }

    @postConstruct()
    protected init(): void {
        this.fireDidChange();
        this.toDispose.push(this.breakpoints.onDidChangeGLSPBreakpoints(() => this.fireDidChange()));
        this.toDispose.push(this.manager.onDidChangeBreakpoints(() => this.fireDidChange()));
    }

    getCurrentSession(): MockDebugSession | undefined {
        const currentSession = this.manager.currentSession;
        if (currentSession && currentSession instanceof MockDebugSession) {
            return currentSession;
        }

        return undefined;
    }

    getGLSPBreakpoints(): GLSPBreakpoint[] {
        const session = this.getCurrentSession();
        if (session && session.state > DebugState.Initializing) {
            return session.getGLSPBreakpoints();
        }
        return this.breakpoints.getGLSPBreakpoints();
    }

    *getElements(): IterableIterator<TreeElement> {

        for (const breakpoint of this.getGLSPBreakpoints()) {
            yield new DebugGLSPBreakpoint(breakpoint, this.breakpoints);
        }

    }
}
