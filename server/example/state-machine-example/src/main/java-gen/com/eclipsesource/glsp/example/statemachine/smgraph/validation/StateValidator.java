/**
 *
 * $Id$
 */
package com.eclipsesource.glsp.example.statemachine.smgraph.validation;

/**
 * A sample validator interface for {@link com.eclipsesource.glsp.example.statemachine.smgraph.State}.
 * This doesn't really do anything, and it's not a real EMF artifact.
 * It was generated by the org.eclipse.emf.examples.generator.validator plug-in to illustrate how EMF's code generator can be extended.
 * This can be disabled with -vmargs -Dorg.eclipse.emf.examples.generator.validator=false.
 */
public interface StateValidator {
	boolean validate();

	boolean validateName(String value);

	boolean validateKind(String value);
}
