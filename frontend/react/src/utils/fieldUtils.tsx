import { FormSchema, Field, FieldType } from '@xraph/smartform-core';

/**
 * Gets the initial values for all fields in a schema
 */
export function getInitialValues(schema: FormSchema): Record<string, any> {
    const initialValues: Record<string, any> = {};

    // Process all fields recursively
    const processField = (field: Field, prefix = ''): void => {
        const fieldId = prefix ? `${prefix}.${field.id}` : field.id;

        // Set initial value based on field type
        if (field.defaultValue !== undefined) {
            initialValues[fieldId] = field.defaultValue;
        } else {
            initialValues[fieldId] = getDefaultValueForType(field.type);
        }

        // Process nested fields
        if (field.nested && field.nested.length > 0) {
            if (field.type === 'group' || field.type === 'object') {
                // For group/object fields, create a nested object
                initialValues[fieldId] = initialValues[fieldId] || {};

                field.nested.forEach(nestedField => {
                    processField(nestedField, fieldId);
                });
            } else if (field.type === 'array') {
                // For array fields, initialize with an empty array
                initialValues[fieldId] = [];
            }
        }
    };

    // Process all top-level fields
    schema.fields.forEach(field => {
        processField(field);
    });

    return initialValues;
}

/**
 * Gets the default value for a field type
 */
export function getDefaultValueForType(type: FieldType): any {
    switch (type) {
        case FieldType.TEXT:
        case FieldType.TEXTAREA:
        case FieldType.EMAIL:
        case FieldType.PASSWORD:
        case FieldType.DATE:
        case FieldType.TIME:
        case FieldType.DATETIME:
        case FieldType.COLOR:
        case FieldType.RICH_TEXT:
            return '';

        case FieldType.NUMBER:
        case FieldType.SLIDER:
        case FieldType.RATING:
            return null;

        case FieldType.SELECT:
            return null;

        case FieldType.MULTI_SELECT:
            return [];

        case FieldType.CHECKBOX:
        case FieldType.SWITCH:
            return false;

        case FieldType.RADIO:
            return null;

        case FieldType.FILE:
        case FieldType.IMAGE:
            return null;

        case FieldType.GROUP:
        case FieldType.OBJECT:
            return {};

        case FieldType.ARRAY:
            return [];

        case FieldType.ONE_OF:
        case FieldType.ANY_OF:
            return null;

        default:
            return null;
    }
}

/**
 * Creates a field ID that's safe to use in DOM elements
 */
export function createSafeFieldId(id: string): string {
    return `smartform-${id.replace(/\./g, '-').replace(/\[(\d+)\]/g, '-$1')}`;
}

/**
 * Gets options for a field
 */
export function getFieldOptions(field: Field, values: Record<string, any>): any[] {
    if (!field.options) return [];

    switch (field.options.type) {
        case 'static':
            return field.options.static || [];

        case 'dependent':
            if (field.options.dependency) {
                const dependentField = field.options.dependency.field;
                const dependentValue = values[dependentField];

                if (dependentValue !== undefined && field.options.dependency.valueMap) {
                    return field.options.dependency.valueMap[String(dependentValue)] || [];
                }
            }
            return [];

        case 'dynamic':
            // Dynamic options would typically be fetched from an API or function
            // This is a placeholder
            return [];

        default:
            return [];
    }
}

/**
 * Formats a value for display based on field type
 */
export function formatFieldValue(value: any, field: Field): string {
    if (value === null || value === undefined) {
        return '';
    }

    switch (field.type) {
        case FieldType.DATE:
            if (value instanceof Date) {
                return value.toISOString().split('T')[0];
            }
            return String(value);

        case FieldType.TIME:
            if (value instanceof Date) {
                return value.toISOString().split('T')[1].substr(0, 5);
            }
            return String(value);

        case FieldType.DATETIME:
            if (value instanceof Date) {
                return value.toISOString().replace('T', ' ').substr(0, 19);
            }
            return String(value);

        case FieldType.SELECT:
        case FieldType.RADIO:
            if (field.options && field.options.static) {
                const option = field.options.static.find(opt => opt.value === value);
                return option ? option.label : String(value);
            }
            return String(value);

        case FieldType.MULTI_SELECT:
            if (Array.isArray(value) && field.options && field.options.static) {
                return value
                    .map(v => {
                        const option = field.options?.static?.find(opt => opt.value === v);
                        return option ? option.label : String(v);
                    })
                    .join(', ');
            }
            return Array.isArray(value) ? value.join(', ') : String(value);

        case FieldType.CHECKBOX:
        case FieldType.SWITCH:
            return value ? 'Yes' : 'No';

        case FieldType.FILE:
        case FieldType.IMAGE:
            if (value && typeof value === 'object' && 'name' in value) {
                return (value as File).name;
            }
            return String(value);

        default:
            return String(value);
    }
}

/**
 * Checks if a field should be disabled
 */
export function isFieldDisabled(field: Field, values: Record<string, any>, disabled: boolean): boolean {
    if (disabled) return true;

    if (!field.enabled) return false;

    // Use conditionEvaluator to evaluate the condition
    // This is a simplified placeholder
    return false;
}

/**
 * Checks if a field should be visible
 */
export function isFieldVisible(field: Field, values: Record<string, any>): boolean {
    if (!field.visible) return true;

    // Use conditionEvaluator to evaluate the condition
    // This is a simplified placeholder
    return true;
}

/**
 * Checks if a field is required
 */
export function isFieldRequired(field: Field, values: Record<string, any>): boolean {
    if (field.required) return true;

    if (!field.requiredIf) return false;

    // Use conditionEvaluator to evaluate the condition
    // This is a simplified placeholder
    return false;
}