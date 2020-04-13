package com.eclipsesource.glsp.example.statemachine;

import static com.eclipsesource.glsp.example.statemachine.utils.ModelTypes.*;
import static com.eclipsesource.glsp.graph.util.GraphUtil.point;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import com.eclipsesource.glsp.api.action.kind.CreateNodeOperationAction;
import com.eclipsesource.glsp.api.model.GraphicalModelState;
import com.eclipsesource.glsp.api.provider.ContextMenuItemProvider;
import com.eclipsesource.glsp.api.types.MenuItem;
import com.eclipsesource.glsp.graph.GPoint;
import com.google.common.collect.Sets;

public class StateMachineContextMenuItemProvider implements ContextMenuItemProvider {

	@Override
	public Set<MenuItem> getItems(GraphicalModelState modelState, List<String> selectedElementIds,
			Optional<GPoint> position, Map<String, String> args) {
		MenuItem newInitialState = new MenuItem("newInitialState", "Initial state",
				Arrays.asList(new CreateNodeOperationAction(STATE_INITIAL, position.orElse(point(0, 0)))), true);
		MenuItem newFinalState = new MenuItem("newFinalState", "Final State",
				Arrays.asList(new CreateNodeOperationAction(STATE_FINAL, position.orElse(point(0, 0)))), true);
		MenuItem newState = new MenuItem("newState", "State",
				Arrays.asList(new CreateNodeOperationAction(STATE_DEFAULT, position.orElse(point(0, 0)))), true);
		MenuItem newChildMenu = new MenuItem("new", "New", Arrays.asList(newInitialState,newFinalState, newState), "add", "0_new");
		return Sets.newHashSet(newChildMenu);
	}

}
