import type {
  AuthStrategy,
  DynamicFunction,
  Field,
  FormSchema,
  ValidationResult,
} from './types'
import { FormType } from './types'
import { Validator } from './validation-engine'

/**
 * Class representing a form schema with methods for manipulating and validating it
 */
export class FormSchemaImpl implements FormSchema {
  id: string
  title: string
  description?: string
  type: FormType
  authType?: AuthStrategy
  fields: Field[] = []
  properties: Record<string, any> = {}
  private validator: Validator
  private functions: Map<string, DynamicFunction> = new Map()

  /**
   * Creates a new form schema
   * @param id Unique identifier for the form
   * @param title Display title of the form
   */
  constructor(id: string, title: string) {
    this.id = id
    this.title = title
    this.type = FormType.Regular
    this.validator = new Validator(this)
  }

  /**
   * Creates a new authentication form schema
   * @param id Unique identifier for the form
   * @param title Display title of the form
   * @param authType Authentication strategy
   */
  static createAuthForm(
    id: string,
    title: string,
    authType: AuthStrategy,
  ): FormSchemaImpl {
    const form = new FormSchemaImpl(id, title)
    form.type = FormType.Auth
    form.authType = authType
    return form
  }

  /**
   * Adds a field to the form schema
   * @param field The field to add
   */
  addField(field: Field): this {
    this.fields.push(field)
    return this
  }

  /**
   * Adds multiple fields to the form schema
   * @param fields The fields to add
   */
  addFields(...fields: Field[]): this {
    this.fields.push(...fields)
    return this
  }

  /**
   * Finds a field by its ID
   * @param id The ID to search for
   * @returns The found field or undefined
   */
  findFieldById(id: string): Field | undefined {
    // First search top-level fields
    for (const field of this.fields) {
      if (field.id === id) {
        return field
      }

      // Search nested fields recursively
      if (field.nested) {
        const nestedField = this.findNestedFieldById(field.nested, id)
        if (nestedField) {
          return nestedField
        }
      }
    }
    return undefined
  }

  /**
   * Finds a nested field by its ID
   * @param fields Array of fields to search
   * @param id The ID to search for
   * @returns The found field or undefined
   */
  private findNestedFieldById(fields: Field[], id: string): Field | undefined {
    for (const field of fields) {
      if (field.id === id) {
        return field
      }

      if (field.nested) {
        const nestedField = this.findNestedFieldById(field.nested, id)
        if (nestedField) {
          return nestedField
        }
      }
    }
    return undefined
  }

  /**
   * Validates form data against the schema
   * @param data Form data to validate
   * @returns Validation result
   */
  validate(data: Record<string, any>): ValidationResult {
    return this.validator.validateForm(data)
  }

  /**
   * Sorts fields by their order property
   */
  sortFields(): void {
    // First, ensure all fields have an order value
    this.ensureFieldsHaveOrder()

    // Sort top-level fields
    this.fields.sort((a, b) => a.order - b.order)

    // Also sort nested fields recursively
    for (const field of this.fields) {
      if (field.nested && field.nested.length > 0) {
        this.sortNestedFields(field.nested)
      }
    }
  }

  /**
   * Ensures all fields have an order value
   */
  private ensureFieldsHaveOrder(): void {
    // First pass: count fields with explicit order
    let hasExplicitOrder = 0
    for (const field of this.fields) {
      if (field.order > 0) {
        hasExplicitOrder++
      }
    }

    // If no fields have explicit order, assign sequential order based on definition order
    if (hasExplicitOrder === 0) {
      this.fields.forEach((field, i) => {
        field.order = i + 1 // Start from 1 to avoid conflicts with zero values
      })
      return
    }

    // If some fields have explicit order, assign high order values to unordered fields
    // to ensure they appear after explicitly ordered fields
    let maxOrder = 0
    for (const field of this.fields) {
      if (field.order > maxOrder) {
        maxOrder = field.order
      }
    }

    let nextOrder = maxOrder + 1
    for (const field of this.fields) {
      if (field.order === 0) {
        field.order = nextOrder
        nextOrder++
      }
    }

    // Recursively ensure orders for nested fields
    for (const field of this.fields) {
      if (field.nested && field.nested.length > 0) {
        this.ensureNestedFieldsHaveOrder(field.nested)
      }
    }
  }

  /**
   * Recursively assigns order values to nested fields
   * @param fields Array of fields to process
   */
  private ensureNestedFieldsHaveOrder(fields: Field[]): void {
    // First pass: count fields with explicit order
    let hasExplicitOrder = 0
    for (const field of fields) {
      if (field.order > 0) {
        hasExplicitOrder++
      }
    }

    // If no fields have explicit order, assign sequential order based on definition order
    if (hasExplicitOrder === 0) {
      fields.forEach((field, i) => {
        field.order = i + 1 // Start from 1 to avoid conflicts with zero values
      })
    } else {
      // If some fields have explicit order, assign high order values to unordered fields
      let maxOrder = 0
      for (const field of fields) {
        if (field.order > maxOrder) {
          maxOrder = field.order
        }
      }

      let nextOrder = maxOrder + 1
      for (const field of fields) {
        if (field.order === 0) {
          field.order = nextOrder
          nextOrder++
        }
      }
    }

    // Recursively ensure orders for nested fields
    for (const field of fields) {
      if (field.nested && field.nested.length > 0) {
        this.ensureNestedFieldsHaveOrder(field.nested)
      }
    }
  }

  /**
   * Recursively sorts nested fields by their order property
   * @param fields Array of fields to sort
   */
  private sortNestedFields(fields: Field[]): void {
    fields.sort((a, b) => a.order - b.order)

    // Recursively sort nested fields
    for (const field of fields) {
      if (field.nested && field.nested.length > 0) {
        this.sortNestedFields(field.nested)
      }
    }
  }

  /**
   * Registers a function that can be called at runtime
   * @param name Function name
   * @param fn Function implementation
   */
  registerFunction(name: string, fn: DynamicFunction): void {
    this.functions.set(name, fn)
  }

  /**
   * Executes a dynamic function with the given arguments
   * @param functionName Name of the function to execute
   * @param args Arguments to pass to the function
   * @param formState Current form state
   * @returns Result of the function execution
   */
  async executeDynamicFunction(
    functionName: string,
    args: Record<string, any>,
    formState: Record<string, any>,
  ): Promise<any> {
    // First check if we have this function registered locally
    const fn = this.functions.get(functionName)
    if (fn) {
      return await fn(args, formState)
    }

    // Fall back to implementation by client application
    throw new Error(`Function ${functionName} not registered with schema`)
  }

  /**
   * Serializes the form schema to JSON
   * @returns JSON string representation of the form schema
   */
  toJSON(): string {
    return JSON.stringify(this)
  }

  /**
   * Creates a form schema from a JSON string
   * @param json JSON string representation of a form schema
   * @returns New FormSchemaImpl instance
   */
  static fromJSON(json: string): FormSchemaImpl {
    const data = JSON.parse(json) as FormSchema
    const schema = new FormSchemaImpl(data.id, data.title)

    if (data.description) {
      schema.description = data.description
    }
    if (data.type) {
      schema.type = data.type
    }
    if (data.authType) {
      schema.authType = data.authType
    }
    if (data.fields) {
      schema.fields = data.fields
    }
    if (data.properties) {
      schema.properties = data.properties
    }

    return schema
  }
}
