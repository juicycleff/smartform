import {Field, FormSchema, FormType} from "../types";

/**
 * Find a field in the form by its ID
 */
export function findFieldById(schema: FormSchema, id: string): Field | undefined {
    if (!schema.fields) return undefined;

    for (const field of schema.fields) {
        if (field.id === id) return field;

        // Search in nested fields if any
        if (field.nested && field.nested.length > 0) {
            const result = findNestedFieldById(field.nested, id);
            if (result) return result;
        }
    }

    return undefined;
}

/**
 * Find a field in nested fields by its ID
 */
export function findNestedFieldById(fields: Field[], id: string): Field | undefined {
    for (const field of fields) {
        if (field.id === id) return field;

        if (field.nested && field.nested.length > 0) {
            const result = findNestedFieldById(field.nested, id);
            if (result) return result;
        }
    }

    return undefined;
}

/**
 * Validate the form structure
 * This performs basic validation of the form structure, not form data
 */
export function validate(schema: FormSchema): string[] {
    const errors: string[] = [];

    // Check required form properties
    if (!schema.id) {
        errors.push("Form ID is required");
    }

    if (!schema.title) {
        errors.push("Form title is required");
    }

    // Validate fields
    if (schema.fields) {
        for (const field of schema.fields) {
            validateField(field, errors);
        }
    }

    // Check that an auth form has an auth type
    if (schema.type === FormType.AUTH && !schema.authType) {
        errors.push("Authentication form must specify an authentication type");
    }

    return errors;
}

/**
 * Validate a field structure
 */
export function validateField(field: Field, errors: string[]): void {
    // Check required field properties
    if (!field.id) {
        errors.push(
            `Field ID is required for field with label "${field.label || "unknown"}"`,
        );
    }

    // Validate nested fields
    if (field.nested && field.nested.length > 0) {
        for (const nestedField of field.nested) {
            validateField(nestedField, errors);
        }
    }

    // Field type-specific validations could be added here
}