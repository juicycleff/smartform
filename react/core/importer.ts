import { FormSchemaImpl } from './form-schema'
import type { Field } from './types'

/**
 * Creates a form schema from a JSON string
 * @param jsonStr JSON string representation of a form schema
 */
export function formSchemaFromJSON(jsonStr: string): FormSchemaImpl {
  return importJSON(jsonStr)
}

/**
 * Creates a form schema from a JavaScript object
 * @param rawSchema Raw schema object
 */
export function formSchemaFromObject(
  rawSchema: Record<string, any>,
): FormSchemaImpl {
  return convertToFormSchema(rawSchema)
}

/**
 * Provides functionality to import JSON into form schemas
 */
export const JSONImporter = {
  /**
   * Imports a JSON string into a FormSchema
   * @param jsonStr JSON string representation
   */
  importJSON: (jsonStr: string): FormSchemaImpl => {
    // Parse the JSON string
    let rawSchema: Record<string, any>
    try {
      rawSchema = JSON.parse(jsonStr) as any
    } catch (e) {
      throw new Error(`Failed to parse JSON: ${(e as any)?.message}`)
    }

    // Convert the raw object to FormSchema
    return convertToFormSchema(rawSchema)
  },
}

/**
 * Converts a raw JSON object to a FormSchema
 * @param rawSchema Raw schema object
 */
function convertToFormSchema(rawSchema: Record<string, any>): FormSchemaImpl {
  // Extract required properties
  const id = rawSchema.id
  if (!id) {
    throw new Error("Missing required 'id' field")
  }

  const title = rawSchema.title
  if (!title) {
    throw new Error("Missing required 'title' field")
  }

  // Create a new FormSchema
  const schema = new FormSchemaImpl(id, title)

  // Extract optional properties
  if (rawSchema.description) {
    schema.description = rawSchema.description
  }

  // Extract form type
  if (rawSchema.type) {
    schema.type = rawSchema.type
  }

  // Extract auth type for auth forms
  if (rawSchema.authType) {
    schema.authType = rawSchema.authType
  }

  // Extract properties
  if (rawSchema.properties && typeof rawSchema.properties === 'object') {
    schema.properties = { ...rawSchema.properties }
  }

  // Extract fields
  if (rawSchema.fields && Array.isArray(rawSchema.fields)) {
    for (const fieldRaw of rawSchema.fields) {
      try {
        const field = convertToField(fieldRaw)
        schema.addField(field)
      } catch (e) {}
    }
  }

  // Ensure fields have proper order
  schema.sortFields()

  return schema
}

/**
 * Converts a raw JSON object to a Field
 * @param rawField Raw field object
 */
function convertToField(rawField: Record<string, any>): Field {
  // Extract required properties
  const id = rawField.id
  if (!id) {
    throw new Error("Missing required 'id' field in field definition")
  }

  const type = rawField.type
  if (!type) {
    throw new Error("Missing required 'type' field in field definition")
  }

  // Extract label (can be empty for some fields like hidden)
  const label = rawField.label || ''

  // Create a new field
  const field: Field = {
    id,
    type,
    label,
    required: false,
    order: 0,
    properties: {},
  }

  // Extract optional properties
  if (rawField.required !== undefined) {
    field.required = Boolean(rawField.required)
  }

  if (rawField.placeholder) {
    field.placeholder = rawField.placeholder
  }

  if (rawField.helpText) {
    field.helpText = rawField.helpText
  }

  if (rawField.order !== undefined) {
    field.order = Number(rawField.order)
  }

  // Extract default value
  if ('defaultValue' in rawField) {
    field.defaultValue = rawField.defaultValue
  }

  // Extract properties
  if (rawField.properties && typeof rawField.properties === 'object') {
    field.properties = { ...rawField.properties }
  }

  // Extract visibility condition
  if (rawField.visible) {
    field.visible = rawField.visible
  }

  // Extract enabled condition
  if (rawField.enabled) {
    field.enabled = rawField.enabled
  }

  // Extract requiredIf condition
  if (rawField.requiredIf) {
    field.requiredIf = rawField.requiredIf
  }

  // Extract validation rules
  if (rawField.validationRules && Array.isArray(rawField.validationRules)) {
    field.validationRules = rawField.validationRules
  }

  // Extract options
  if (rawField.options) {
    field.options = rawField.options
  }

  // Extract nested fields
  if (rawField.nested && Array.isArray(rawField.nested)) {
    field.nested = []
    for (const nestedRaw of rawField.nested) {
      try {
        const nestedField = convertToField(nestedRaw)
        field.nested.push(nestedField)
      } catch (e) {}
    }
  }

  return field
}

/**
 * Helper function to import JSON
 * @param jsonStr JSON string representation
 */
function importJSON(jsonStr: string): FormSchemaImpl {
  return JSONImporter.importJSON(jsonStr)
}
