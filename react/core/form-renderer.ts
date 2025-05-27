import type { Condition, Field, FormSchema } from "./types";
import { Validator } from "./validation-engine";

/**
 * FormRenderer converts form schemas to JSON representations for the frontend
 */
export class FormRenderer {
  private schema: FormSchema;
  private validator: Validator;

  /**
   * Creates a new form renderer
   * @param schema Form schema to render
   */
  constructor(schema: FormSchema) {
    this.schema = schema;
    this.validator = new Validator(schema);
  }

  /**
   * Converts the form schema to a JSON string
   */
  renderJson(): string {
    return JSON.stringify(this.schema, null, 2);
  }

  /**
   * Renders the form with context-specific modifications
   * @param context Context data
   */
  renderJsonWithContext(context: Record<string, any>): string {
    // Create a copy of the schema to modify
    const schemaCopy = this.copySchemaWithContext(context);

    // Convert to JSON
    return JSON.stringify(schemaCopy, null, 2);
  }

  /**
   * Creates a context-aware copy of a field
   * @param field Field to copy
   * @param context Context data
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
      properties: { ...field.properties },
      nested: [],
    };

    // Handle requiredIf condition
    if (field.requiredIf) {
      fieldCopy.requiredIf = this.copyCondition(field.requiredIf);
    }

    // Copy validation rules
    if (field.validationRules) {
      fieldCopy.validationRules = field.validationRules.map((rule) => ({
        type: rule.type,
        message: rule.message,
        parameters: rule.parameters,
      }));
    }

    // Handle visibility condition
    if (field.visible) {
      fieldCopy.visible = this.copyCondition(field.visible);
    }

    // Handle enablement condition
    if (field.enabled) {
      fieldCopy.enabled = this.copyCondition(field.enabled);

      // Evaluate if field should be disabled in this context
      if (!this.validator.evaluateCondition(field.enabled, context)) {
        fieldCopy.properties!.disabled = true;
      }
    }

    // Handle options for select-type fields
    if (field.options) {
      fieldCopy.options = this.copyOptionsWithContext(field.options, context);
    }

    // Handle nested fields
    if (field.nested && field.nested.length > 0) {
      for (const nestedField of field.nested) {
        // Skip nested fields that aren't visible in this context
        if (
          nestedField.visible &&
          !this.validator.evaluateCondition(nestedField.visible, context)
        ) {
          continue;
        }

        const nestedCopy = this.copyFieldWithContext(nestedField, context);
        fieldCopy.nested?.push(nestedCopy);
      }
    }

    return fieldCopy;
  }

  /**
   * Creates a context-aware copy of the schema
   * @param context Context data
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
      properties: { ...this.schema.properties },
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
    schemaCopy.fields.sort((a, b) => a.order - b.order);

    return schemaCopy;
  }

  /**
   * Creates a copy of a condition
   * @param condition Condition to copy
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
    if (condition.conditions && condition.conditions.length > 0) {
      conditionCopy.conditions = condition.conditions.map((subCondition) =>
        this.copyCondition(subCondition),
      );
    }

    return conditionCopy;
  }

  /**
   * Creates a context-aware copy of field options
   * @param options Options to copy
   * @param context Context data
   */
  private copyOptionsWithContext(
    options: any,
    context: Record<string, any>,
  ): any {
    if (!options) {
      return null;
    }

    const optionsCopy = {
      type: options.type,
    } as any;

    // Copy static options
    if (options.static) {
      optionsCopy.static = options.static.map((option: any) => ({
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
          : [],
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
        optionsCopy.dependency.valueMap = {} as any;

        for (const [key, values] of Object.entries(
          options.dependency.valueMap,
        )) {
          optionsCopy.dependency.valueMap[key] = (values as any[]).map(
            (opt) => ({
              value: opt.value,
              label: opt.label,
              icon: opt.icon,
            }),
          );
        }

        // Filter options based on dependent field value
        if (dependentValue !== null && dependentValue !== undefined) {
          const valueStr = String(dependentValue);
          if (options.dependency.valueMap[valueStr]) {
            optionsCopy.static = options.dependency.valueMap[valueStr].map(
              (opt: any) => ({
                value: opt.value,
                label: opt.label,
                icon: opt.icon,
              }),
            );
          }
        }
      }
    }

    return optionsCopy;
  }

  /**
   * Gets a value from the context using dot notation
   * @param context Context data
   * @param path Dot notation path
   */
  private getValueFromContext(context: Record<string, any>, path: string): any {
    return this.validator.getValueByPath(context, path);
  }
}
