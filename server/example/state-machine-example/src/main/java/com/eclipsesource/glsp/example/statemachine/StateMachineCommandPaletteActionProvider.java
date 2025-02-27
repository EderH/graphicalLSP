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

import static com.eclipsesource.glsp.graph.DefaultTypes.EDGE;
import static com.eclipsesource.glsp.graph.util.GraphUtil.point;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import com.eclipsesource.glsp.api.action.kind.CreateConnectionOperationAction;
import com.eclipsesource.glsp.api.action.kind.CreateNodeOperationAction;
import com.eclipsesource.glsp.api.action.kind.DeleteOperationAction;
import com.eclipsesource.glsp.api.model.GraphicalModelState;
import com.eclipsesource.glsp.api.provider.CommandPaletteActionProvider;
import com.eclipsesource.glsp.api.types.LabeledAction;
import com.eclipsesource.glsp.example.statemachine.smgraph.State;
import com.eclipsesource.glsp.example.statemachine.utils.ModelTypes;
import com.eclipsesource.glsp.graph.GModelElement;
import com.eclipsesource.glsp.graph.GModelIndex;
import com.eclipsesource.glsp.graph.GNode;
import com.eclipsesource.glsp.graph.GPoint;
import com.google.common.collect.Sets;

public class StateMachineCommandPaletteActionProvider implements CommandPaletteActionProvider {

	@Override
	public Set<LabeledAction> getActions(GraphicalModelState modelState, List<String> selectedIds,
			Optional<GPoint> lastMousePosition, Map<String, String> args) {
		Set<LabeledAction> actions = Sets.newLinkedHashSet();

		GModelIndex index = modelState.getIndex();
		Set<GModelElement> selectedElements = index.getAll(selectedIds);

		// Create node actions are always possible
		actions.addAll(Sets.newHashSet(
				new LabeledAction("Create Initial State", "fa-plus-square",
						new CreateNodeOperationAction(ModelTypes.STATE_INITIAL,
								lastMousePosition.orElse(point(0, 0)))),
				new LabeledAction("Create Final State", "fa-plus-square",
						new CreateNodeOperationAction(ModelTypes.STATE_FINAL, lastMousePosition.orElse(point(0, 0)))),
				new LabeledAction("Create State", "fa-plus-square",
						new CreateNodeOperationAction(ModelTypes.STATE_DEFAULT, lastMousePosition.orElse(point(0, 0))))));

		// Create edge actions between two nodes
		if (selectedElements.size() == 1) {
			GModelElement element = selectedElements.iterator().next();
			if (element instanceof GNode) {
				actions.addAll(createEdgeActions((GNode) element, index.getAllByClass(State.class)));
			}
		} else if (selectedElements.size() == 2) {
			Iterator<GModelElement> iterator = selectedElements.iterator();
			GModelElement firstElement = iterator.next();
			GModelElement secondElement = iterator.next();
			if (firstElement instanceof State && secondElement instanceof State) {
				GNode firstNode = (GNode) firstElement;
				GNode secondNode = (GNode) secondElement;
				actions.add(createTransitionAction("Connect with Transition", firstNode, secondNode));
			}
		}

		// Delete action
		if (selectedElements.size() == 1) {
			actions.add(new LabeledAction("Delete", "fa-minus-square", new DeleteOperationAction(selectedIds)));
		} else if (selectedElements.size() > 1) {
			actions.add(new LabeledAction("Delete All", "fa-minus-square", new DeleteOperationAction(selectedIds)));
		}

		return actions;
	}

	private Set<LabeledAction> createEdgeActions(GNode source, Set<? extends GNode> targets) {
		Set<LabeledAction> actions = Sets.newLinkedHashSet();
		// add first all edge, then all weighted edge actions to keep a nice order
		targets.forEach(node -> actions.add(createTransitionAction("Create Transition to " + getLabel(node), source, node)));
		return actions;
	}

	private LabeledAction createTransitionAction(String label, GNode source, GNode node) {
		return new LabeledAction(label, "fa-plus-square",
				new CreateConnectionOperationAction(ModelTypes.TRANSITION, source.getId(), node.getId()));
	}

	private String getLabel(GNode node) {
		if (node instanceof State) {
			return ((State) node).getName();
		}
		return node.getId();
	}

}
