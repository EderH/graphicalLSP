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
import { injectable } from "inversify";
import * as snabbdom from "snabbdom-jsx";
import { VNode } from "snabbdom/vnode";
import { IView, RenderingContext } from "sprotty/lib";

import { Breakpoint } from "./model";


const JSX = { createElement: snabbdom.svg };

@injectable()
export class BreakpointView implements IView {
    render(breakpoint: Breakpoint, context: RenderingContext): VNode {
        const radius = this.getRadius();
        return <g>
            <circle class-sprotty-checkbox={true}
                class-checked={breakpoint.checked}
                r={radius} cx={radius} cy={radius}
            ></circle>
        </g>;
    }

    getRadius() {
        return 6;
    }
}
