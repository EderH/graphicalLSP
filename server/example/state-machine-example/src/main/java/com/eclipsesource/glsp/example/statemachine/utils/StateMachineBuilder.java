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


import com.eclipsesource.glsp.example.statemachine.smgraph.*;
import com.eclipsesource.glsp.graph.GCompartment;
import com.eclipsesource.glsp.graph.GEdgePlacement;
import com.eclipsesource.glsp.graph.GLabel;
import com.eclipsesource.glsp.graph.builder.AbstractGCompartmentBuilder;
import com.eclipsesource.glsp.graph.builder.AbstractGEdgeBuilder;
import com.eclipsesource.glsp.graph.builder.AbstractGNodeBuilder;
import com.eclipsesource.glsp.graph.builder.impl.GCompartmentBuilder;
import com.eclipsesource.glsp.graph.builder.impl.GEdgePlacementBuilder;
import com.eclipsesource.glsp.graph.builder.impl.GLabelBuilder;
import com.eclipsesource.glsp.graph.builder.impl.GLayoutOptionsBuilder;
import com.eclipsesource.glsp.graph.util.GConstants;

public final class StateMachineBuilder {

	public static class TransitionBuilder extends AbstractGEdgeBuilder<Transition, TransitionBuilder> {

		private String effect;
		private String trigger;

		public TransitionBuilder() {
			super(ModelTypes.TRANSITION);
		}

		public TransitionBuilder effect(String effect) {
			this.effect = effect;
			return self();
		}

		public TransitionBuilder trigger(String trigger) {
			this.trigger = trigger;
			return self();
		}

		@Override
		protected void setProperties(Transition transition) {
			super.setProperties(transition);
			transition.setEffect(effect);
			transition.setTrigger(trigger);
			transition.getChildren().add(createCompartmentTrigger(transition));
		}

		@Override
		protected Transition instantiate() {
			return SmGraphFactory.eINSTANCE.createTransition();
		}

		@Override
		protected TransitionBuilder self() {
			return this;
		}

		private GLabel createCompartmentTrigger(Transition transition) {
			return new GLabelBuilder(ModelTypes.LABEL_TEXT) //
					.id(transition.getId() + "_label_top") //
					.text(transition.getTrigger() + " | " + transition.getEffect()) //
					.edgePlacement(createEdgePlacement()) //
					.build();
		}

		private GEdgePlacement createEdgePlacement() {
			return new GEdgePlacementBuilder() //
					.side("top") //
					.position(0.8) //
					.build();
		}
	}

	public static class StateBuilder extends AbstractGNodeBuilder<State, StateBuilder> {
		private String name;
		private String kind;

		public StateBuilder(String type, String name, String kind) {
			super(type);
			this.name = name;
			this.kind = kind;

		}

		@Override
		protected State instantiate() {
			return SmGraphFactory.eINSTANCE.createState();
		}

		@Override
		protected StateBuilder self() {
			return this;
		}

		@Override
		public void setProperties(State state) {
			super.setProperties(state);
			state.setName(name);
			state.setKind(kind);
			state.setLayout(GConstants.Layout.VBOX);
			state.getChildren().add(createCompartment(state));
		}

		private GCompartment createCompartment(State state) {
			return new GCompartmentBuilder(ModelTypes.COMP_HEADER) //
					.id(state.getId() + "_header") //
					.layout(GConstants.Layout.HBOX) //
					.add(createCompartmentHeader(state)) //
					.build();
		}

		private GLabel createCompartmentHeader(State state) {
			if(state.getKind().equals("defaultState")) {
				return new GLabelBuilder(ModelTypes.LABEL_HEADING) //
						.id(state.getId() + "_classname") //
						.text(state.getName()) //
						.build();
			}
			return new GLabelBuilder((ModelTypes.LABEL_HEADING)) //
					.id(state.getId() + "_classname") //
					.text(state.getName()) //
					.alignment(10,10) //
					.build();
		}

	}

	private StateMachineBuilder() {
	}
}
