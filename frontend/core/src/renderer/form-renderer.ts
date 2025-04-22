import { FormSchema, Field, Condition, Option, OptionsConfig } from "../types";
import { Validator } from "../validation";

/**
 * Renderer for converting form schemas to JSON with context-specific modifications
 */
export class FormRenderer {
  private schema: FormSchema;
  private validator: Validator;

  constructor(schema: FormSchema) {
    this.schema = schema;
    this.validator = new Validator(schema);
  }

  /**
   * Convert the form schema to a JSON string
   */
  public renderJSON(): string {
    try {
      return JSON.stringify(this.schema, null, 2);
    } catch (error) {
      throw new Error(`Error rendering form: ${error}`);
    }
  }

  /**
   * Render the form with context-specific modifications
   */
  public renderJSONWithContext(context: Record<string, any>): string {
    try {
      // Create a copy of the schema to modify
      const schemaCopy = this.copySchemaWithContext(context);
      return JSON.stringify(schemaCopy, null, 2);
    } catch (error) {
      throw new Error(`Error rendering form with context: ${error}`);
    }
  }

  /**
   * Create a context-aware copy of the schema
   */
  private copySchemaWithContext(context: Record<string, any>): FormSchema {
    // Create a new schema with the same basic properties
    const schemaCopy: FormSchema = {
      id: this.schema.id,
      title: this.schema.title,
      description: this.schema.description,
      type: this.schema.type,
      authType: this.schema.authType,
      fields: [],
      properties: this.schema.properties ? { ...this.schema.properties } : {},
    };

    // Process fields based on context
    for (const field of this.schema.fields) {
      // Skip fields that should not be visible in this context
      if (
        field.visible &&
        !this.validator.evaluateCondition(field.visible, context)
      ) {
        continue;
      }

      // Include the field with possible context-specific modifications
      const fieldCopy = this.copyFieldWithContext(field, context);
      schemaCopy.fields.push(fieldCopy);
    }

    // Sort fields by order
    this.sortFields(schemaCopy.fields);

    return schemaCopy;
  }

  /**
   * Create a context-aware copy of a field
   */
  private copyFieldWithContext(
    field: Field,
    context: Record<string, any>,
  ): Field {
    // Create a new field with the same basic properties
    const fieldCopy: Field = {
      id: field.id,
      type: field.type,
      label: field.label,
      required: field.required,
      defaultValue: field.defaultValue,
      placeholder: field.placeholder,
      helpText: field.helpText,
      order: field.order,
      properties: field.properties ? { ...field.properties } : {},
      validationRules: field.validationRules
        ? [...field.validationRules]
        : undefined,
      nested: [],
    };

    // Handle visibility condition
    if (field.visible) {
      fieldCopy.visible = this.copyCondition(field.visible);
    }

    // Handle enablement condition
    if (field.enabled) {
      fieldCopy.enabled = this.copyCondition(field.enabled);

      // Evaluate if field should be disabled in this context
      if (!this.validator.evaluateCondition(field.enabled, context)) {
        fieldCopy.properties = fieldCopy.properties || {};
        fieldCopy.properties.disabled = true;
      }
    }

    // Handle options for select-type fields
    if (field.options) {
      fieldCopy.options = this.copyOptionsWithContext(field.options, context);
    }

    // Handle nested fields
    if (field.nested) {
      for (const nestedField of field.nested) {
        // Skip nested fields that aren't visible in this context
        if (
          nestedField.visible &&
          !this.validator.evaluateCondition(nestedField.visible, context)
        ) {
          continue;
        }

        const nestedCopy = this.copyFieldWithContext(nestedField, context);
        fieldCopy.nested!.push(nestedCopy);
      }
    }

    return fieldCopy;
  }

  /**
   * Create a copy of a condition
   */
  private copyCondition(condition: Condition): Condition {
    const conditionCopy: Condition = {
      type: condition.type,
      field: condition.field,
      value: condition.value,
      operator: condition.operator,
      expression: condition.expression,
    };

    // Copy nested conditions
    if (condition.conditions) {
      conditionCopy.conditions = condition.conditions.map((subCondition) =>
        this.copyCondition(subCondition),
      );
    }

    return conditionCopy;
  }

  /**
   * Create a context-aware copy of field options
   */
  private copyOptionsWithContext(
    options: OptionsConfig,
    context: Record<string, any>,
  ): OptionsConfig {
    const optionsCopy: OptionsConfig = {
      type: options.type,
    };

    // Copy static options
    if (options.static) {
      optionsCopy.static = options.static.map((option) => ({
        value: option.value,
        label: option.label,
        icon: option.icon,
      }));
    }

    // Handle dynamic options source
    if (options.dynamicSource) {
      optionsCopy.dynamicSource = {
        type: options.dynamicSource.type,
        endpoint: options.dynamicSource.endpoint,
        method: options.dynamicSource.method,
        valuePath: options.dynamicSource.valuePath,
        labelPath: options.dynamicSource.labelPath,
        refreshOn: options.dynamicSource.refreshOn
          ? [...options.dynamicSource.refreshOn]
          : undefined,
      };

      // Copy headers
      if (options.dynamicSource.headers) {
        optionsCopy.dynamicSource.headers = {
          ...options.dynamicSource.headers,
        };
      }

      // Copy parameters
      if (options.dynamicSource.parameters) {
        optionsCopy.dynamicSource.parameters = {
          ...options.dynamicSource.parameters,
        };
      }
    }

    // Handle dependent options
    if (options.dependency) {
      // Process dependent options based on context
      const dependentField = options.dependency.field;
      const dependentValue = this.getValueFromContext(context, dependentField);

      optionsCopy.dependency = {
        field: dependentField,
      };

      // Copy value map
      if (options.dependency.valueMap) {
        optionsCopy.dependency.valueMap = {};

        for (const [key, valueOptions] of Object.entries(
          options.dependency.valueMap,
        )) {
          optionsCopy.dependency.valueMap[key] = valueOptions.map((opt) => ({
            value: opt.value,
            label: opt.label,
            icon: opt.icon,
          }));
        }

        // Filter options based on dependent field value
        if (dependentValue !== undefined && dependentValue !== null) {
          const valueStr = String(dependentValue);
          if (options.dependency.valueMap[valueStr]) {
            optionsCopy.static = options.dependency.valueMap[valueStr].map(
              (opt) => ({
                value: opt.value,
                label: opt.label,
                icon: opt.icon,
              }),
            );
          }
        }
      }

      if (options.dependency.expression) {
        optionsCopy.dependency.expression = options.dependency.expression;
      }
    }

    return optionsCopy;
  }

  /**
   * Sort fields by their order property
   */
  private sortFields(fields: Field[]): void {
    // Ensure all fields have an order value
    this.ensureFieldsHaveOrder(fields);

    // Sort top-level fields
    fields.sort((a, b) => a.order - b.order);

    // Also sort nested fields recursively
    for (const field of fields) {
      if (field.nested && field.nested.length > 0) {
        this.sortFields(field.nested);
      }
    }
  }

  /**
   * Assign default order values to fields that don't have them set
   */
  private ensureFieldsHaveOrder(fields: Field[]): void {
    // First pass: count fields with explicit order
    let hasExplicitOrder = 0;
    for (const field of fields) {
      if (field.order > 0) {
        hasExplicitOrder++;
      }
    }

    // If no fields have explicit order, assign sequential order based on definition order
    if (hasExplicitOrder === 0) {
      fields.forEach((field, index) => {
        field.order = index + 1; // Start from 1 to avoid conflicts with zero values
      });
      return;
    }

    // If some fields have explicit order, assign high order values to unordered fields
    let maxOrder = 0;
    for (const field of fields) {
      if (field.order > maxOrder) {
        maxOrder = field.order;
      }
    }

    let nextOrder = maxOrder + 1;
    for (const field of fields) {
      if (field.order === 0) {
        field.order = nextOrder;
        nextOrder++;
      }
    }

    // Recursively ensure orders for nested fields
    for (const field of fields) {
      if (field.nested && field.nested.length > 0) {
        this.ensureFieldsHaveOrder(field.nested);
      }
    }
  }

  /**
   * Get a value from the context using dot notation
   */
  private getValueFromContext(context: Record<string, any>, path: string): any {
    return this.validator["getValueByPath"](context, path);
  }
}

/**
 * Create a new form renderer
 */
export function createFormRenderer(schema: FormSchema): FormRenderer {
  return new FormRenderer(schema);
}
