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
package com.eclipsesource.glsp.example.statemachine.handler;

import java.util.Optional;
import java.util.function.Function;

import com.eclipsesource.glsp.api.action.kind.AbstractOperationAction;
import com.eclipsesource.glsp.api.model.GraphicalModelState;
import com.eclipsesource.glsp.example.statemachine.smgraph.SmGraphPackage;
import com.eclipsesource.glsp.example.statemachine.utils.ModelTypes;
import com.eclipsesource.glsp.example.statemachine.utils.StateMachineBuilder;
import com.eclipsesource.glsp.graph.GNode;
import com.eclipsesource.glsp.graph.GPoint;
import com.eclipsesource.glsp.server.operationhandler.CreateNodeOperationHandler;
import com.eclipsesource.glsp.server.util.GModelUtil;

public abstract class CreateStateHandler extends CreateNodeOperationHandler {

	private Function<Integer, String> labelProvider;

	public CreateStateHandler(String elementTypeId, Function<Integer, String> labelProvider) {
		super(elementTypeId);
		this.labelProvider = labelProvider;
	}

	@Override
	protected GNode createNode(Optional<GPoint> point, GraphicalModelState modelState) {
		int nodeCounter = GModelUtil.generateId(SmGraphPackage.Literals.STATE, "state", modelState);
		String name = labelProvider.apply(nodeCounter);
		String kind = ModelTypes.toNodeType(elementTypeId);
		return new StateMachineBuilder.StateBuilder(elementTypeId, name, kind) //
				.position(point.orElse(null)) //
				.build();
	}

	@Override
	public String getLabel(AbstractOperationAction action) {
		return "Create state";
	}

}
