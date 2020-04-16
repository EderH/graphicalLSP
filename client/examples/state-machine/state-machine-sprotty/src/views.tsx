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
import {
    angleOfPoint,
    CircularNodeView,
    IView,
    Point,
    PolylineEdgeView,
    RectangularNodeView,
    RenderingContext,
    SShapeElement,
    toDegrees
} from "@glsp/sprotty-client/lib";
import { injectable } from "inversify";
import * as snabbdom from "snabbdom-jsx";
import { VNode } from "snabbdom/vnode";

import { Icon, StateNode, Transition } from "./model";

const JSX = { createElement: snabbdom.svg };

@injectable()
export class StateNodeView extends RectangularNodeView {
    render(node: StateNode, context: RenderingContext): VNode {
        const rcr = this.getRoundedCornerRadius(node);
        const graph = <g>
            <rect class-sprotty-node={true} class-state={true}
                class-mouseover={node.hoverFeedback} class-selected={node.selected} class-current={node.current} class-breakpoint={node.breakpoint}
                x={0} y={0} rx={rcr} ry={rcr}
                width={Math.max(0, node.bounds.width)} height={Math.max(0, node.bounds.height)}></rect>
            {context.renderChildren(node)}
        </g>;
        return graph;
    }

    protected getRoundedCornerRadius(node: SShapeElement): number {
        return 5;
    }
}

@injectable()
export class InitialOrFinalStateNodeView extends CircularNodeView {
    render(node: StateNode, context: RenderingContext): VNode {
        const radius = this.getRadius(node);
        return <g>
            <circle
                class-sprotty-node={true} class-state={true}
                class-initial={node.kind === 'initialState'}
                class-final={node.kind === 'finalState'}
                class-mouseover={node.hoverFeedback} class-selected={node.selected}
                class-current={node.current} class-breakpoint={node.breakpoint}
                r={radius} cx={radius} cy={radius}></circle>
            {context.renderChildren(node)}
        </g>;
    }
}

@injectable()
export class TransitionView extends PolylineEdgeView {
    protected renderAdditionals(edge: Transition, segments: Point[], context: RenderingContext): VNode[] {
        const p1 = segments[segments.length - 2];
        const p2 = segments[segments.length - 1];
        return [
            <path class-sprotty-edge={true} class-current={edge.current} class-breakpoint={edge.breakpoint} class-arrow={true} d="M 1.5,0 L 10,-4 L 10,4 Z"
                transform={`rotate(${toDegrees(angleOfPoint({ x: p1.x - p2.x, y: p1.y - p2.y }))} ${p2.x} ${p2.y}) translate(${p2.x} ${p2.y})`} />
        ];
    }
}

@injectable()
export class IconView implements IView {
    render(element: Icon, context: RenderingContext): VNode {
        const radius = this.getRadius();
        return <g>
            <circle class-sprotty-icon={true} r={radius} cx={radius} cy={radius}></circle>
            {context.renderChildren(element)}
        </g>;
    }

    getRadius() {
        return 16;
    }
}


