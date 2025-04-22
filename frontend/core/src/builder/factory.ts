import { AuthStrategy, FormType } from "../types";
import { FormBuilder } from "./form-builder";
import { createOption } from "./field-builder";

/**
 * Create a new regular form
 */
export function createForm(id: string, title: string): FormBuilder {
  return new FormBuilder(id, title).formType(FormType.REGULAR);
}

/**
 * Create a new authentication form
 */
export function createAuthForm(
  id: string,
  title: string,
  authType: AuthStrategy,
): FormBuilder {
  return new FormBuilder(id, title).formType(FormType.AUTH).authType(authType);
}

/**
 * Create conditions helpers
 */
export * from "./condition-builder";

/**
 * Re-export option creation utility
 */
export { createOption };
