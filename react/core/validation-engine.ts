import {
  type Condition,
  ConditionType,
  type Field,
  type FormSchema,
  type ValidationResult,
  type ValidationRule,
} from './types'

/**
 * Validator handles form validation against a schema
 */
export class Validator {
  private schema: FormSchema

  /**
   * Creates a new validator for a schema
   * @param schema Form schema to validate against
   */
  constructor(schema: FormSchema) {
    this.schema = schema
  }

  /**
   * Validates a form data map against the schema
   * @param data Form data to validate
   * @returns Validation result with errors if any
   */
  validateForm(data: Record<string, any>): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
    }

    // Validate each field
    for (const field of this.schema.fields) {
      this.validateField(field, data, '', result)
    }

    result.valid = result.errors?.length === 0
    return result
  }

  /**
   * Validates a single field and its nested fields if applicable
   * @param field Field to validate
   * @param data Form data
   * @param prefix Path prefix for nested fields
   * @param result Validation result to add errors to
   */
  private validateField(
    field: Field,
    data: Record<string, any>,
    prefix: string,
    result: ValidationResult,
  ): void {
    const fieldPath = prefix ? `${prefix}.${field.id}` : field.id

    // Skip validation if field is not visible
    if (field.visible && !this.evaluateCondition(field.visible, data)) {
      return
    }

    // Get field value (support nested path like "address.street")
    const value = this.getValueByPath(data, fieldPath)

    // Check required fields
    if (field.required) {
      const isEmpty = this.isEmpty(value)
      if (isEmpty) {
        result.errors?.push({
          fieldId: fieldPath,
          message: `${field.label} is required`,
          ruleType: 'required',
        })
      }
    }

    // Check conditional required (requiredIf)
    if (field.requiredIf && this.evaluateCondition(field.requiredIf, data)) {
      const isEmpty = this.isEmpty(value)
      if (isEmpty) {
        result.errors?.push({
          fieldId: fieldPath,
          message: `${field.label} is required based on other field values`,
          ruleType: 'requiredIf',
        })
      }
    }

    // Skip other validations if value is empty and not required
    if (this.isEmpty(value)) {
      return
    }

    // Apply field-specific validations
    if (field.validationRules) {
      for (const rule of field.validationRules) {
        const [valid, message] = this.applyValidationRule(
          rule,
          value,
          field,
          data,
        )
        if (!valid) {
          result.errors?.push({
            fieldId: fieldPath,
            message,
            ruleType: rule.type,
          })
        }
      }
    }

    // Handle nested fields (for group, object types)
    if (
      (field.type === 'group' || field.type === 'object') &&
      field.nested &&
      field.nested.length > 0
    ) {
      const nestedData: Record<string, any> =
        (value as Record<string, any>) || {}

      for (const nestedField of field.nested) {
        this.validateField(nestedField, nestedData, fieldPath, result)
      }
    }

    // Handle array fields
    if (field.type === 'array' && Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (field.nested && field.nested.length > 0) {
          const item = value[i]
          if (typeof item === 'object') {
            for (const nestedField of field.nested) {
              this.validateField(
                nestedField,
                item,
                `${fieldPath}[${i}]`,
                result,
              )
            }
          }
        }
      }
    }

    // Handle oneOf fields (exactly one nested field must be valid)
    if (field.type === 'oneOf' && field.nested && field.nested.length > 0) {
      // Implementation would check that exactly one option is selected
      // This is a simplified placeholder
    }

    // Handle anyOf fields (at least one nested field must be valid)
    if (field.type === 'anyOf' && field.nested && field.nested.length > 0) {
      // Implementation would check that at least one option is selected
      // This is a simplified placeholder
    }
  }

  /**
   * Applies a specific validation rule to a value
   * @param rule Validation rule to apply
   * @param value Value to validate
   * @param field Field being validated
   * @param data Complete form data
   * @returns Tuple of [valid, message]
   */
  private applyValidationRule(
    rule: ValidationRule,
    value: any,
    field: Field,
    data: Record<string, any>,
  ): [boolean, string] {
    switch (rule.type) {
      case 'required':
        return [!this.isEmpty(value), rule.message]

      case 'requiredIf': {
        // The parameters should be a Condition
        if (
          rule.parameters &&
          typeof rule.parameters === 'object' &&
          'type' in rule.parameters
        ) {
          const condition = rule.parameters as Condition
          if (this.evaluateCondition(condition, data)) {
            return [!this.isEmpty(value), rule.message]
          }
        }
        return [true, '']
      }

      case 'minLength': {
        if (typeof value === 'string') {
          const minLength = rule.parameters as number
          return [value.length >= minLength, rule.message]
        }
        return [false, rule.message]
      }

      case 'maxLength': {
        if (typeof value === 'string') {
          const maxLength = rule.parameters as number
          return [value.length <= maxLength, rule.message]
        }
        return [false, rule.message]
      }

      case 'pattern': {
        if (typeof value === 'string') {
          const pattern = rule.parameters as string
          try {
            const re = new RegExp(pattern)
            return [re.test(value), rule.message]
          } catch (e) {
            return [false, 'Invalid pattern']
          }
        }
        return [false, rule.message]
      }

      case 'min': {
        if (typeof value === 'number') {
          const min = rule.parameters as number
          return [value >= min, rule.message]
        }
        return [false, rule.message]
      }

      case 'max': {
        if (typeof value === 'number') {
          const max = rule.parameters as number
          return [value <= max, rule.message]
        }
        return [false, rule.message]
      }

      case 'email': {
        if (typeof value === 'string') {
          // Simple email regex - a production system would use a more comprehensive one
          const re = /^[^@]+@[^@]+\.[^@]+$/
          return [re.test(value), rule.message]
        }
        return [false, rule.message]
      }

      case 'url': {
        if (typeof value === 'string') {
          // Simple URL regex - a production system would use a more comprehensive one
          const re = /^(http|https):\/\/[^\s/$.?#].[^\s]*$/
          return [re.test(value), rule.message]
        }
        return [false, rule.message]
      }

      case 'fileType':
        // Implementation would check file extension or MIME type
        return [true, rule.message]

      case 'fileSize':
        // Implementation would check file size
        return [true, rule.message]

      case 'imageDimensions':
        // Implementation would check image dimensions
        return [true, rule.message]

      case 'dependency':
        // Implementation would check dependencies between fields
        return [this.validateDependency(rule, field, data), rule.message]

      case 'unique':
        // Would typically require access to a data store to verify uniqueness
        return [true, rule.message]

      case 'custom':
        // Custom validation would be implemented by the application
        return [true, rule.message]

      default:
        return [true, '']
    }
  }

  /**
   * Checks if a field's value satisfies a dependency rule
   * @param rule Validation rule
   * @param field Field being validated
   * @param data Form data
   * @returns Whether the dependency is satisfied
   */
  private validateDependency(
    rule: ValidationRule,
    field: Field,
    data: Record<string, any>,
  ): boolean {
    if (rule.parameters && typeof rule.parameters === 'object') {
      const params = rule.parameters as Record<string, any>
      const dependsOn = params.field as string
      const operator = params.operator as string
      const expectedValue = params.value

      const dependentValue = this.getValueByPath(data, dependsOn)

      switch (operator) {
        case 'eq':
          return this.deepEqual(dependentValue, expectedValue)
        case 'neq':
          return !this.deepEqual(dependentValue, expectedValue)
        case 'gt':
          return (
            typeof dependentValue === 'number' &&
            typeof expectedValue === 'number' &&
            dependentValue > expectedValue
          )
        case 'lt':
          return (
            typeof dependentValue === 'number' &&
            typeof expectedValue === 'number' &&
            dependentValue < expectedValue
          )
        default:
          return false
      }
    }
    return false
  }

  /**
   * Evaluates a condition against form data
   * @param condition Condition to evaluate
   * @param data Form data
   * @returns Whether the condition is satisfied
   */
  evaluateCondition(condition: Condition, data: Record<string, any>): boolean {
    switch (condition.type) {
      case ConditionType.Simple: {
        if (condition.field) {
          const fieldValue = this.getValueByPath(data, condition.field)

          switch (condition.operator) {
            case 'eq':
              return this.deepEqual(fieldValue, condition.value)
            case 'neq':
              return !this.deepEqual(fieldValue, condition.value)
            case 'contains': {
              if (
                typeof fieldValue === 'string' &&
                typeof condition.value === 'string'
              ) {
                return fieldValue.includes(condition.value)
              }
              return false
            }
            case 'startsWith': {
              if (
                typeof fieldValue === 'string' &&
                typeof condition.value === 'string'
              ) {
                return fieldValue.startsWith(condition.value)
              }
              return false
            }
            case 'endsWith': {
              if (
                typeof fieldValue === 'string' &&
                typeof condition.value === 'string'
              ) {
                return fieldValue.endsWith(condition.value)
              }
              return false
            }
            case 'gt': {
              if (
                typeof fieldValue === 'number' &&
                typeof condition.value === 'number'
              ) {
                return fieldValue > condition.value
              }
              return false
            }
            case 'gte': {
              if (
                typeof fieldValue === 'number' &&
                typeof condition.value === 'number'
              ) {
                return fieldValue >= condition.value
              }
              return false
            }
            case 'lt': {
              if (
                typeof fieldValue === 'number' &&
                typeof condition.value === 'number'
              ) {
                return fieldValue < condition.value
              }
              return false
            }
            case 'lte': {
              if (
                typeof fieldValue === 'number' &&
                typeof condition.value === 'number'
              ) {
                return fieldValue <= condition.value
              }
              return false
            }
            default:
              return false
          }
        }
        return false
      }

      case ConditionType.And: {
        if (condition.conditions) {
          for (const subCondition of condition.conditions) {
            if (!this.evaluateCondition(subCondition, data)) {
              return false
            }
          }
          return true
        }
        return false
      }

      case ConditionType.Or: {
        if (condition.conditions) {
          for (const subCondition of condition.conditions) {
            if (this.evaluateCondition(subCondition, data)) {
              return true
            }
          }
          return false
        }
        return false
      }

      case ConditionType.Not: {
        if (condition.conditions && condition.conditions.length > 0) {
          return !this.evaluateCondition(condition.conditions[0], data)
        }
        return false
      }

      case ConditionType.Exists: {
        if (condition.field) {
          const value = this.getValueByPath(data, condition.field)
          return !this.isEmpty(value)
        }
        return false
      }

      case ConditionType.Expression: {
        // For expression evaluation, we would use a lightweight expression engine
        // This is a simplified placeholder
        if (condition.expression) {
          return this.evaluateExpression(condition.expression, data)
        }
        return false
      }

      default:
        return false
    }
  }

  /**
   * Evaluates a custom expression against form data
   * This would typically use a specialized expression evaluation library
   * @param expression Expression to evaluate
   * @param data Form data
   * @returns Expression result
   */
  private evaluateExpression(
    expression: string,
    data: Record<string, any>,
  ): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _o = {
      expression,
      data
    }
    return true
  }

  /**
   * Checks if a value is empty
   * @param value Value to check
   * @returns Whether the value is empty
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true
    }

    switch (typeof value) {
      case 'string':
        return value.trim() === ''
      case 'object': {
        if (Array.isArray(value)) {
          return value.length === 0
        }
        return Object.keys(value).length === 0
      }
      case 'boolean':
        return !value
      case 'number':
        return value === 0
      default:
        return false
    }
  }

  /**
   * Performs a deep equality check between two values
   * @param a First value
   * @param b Second value
   * @returns Whether the values are deeply equal
   */
  private deepEqual(a: any, b: any): boolean {
    if (a === b) {
      return true
    }

    if (
      typeof a !== 'object' ||
      a === null ||
      typeof b !== 'object' ||
      b === null
    ) {
      return false
    }

    const keysA = Object.keys(a)
    const keysB = Object.keys(b)

    if (keysA.length !== keysB.length) {
      return false
    }

    for (const key of keysA) {
      if (!keysB.includes(key) || !this.deepEqual(a[key], b[key])) {
        return false
      }
    }

    return true
  }

  /**
   * Retrieves a value from nested maps using a dot notation path
   * @param data Data object
   * @param path Dot notation path (e.g. "address.street")
   * @returns The value at the path or undefined
   */
  getValueByPath(data: Record<string, any>, path: string): any {
    const parts = path.split('.')

    // Handle array indexing
    const arrayRegex = /(.*)\[(\d+)\]$/

    let current = data

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]

      // Check if this part contains an array index
      const matches = part.match(arrayRegex)

      if (matches) {
        // It's an array access
        const fieldName = matches[1]
        const indexStr = matches[2]

        // Get the array
        const arr = current[fieldName]
        if (!arr || !Array.isArray(arr)) {
          return undefined
        }

        // Get the index
        const index = Number.parseInt(indexStr, 10)

        // Check if the index is valid
        if (index < 0 || index >= arr.length) {
          return undefined
        }

        // If this is the last part, return the array element
        if (i === parts.length - 1) {
          return arr[index]
        }

        // Otherwise, ensure the element is an object and continue
        if (typeof arr[index] === 'object' && arr[index] !== null) {
          current = arr[index]
        } else {
          return undefined
        }
      } else {
        // Regular field access
        if (i === parts.length - 1) {
          return current[part]
        }

        if (current[part] && typeof current[part] === 'object') {
          current = current[part]
        } else {
          return undefined
        }
      }
    }

    return undefined
  }
}
