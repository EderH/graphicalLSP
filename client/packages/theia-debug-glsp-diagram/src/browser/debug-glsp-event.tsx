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
import { DISABLED_CLASS, WidgetOpenerOptions } from "@theia/core/lib/browser";
import { TreeElement } from "@theia/core/lib/browser/source-tree";
import { DebugSource } from "@theia/debug/lib/browser/model/debug-source";
import { EditorWidget } from "@theia/editor/lib/browser";
import * as React from "react";


/*export class DebugStackFrameData {
    readonly raw: DebugProtocol.StackFrame;
} */

export class GLSPDebugEvent implements TreeElement {

    readonly id: number;
    readonly element: string;
    readonly event: string;

    constructor(
        entry: any
    ) {
        this.id = entry.id;
        this.element = entry.element;
        this.event = entry.event;
    }

    /* get id(): string {
         return this.session.id + ':' + this.thread.id + ':';
     } */

    protected _source: DebugSource | undefined;
    get source(): DebugSource | undefined {
        return this._source;
    }
    update(): void {
        // this._source = this.raw.source && this.session.getSource(this.raw.source);
    }


    async open(options: WidgetOpenerOptions = {
        mode: 'reveal'
    }): Promise<EditorWidget | undefined> {
        if (!this.source) {
            return undefined;
        }
        this.source.open({
            ...options
        });
    }

    render(): React.ReactNode {
        const classNames = ['theia-debug-event-flow'];
        if (!this.source || this.source.raw.presentationHint === 'deemphasize') {
            classNames.push(DISABLED_CLASS);
        }
        return <div className={classNames.join(' ')}>
            <span className='expression' title={this.element}>{this.element + '.' + this.event}</span>

        </div>;
    }
    /*protected renderFile(): React.ReactNode {
        const { source } = this;
        if (!source) {
            return undefined;
        }
        const origin = source.raw.origin && `\n${source.raw.origin}` || '';
        return <span className='file' title={source.longName + origin}>
            <span className='name'>{source.name}</span>
            <span className='line'>{this.raw.line}:{this.raw.column}</span>
        </span>;
    } */

}
