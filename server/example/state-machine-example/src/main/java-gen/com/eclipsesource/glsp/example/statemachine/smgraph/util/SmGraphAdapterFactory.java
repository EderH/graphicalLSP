/**
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
 */
package com.eclipsesource.glsp.example.statemachine.smgraph.util;

import com.eclipsesource.glsp.example.statemachine.smgraph.*;

import com.eclipsesource.glsp.graph.GBoundsAware;
import com.eclipsesource.glsp.graph.GEdge;
import com.eclipsesource.glsp.graph.GEdgeLayoutable;
import com.eclipsesource.glsp.graph.GLayouting;
import com.eclipsesource.glsp.graph.GModelElement;
import com.eclipsesource.glsp.graph.GNode;
import com.eclipsesource.glsp.graph.GShapeElement;

import org.eclipse.emf.common.notify.Adapter;
import org.eclipse.emf.common.notify.Notifier;

import org.eclipse.emf.common.notify.impl.AdapterFactoryImpl;

import org.eclipse.emf.ecore.EObject;

/**
 * <!-- begin-user-doc -->
 * The <b>Adapter Factory</b> for the model.
 * It provides an adapter <code>createXXX</code> method for each class of the model.
 * <!-- end-user-doc -->
 * @see com.eclipsesource.glsp.example.statemachine.smgraph.SmGraphPackage
 * @generated
 */
public class SmGraphAdapterFactory extends AdapterFactoryImpl {
	/**
	 * The cached model package.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected static SmGraphPackage modelPackage;

	/**
	 * Creates an instance of the adapter factory.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	public SmGraphAdapterFactory() {
		if (modelPackage == null) {
			modelPackage = SmGraphPackage.eINSTANCE;
		}
	}

	/**
	 * Returns whether this factory is applicable for the type of the object.
	 * <!-- begin-user-doc -->
	 * This implementation returns <code>true</code> if the object is either the model's package or is an instance object of the model.
	 * <!-- end-user-doc -->
	 * @return whether this factory is applicable for the type of the object.
	 * @generated
	 */
	@Override
	public boolean isFactoryForType(Object object) {
		if (object == modelPackage) {
			return true;
		}
		if (object instanceof EObject) {
			return ((EObject) object).eClass().getEPackage() == modelPackage;
		}
		return false;
	}

	/**
	 * The switch that delegates to the <code>createXXX</code> methods.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @generated
	 */
	protected SmGraphSwitch<Adapter> modelSwitch = new SmGraphSwitch<Adapter>() {
		@Override
		public Adapter caseState(State object) {
			return createStateAdapter();
		}

		@Override
		public Adapter caseTransition(Transition object) {
			return createTransitionAdapter();
		}

		@Override
		public Adapter caseGModelElement(GModelElement object) {
			return createGModelElementAdapter();
		}

		@Override
		public Adapter caseGBoundsAware(GBoundsAware object) {
			return createGBoundsAwareAdapter();
		}

		@Override
		public Adapter caseGShapeElement(GShapeElement object) {
			return createGShapeElementAdapter();
		}

		@Override
		public Adapter caseGEdgeLayoutable(GEdgeLayoutable object) {
			return createGEdgeLayoutableAdapter();
		}

		@Override
		public Adapter caseGLayouting(GLayouting object) {
			return createGLayoutingAdapter();
		}

		@Override
		public Adapter caseGNode(GNode object) {
			return createGNodeAdapter();
		}

		@Override
		public Adapter caseGEdge(GEdge object) {
			return createGEdgeAdapter();
		}

		@Override
		public Adapter defaultCase(EObject object) {
			return createEObjectAdapter();
		}
	};

	/**
	 * Creates an adapter for the <code>target</code>.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param target the object to adapt.
	 * @return the adapter for the <code>target</code>.
	 * @generated
	 */
	@Override
	public Adapter createAdapter(Notifier target) {
		return modelSwitch.doSwitch((EObject) target);
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.example.statemachine.smgraph.State <em>State</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.example.statemachine.smgraph.State
	 * @generated
	 */
	public Adapter createStateAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.example.statemachine.smgraph.Transition <em>Transition</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.example.statemachine.smgraph.Transition
	 * @generated
	 */
	public Adapter createTransitionAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.graph.GModelElement <em>GModel Element</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.graph.GModelElement
	 * @generated
	 */
	public Adapter createGModelElementAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.graph.GBoundsAware <em>GBounds Aware</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.graph.GBoundsAware
	 * @generated
	 */
	public Adapter createGBoundsAwareAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.graph.GShapeElement <em>GShape Element</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.graph.GShapeElement
	 * @generated
	 */
	public Adapter createGShapeElementAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.graph.GEdgeLayoutable <em>GEdge Layoutable</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.graph.GEdgeLayoutable
	 * @generated
	 */
	public Adapter createGEdgeLayoutableAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.graph.GLayouting <em>GLayouting</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.graph.GLayouting
	 * @generated
	 */
	public Adapter createGLayoutingAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.graph.GNode <em>GNode</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.graph.GNode
	 * @generated
	 */
	public Adapter createGNodeAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for an object of class '{@link com.eclipsesource.glsp.graph.GEdge <em>GEdge</em>}'.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null so that we can easily ignore cases;
	 * it's useful to ignore a case when inheritance will catch all the cases anyway.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @see com.eclipsesource.glsp.graph.GEdge
	 * @generated
	 */
	public Adapter createGEdgeAdapter() {
		return null;
	}

	/**
	 * Creates a new adapter for the default case.
	 * <!-- begin-user-doc -->
	 * This default implementation returns null.
	 * <!-- end-user-doc -->
	 * @return the new adapter.
	 * @generated
	 */
	public Adapter createEObjectAdapter() {
		return null;
	}

} //SmGraphAdapterFactory
