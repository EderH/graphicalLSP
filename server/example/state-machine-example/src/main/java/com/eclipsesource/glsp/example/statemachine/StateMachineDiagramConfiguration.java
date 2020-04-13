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
package com.eclipsesource.glsp.example.statemachine;

import static com.eclipsesource.glsp.api.operations.Operation.Kind.CREATE_CONNECTION;
import static com.eclipsesource.glsp.api.operations.Operation.Kind.CREATE_NODE;
import static com.eclipsesource.glsp.example.statemachine.utils.ModelTypes.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.eclipsesource.glsp.example.statemachine.smgraph.SmGraphPackage;
import org.eclipse.emf.ecore.EClass;

import com.eclipsesource.glsp.api.diagram.DiagramConfiguration;
import com.eclipsesource.glsp.api.operations.Group;
import com.eclipsesource.glsp.api.operations.Operation;
import com.eclipsesource.glsp.api.types.EdgeTypeHint;
import com.eclipsesource.glsp.api.types.ShapeTypeHint;
import com.eclipsesource.glsp.graph.DefaultTypes;
import com.eclipsesource.glsp.graph.GraphPackage;

public class StateMachineDiagramConfiguration implements DiagramConfiguration {

	@Override
	public String getDiagramType() {
		return "state-machine-diagram";
	}

	@Override
	public List<Operation> getOperations() {
		Group nodeGroup = new Group("statemachine.nodes", "Nodes");
		Group edgeGroup = new Group("statemachine.edges", "Edges");
		Operation createInitialState = new Operation("Initial State", STATE_INITIAL, CREATE_NODE, nodeGroup);
		Operation createFinalState= new Operation("Final State", STATE_FINAL, CREATE_NODE, nodeGroup);
		Operation createState = new Operation("State", STATE_DEFAULT, CREATE_NODE, nodeGroup);

		Operation createTransition = new Operation("Transition", TRANSITION, CREATE_CONNECTION, edgeGroup);

		return Arrays.asList(createInitialState, createFinalState, createState, createTransition);
	}

	@Override
	public Map<String, EClass> getTypeMappings() {
		Map<String, EClass> mappings = DefaultTypes.getDefaultTypeMappings();
		mappings.put(LABEL_HEADING, GraphPackage.Literals.GLABEL);
		mappings.put(LABEL_TEXT, GraphPackage.Literals.GLABEL);
		mappings.put(COMP_HEADER, GraphPackage.Literals.GCOMPARTMENT);
		mappings.put(LABEL_ICON, GraphPackage.Literals.GLABEL);
		mappings.put(STATE_FINAL, SmGraphPackage.Literals.STATE);
		mappings.put(STATE_DEFAULT, SmGraphPackage.Literals.STATE);
		mappings.put(STATE_INITIAL, SmGraphPackage.Literals.STATE);
		mappings.put(TRANSITION, SmGraphPackage.Literals.TRANSITION);
		return mappings;
	}

	@Override
	public List<ShapeTypeHint> getNodeTypeHints() {
		List<ShapeTypeHint> nodeHints = new ArrayList<>();
		nodeHints.add(new ShapeTypeHint(STATE_DEFAULT, true, true, false, false));
		nodeHints.add(new ShapeTypeHint(STATE_INITIAL, true, true, false, false));
		nodeHints.add(new ShapeTypeHint(STATE_FINAL, true, true, false, false));

		return nodeHints;
	}

	@Override
	public List<EdgeTypeHint> getEdgeTypeHints() {
		List<EdgeTypeHint> edgeHints = new ArrayList<EdgeTypeHint>();
		edgeHints.add(createDefaultEdgeTypeHint(TRANSITION));
		return edgeHints;
	}

	@Override
	public EdgeTypeHint createDefaultEdgeTypeHint(String elementId) {
		EdgeTypeHint hint = DiagramConfiguration.super.createDefaultEdgeTypeHint(elementId);
		hint.setSourceElementTypeIds(
				Arrays.asList(STATE_DEFAULT,STATE_INITIAL));
		hint.setTargetElementTypeIds(
				Arrays.asList(STATE_FINAL,STATE_DEFAULT));
		return hint;
	}

}
