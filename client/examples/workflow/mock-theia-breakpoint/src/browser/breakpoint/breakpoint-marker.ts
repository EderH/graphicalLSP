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
import { UUID } from "@phosphor/coreutils";
import URI from "@theia/core/lib/common/uri";
import { Marker } from "@theia/markers/lib/common/marker";
import { DebugProtocol } from "vscode-debugprotocol/lib/debugProtocol";


export const BREAKPOINT_KIND = 'breakpoint';

export interface BaseBreakpoint {
    id: string;
    enabled: boolean;
}

export interface SourceBreakpoint extends BaseBreakpoint {
    uri: string;
    raw: DebugProtocol.SourceBreakpoint;
}
export namespace SourceBreakpoint {
    export function create(uri: URI, data: DebugProtocol.SourceBreakpoint, origin?: SourceBreakpoint): SourceBreakpoint {
        return {
            id: origin ? origin.id : UUID.uuid4(),
            uri: uri.toString(),
            enabled: origin ? origin.enabled : true,
            raw: {
                ...(origin && origin.raw),
                ...data
            }
        };
    }
}

export interface BreakpointMarker extends Marker<SourceBreakpoint> {
    kind: 'breakpoint'
}
export namespace BreakpointMarker {
    export function is(node: Marker<object>): node is BreakpointMarker {
        return 'kind' in node && node.kind === BREAKPOINT_KIND;
    }
}

export interface ExceptionBreakpoint {
    enabled: boolean;
    raw: DebugProtocol.ExceptionBreakpointsFilter;
}
export namespace ExceptionBreakpoint {
    export function create(data: DebugProtocol.ExceptionBreakpointsFilter, origin?: ExceptionBreakpoint): ExceptionBreakpoint {
        return {
            enabled: origin ? origin.enabled : false,
            raw: {
                ...(origin && origin.raw),
                ...data
            }
        };
    }
}

export interface FunctionBreakpoint extends BaseBreakpoint {
    raw: DebugProtocol.FunctionBreakpoint;
}
export namespace FunctionBreakpoint {
    export function create(data: DebugProtocol.FunctionBreakpoint, origin?: FunctionBreakpoint): FunctionBreakpoint {
        return {
            id: origin ? origin.id : UUID.uuid4(),
            enabled: origin ? origin.enabled : true,
            raw: {
                ...(origin && origin.raw),
                ...data
            }
        };
    }
}

export interface GLSPBreakpoint extends BaseBreakpoint {
    path: string;
    name: string;
}
export namespace GLSPBreakpoint {
    export function create(path: string, data: string, origin?: GLSPBreakpoint): GLSPBreakpoint {
        return {
            id: origin ? origin.id : UUID.uuid4(),
            path: origin ? origin.path : path,
            enabled: origin ? origin.enabled : true,
            name: origin ? origin.name : data
        };
    }
}
