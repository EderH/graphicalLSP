/*******************************************************************************
 * Copyright (c) 2019 EclipseSource and others.
 *
 *   This program and the accompanying materials are made available under the
 *   terms of the Eclipse Public License v. 2.0 which is available at
 *   http://www.eclipse.org/legal/epl-2.0.
 *
 *   This Source Code may also be made available under the following Secondary
 *   Licenses when the conditions for such availability set forth in the Eclipse
 *   Public License v. 2.0 are satisfied: GNU General Public License, version 2
 *   with the GNU Classpath Exception which is available at
 *   https://www.gnu.org/software/classpath/license.html.
 *
 *   SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ******************************************************************************/
package com.eclipsesource.glsp.example.statemachine.utils;

public final class ModelTypes {
    private ModelTypes() {
    }

    public static final String LABEL_HEADING = "label:heading";
    public static final String LABEL_TEXT = "label:text";
    public static final String COMP_HEADER = "comp:header";
    public static final String LABEL_ICON = "label:icon";

    public static final String STATE_INITIAL = "state:initial";
    public static final String STATE_FINAL = "state:final";
    public static final String STATE_DEFAULT = "state:default";
    public static final String TRANSITION = "transition";

    public static String toNodeType(String type) {
        switch (type) {
            case STATE_INITIAL:
                return "initialState";
            case STATE_FINAL:
                return "finalState";
            case STATE_DEFAULT:
                return "defaultState";
        }
        return "unknown";
    }
}