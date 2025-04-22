import { parse, evaluate } from 'cel-js';

import {
  FormSchema,
  Field,
  Condition,
  ConditionType,
  ValidationRule,
  ValidationType,
  ValidationResult,
} from "../types";

/**
 * Class for validating forms against their schema
 */
export class Validator {
  private schema: FormSchema;

  constructor(schema: FormSchema) {
    this.schema = schema;
  }

  /**
   * Validate a form data object against the schema
   */
  public validateForm(data: Record<string, any>): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
    };

    // Validate each field
    for (const field of this.schema.fields) {
      this.validateField(field, data, "", result);
    }

    result.valid = result.errors?.length === 0;
    return result;
  }

  /**
   * Validate a single field and its nested fields if applicable
   */
  private validateField(
    field: Field,
    data: Record<string, any>,
    prefix: string,
    result: ValidationResult,
  ): void {
    const fieldPath = prefix ? `${prefix}.${field.id}` : field.id;

    // Skip validation if field is not visible
    if (field.visible && !this.evaluateCondition(field.visible, data)) {
      return;
    }

    // Get field value (support nested path like "address.street")
    const value = this.getValueByPath(data, fieldPath);

    // Check required fields
    if (field.required) {
      const isEmpty = this.isEmpty(value);
      if (isEmpty) {
        if (result.errors) {
          result.errors.push({
            fieldId: fieldPath,
            message: `${field.label} is required`,
            ruleType: ValidationType.REQUIRED,
          });
        }
      }
    }
    
    // Check conditional required (requiredIf)
    if (field.requiredIf && this.evaluateCondition(field.requiredIf, data)) {
      const isEmpty = this.isEmpty(value);
      if (isEmpty) {
        if (result.errors) {
          result.errors.push({
            fieldId: fieldPath,
            message: `${field.label} is required based on other field values`,
            ruleType: ValidationType.REQUIRED_IF,
          });
        }
      }
    }

    // Skip other validations if value is empty and not required
    if (this.isEmpty(value)) {
      return;
    }

    // Apply field-specific validations
    if (field.validationRules) {
      for (const rule of field.validationRules) {
        const [valid, message] = this.applyValidationRule(
          rule,
          value,
          field,
          data,
        );
        if (!valid) {
          if (result.errors) {
            result.errors.push({
              fieldId: fieldPath,
              message,
              ruleType: rule.type,
            });
          }
        }
      }
    }

    // Handle nested fields (for group, object types)
    if (field.type === "group" || field.type === "object") {
      const nestedData: Record<string, any> = {};
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.assign(nestedData, value);
      }

      if (field.nested) {
        for (const nestedField of field.nested) {
          this.validateField(nestedField, nestedData, fieldPath, result);
        }
      }
    }

    // Handle array fields
    if (field.type === "array" && Array.isArray(value)) {
      if (field.nested && field.nested.length > 0) {
        const template = field.nested[0];

        for (let i = 0; i < value.length; i++) {
          const item = value[i];
          if (item && typeof item === "object") {
            this.validateField(template, item, `${fieldPath}[${i}]`, result);
          }
        }
      }
    }

    // Handle oneOf fields (exactly one nested field must be valid)
    if (field.type === "oneOf") {
      // Implementation would check that exactly one option is selected
      // This is typically handled in UI logic
    }

    // Handle anyOf fields (at least one nested field must be valid)
    if (field.type === "anyOf") {
      // Implementation would check that at least one option is selected
      // This is typically handled in UI logic
    }
  }

  /**
   * Apply a specific validation rule to a value
   * Returns [valid, message]
   */
  private applyValidationRule(
    rule: ValidationRule,
    value: any,
    field: Field,
    data: Record<string, any>,
  ): [boolean, string] {
    switch (rule.type) {
      case ValidationType.REQUIRED:
        return [!this.isEmpty(value), rule.message];

      case ValidationType.MIN_LENGTH:
        if (typeof value === "string") {
          const minLength = rule.parameters as number;
          return [value.length >= minLength, rule.message];
        }
        return [false, rule.message];

      case ValidationType.MAX_LENGTH:
        if (typeof value === "string") {
          const maxLength = rule.parameters as number;
          return [value.length <= maxLength, rule.message];
        }
        return [false, rule.message];

      case ValidationType.PATTERN:
        if (typeof value === "string") {
          const pattern = rule.parameters as string;
          try {
            const regex = new RegExp(pattern);
            return [regex.test(value), rule.message];
          } catch (e) {
            return [false, "Invalid pattern"];
          }
        }
        return [false, rule.message];

      case ValidationType.MIN:
        if (typeof value === "number") {
          const min = rule.parameters as number;
          return [value >= min, rule.message];
        }
        return [false, rule.message];

      case ValidationType.MAX:
        if (typeof value === "number") {
          const max = rule.parameters as number;
          return [value <= max, rule.message];
        }
        return [false, rule.message];

      case ValidationType.EMAIL:
        if (typeof value === "string") {
          // Simple email regex - a production system would use a more comprehensive one
          const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
          return [emailRegex.test(value), rule.message];
        }
        return [false, rule.message];

      case ValidationType.URL:
        if (typeof value === "string") {
          // Simple URL regex - a production system would use a more comprehensive one
          const urlRegex = /^(http|https):\/\/[^\s/$.?#].[^\s]*$/;
          return [urlRegex.test(value), rule.message];
        }
        return [false, rule.message];

      case ValidationType.REQUIRED_IF:
        // The parameters should be a Condition object
        const condition = rule.parameters as Condition;
        if (this.evaluateCondition(condition, data)) {
          return [!this.isEmpty(value), rule.message];
        }
        return [true, ""];

      case ValidationType.FILE_TYPE:
        // todo: missing implementation
        // Implementation would check file extension or MIME type
        return [true, ""];

      case ValidationType.FILE_SIZE:
        // todo: missing implementation
        // Implementation would check file size
        return [true, ""];

      case ValidationType.IMAGE_DIMENSIONS:
        // todo: missing implementation
        // Implementation would check image dimensions
        return [true, ""];

      case ValidationType.DEPENDENCY:
        // Implementation would check dependencies between fields
        return [this.validateDependency(rule, field, data), rule.message];

      case ValidationType.UNIQUE:
        // todo: missing implementation
        // Would typically require access to a data store to verify uniqueness
        return [true, ""];

      case ValidationType.CUSTOM:
        // todo: missing implementation
        // Custom validation would be implemented by the application
        return [true, ""];

      default:
        return [true, ""];
    }
  }

  /**
   * Check if a field's value satisfies a dependency rule
   */
  private validateDependency(
    rule: ValidationRule,
    field: Field,
    data: Record<string, any>,
  ): boolean {
    if (rule.parameters && typeof rule.parameters === "object") {
      const params = rule.parameters as Record<string, any>;
      const dependsOn = params.field as string;
      const operator = params.operator as string;
      const expectedValue = params.value;

      const dependentValue = this.getValueByPath(data, dependsOn);

      switch (operator) {
        case "eq":
          return this.deepEquals(dependentValue, expectedValue);
        case "neq":
          return !this.deepEquals(dependentValue, expectedValue);
        case "gt":
          if (
            typeof dependentValue === "number" &&
            typeof expectedValue === "number"
          ) {
            return dependentValue > expectedValue;
          }
          return false;
        case "lt":
          if (
            typeof dependentValue === "number" &&
            typeof expectedValue === "number"
          ) {
            return dependentValue < expectedValue;
          }
          return false;
        default:
          return false;
      }
    }
    return false;
  }

  /**
   * Evaluate a condition against form data
   */
  public evaluateCondition(
    condition: Condition,
    data: Record<string, any>,
  ): boolean {
    switch (condition.type) {
      case ConditionType.SIMPLE:
        if (!condition.field) return false;

        const fieldValue = this.getValueByPath(data, condition.field);

        switch (condition.operator) {
          case "eq":
            return this.deepEquals(fieldValue, condition.value);
          case "neq":
            return !this.deepEquals(fieldValue, condition.value);
          case "contains":
            if (
              typeof fieldValue === "string" &&
              typeof condition.value === "string"
            ) {
              return fieldValue.includes(condition.value);
            }
            return false;
          case "startsWith":
            if (
              typeof fieldValue === "string" &&
              typeof condition.value === "string"
            ) {
              return fieldValue.startsWith(condition.value);
            }
            return false;
          case "endsWith":
            if (
              typeof fieldValue === "string" &&
              typeof condition.value === "string"
            ) {
              return fieldValue.endsWith(condition.value);
            }
            return false;
          case "gt":
            if (
              typeof fieldValue === "number" &&
              typeof condition.value === "number"
            ) {
              return fieldValue > condition.value;
            }
            return false;
          case "gte":
            if (
              typeof fieldValue === "number" &&
              typeof condition.value === "number"
            ) {
              return fieldValue >= condition.value;
            }
            return false;
          case "lt":
            if (
              typeof fieldValue === "number" &&
              typeof condition.value === "number"
            ) {
              return fieldValue < condition.value;
            }
            return false;
          case "lte":
            if (
              typeof fieldValue === "number" &&
              typeof condition.value === "number"
            ) {
              return fieldValue <= condition.value;
            }
            return false;
          default:
            return false;
        }

      case ConditionType.AND:
        if (!condition.conditions) return false;
        return condition.conditions.every((subCondition) =>
          this.evaluateCondition(subCondition, data),
        );

      case ConditionType.OR:
        if (!condition.conditions) return false;
        return condition.conditions.some((subCondition) =>
          this.evaluateCondition(subCondition, data),
        );

      case ConditionType.NOT:
        if (!condition.conditions || condition.conditions.length === 0)
          return false;
        return !this.evaluateCondition(condition.conditions[0], data);

      case ConditionType.EXISTS:
        if (!condition.field) return false;
        const value = this.getValueByPath(data, condition.field);
        return !this.isEmpty(value);

      case ConditionType.EXPRESSION:
        return this.evaluateExpression(condition.expression, data);

      default:
        return false;
    }
  }

  /**
   * Evaluates a CEL expression with the given data context
   * @param expression The CEL expression to evaluate
   * @param data The data to use as context for the expression
   * @returns boolean result of the expression evaluation
   */
  private evaluateExpression(
      expression: string | undefined,
      data: Record<string, any>,
  ): boolean {
    // If no expression is provided, return true by default
    if (!expression) {
      return true;
    }

    try {
      // Parse the expression
      const parsedExpr = parse(expression);
      if (!parsedExpr.isSuccess) {
        console.error('CEL expression parsing error:', 'Invalid expression:');
        return false;
      }
      // Define the context with data
      const context = {
        data: data
      };

      // Evaluate the expression
      const result = evaluate(expression, context);

      // Check if result is a boolean
      if (typeof result === 'boolean') {
        return result;
      }

      // If result is truthy/falsy but not a boolean, convert it
      return Boolean(result);
    } catch (error) {
      console.error('Failed to evaluate expression:', expression, error);
      return false;
    }
  }

  /**
   * Check if a value is empty
   */
  private isEmpty(value: any): boolean {
    if (value === undefined || value === null) {
      return true;
    }

    if (typeof value === "string") {
      return value.trim() === "";
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    if (typeof value === "object") {
      return Object.keys(value).length === 0;
    }

    if (typeof value === "number") {
      return false; // Numbers are never empty
    }

    if (typeof value === "boolean") {
      return false; // Booleans are never empty
    }

    return false;
  }

  /**
   * Retrieve a value from nested objects using a dot notation path
   */
  private getValueByPath(data: Record<string, any>, path: string): any {
    const parts = path.split(".");

    // Handle array indexing (path[0] syntax)
    const arrayRegex = /^(.+)\[(\d+)\]$/;

    let current = data;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      // Check if part contains array index
      const matches = part.match(arrayRegex);

      if (matches) {
        // It's an array access
        const fieldName = matches[1];
        const indexStr = matches[2];
        const index = parseInt(indexStr, 10);

        // Get the array
        const arr = current[fieldName];
        if (!arr || !Array.isArray(arr) || index < 0 || index >= arr.length) {
          return undefined;
        }

        // If this is the last part, return the array element
        if (i === parts.length - 1) {
          return arr[index];
        }

        // Otherwise, ensure the element is an object and continue
        if (typeof arr[index] === "object" && arr[index] !== null) {
          current = arr[index];
        } else {
          return undefined;
        }
      } else {
        // Regular field access
        if (i === parts.length - 1) {
          return current[part];
        }

        if (current[part] && typeof current[part] === "object") {
          current = current[part];
        } else {
          return undefined;
        }
      }
    }

    return undefined;
  }

  /**
   * Deep equality check for objects and primitives
   */
  private deepEquals(a: any, b: any): boolean {
    if (a === b) return true;

    if (a === null || b === null || a === undefined || b === undefined) {
      return a === b;
    }

    if (typeof a !== typeof b) return false;

    if (typeof a === "object") {
      if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;

        for (let i = 0; i < a.length; i++) {
          if (!this.deepEquals(a[i], b[i])) return false;
        }

        return true;
      }

      if (Array.isArray(a) || Array.isArray(b)) return false;

      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!b.hasOwnProperty(key)) return false;
        if (!this.deepEquals(a[key], b[key])) return false;
      }

      return true;
    }

    return false;
  }
}

/**
 * Create a new validator
 */
export function createValidator(schema: FormSchema): Validator {
  return new Validator(schema);
}
