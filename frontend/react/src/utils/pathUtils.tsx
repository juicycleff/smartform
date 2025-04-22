import {FormSchema, Field, Condition, ValidationType, OptionsType,} from '@xraph/smartform-core';

/**
 * Gets all field dependencies for a specific field
 */
export function getFieldDependencies(schema: FormSchema, fieldId: string): string[] {
    const field = findFieldById(schema, fieldId);
    if (!field) return [];

    const dependencies: Set<string> = new Set();

    // Check visibility dependencies
    if (field.visible) {
        collectConditionDependencies(field.visible, dependencies);
    }

    // Check required dependencies
    if (field.requiredIf) {
        collectConditionDependencies(field.requiredIf, dependencies);
    }

    // Check enabled dependencies
    if (field.enabled) {
        collectConditionDependencies(field.enabled, dependencies);
    }

    // Check validation rule dependencies
    if (field.validationRules) {
        for (const rule of field.validationRules) {
            if (rule.type === ValidationType.REQUIRED_IF && rule.parameters) {
                collectConditionDependencies(rule.parameters as Condition, dependencies);
            }

            if (rule.type === ValidationType.DEPENDENCY && rule.parameters) {
                const params = rule.parameters as Record<string, any>;
                if (params.field) {
                    dependencies.add(params.field);
                }
            }
        }
    }

    // Check options dependencies
    if (field.options) {
        if (field.options.type === OptionsType.DEPENDENT && field.options.dependency) {
            dependencies.add(field.options.dependency.field);
        }

        if (field.options.type === OptionsType.DYNAMIC && field.options.dynamicSource?.refreshOn) {
            field.options.dynamicSource.refreshOn.forEach(dep => dependencies.add(dep));
        }
    }

    // Remove self-reference
    dependencies.delete(fieldId);

    return Array.from(dependencies);
}

/**
 * Collects field dependencies from a condition
 */
function collectConditionDependencies(condition: Condition, dependencies: Set<string>): void {
    if (!condition) return;

    switch (condition.type) {
        case 'simple':
            if (condition.field) {
                dependencies.add(condition.field);
            }
            break;

        case 'and':
        case 'or':
            if (condition.conditions) {
                condition.conditions.forEach(cond => collectConditionDependencies(cond, dependencies));
            }
            break;

        case 'not':
            if (condition.conditions && condition.conditions[0]) {
                collectConditionDependencies(condition.conditions[0], dependencies);
            }
            break;

        case 'exists':
            if (condition.field) {
                dependencies.add(condition.field);
            }
            break;

        case 'expression':
            // For expressions, we'd need more advanced parsing to extract field references
            // For simplicity, we'll skip this for now
            break;
    }
}

/**
 * Finds a field by its ID in the schema
 */
export function findFieldById(schema: FormSchema, fieldId: string): Field | null {
    // Handle dot notation for nested fields
    const parts = fieldId.split('.');

    if (parts.length === 1) {
        // Look for the field at the top level
        const field = schema.fields.find(f => f.id === fieldId);
        return field || null;
    }

    // Handle nested fields
    let current: Field | null = null;
    let fields = schema.fields;

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // Find the field at this level
        current = fields.find(f => f.id === part) || null;

        if (!current) {
            return null;
        }

        // If we've reached the last part, return the field
        if (i === parts.length - 1) {
            return current;
        }

        // Otherwise, move to the nested fields
        if (!current.nested) {
            return null;
        }

        fields = current.nested;
    }

    return null;
}

/**
 * Gets the full path for a field (for use in error messages, etc.)
 */
export function getFieldPath(fieldId: string): string[] {
    return fieldId.split('.');
}

/**
 * Gets a field's display name from its ID
 */
export function getFieldDisplayName(fieldId: string, schema: FormSchema): string {
    const field = findFieldById(schema, fieldId);
    if (!field) return fieldId;

    return field.label || fieldId;
}

/**
 * Checks if a field is an array
 */
export function isArrayField(field: Field): boolean {
    return field.type === 'array';
}

/**
 * Checks if a field ID refers to an array item
 */
export function isArrayItem(fieldId: string): boolean {
    return /\[\d+\]/.test(fieldId);
}

/**
 * Gets the parent field ID for an array item
 */
export function getArrayParentId(fieldId: string): string {
    const match = fieldId.match(/(.+)\[\d+\]/);
    return match ? match[1] : fieldId;
}

/**
 * Gets the index of an array item
 */
export function getArrayItemIndex(fieldId: string): number | null {
    const match = fieldId.match(/\[(\d+)\]/);
    return match ? parseInt(match[1], 10) : null;
}