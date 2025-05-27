import { Button } from '../ui/button'
import {
  FormField,
  FormItem,
  FormLabel,
} from '../ui/form'
import { Plus, Trash2 } from 'lucide-react'
import type React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import type { Field } from '../../core'
import { useSmartForm } from '../context'
import { FormField as SmartFormField } from '../form-field'
import { TemplateModeWrapper } from './template-mode-wrapper'

interface ArrayFieldProps {
  field: Field
  parentPath?: string
}

const ArrayField: React.FC<ArrayFieldProps> = ({ field, parentPath = '' }) => {
  const { isFieldEnabled } = useSmartForm()
  const { control } = useFormContext()
  const fieldPath = parentPath ? `${parentPath}.${field.id}` : field.id

  const disabled = !isFieldEnabled(field)

  // Use react-hook-form's useFieldArray to manage the array
  const {
    fields: arrayFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: fieldPath,
  })

  // Get the template field (the first nested field)
  const templateField =
    field.nested && field.nested.length > 0 ? field.nested[0] : null

  if (!templateField) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4">
        <p className="text-red-500">
          Error: Array field {field.id} has no template defined
        </p>
      </div>
    )
  }

  // Function to add a new item
  const handleAddItem = () => {
    // Create a default value based on the template field type
    const defaultValue = getDefaultValueForField(templateField)
    append(defaultValue)
  }

  return (
    <FormField
      control={control}
      name={fieldPath}
      render={({ field: formField }) => (
        <FormItem className="space-y-4 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <FormLabel>{field.label}</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              disabled={disabled}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
          <TemplateModeWrapper
            value={formField.value}
            onChange={formField.onChange}
            onBlur={formField.onBlur}
            path={fieldPath}
            disabled={disabled}
            useEndContent={false}
          >
            {arrayFields.length > 0 ? (
              <div className="space-y-4">
                {arrayFields.map((item, index) => (
                  <div key={item.id} className="relative rounded-md border p-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={disabled}
                      className="absolute top-2 right-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>

                    {/* Handle different template field types */}
                    {templateField.type === 'group' ||
                    templateField.type === 'object' ? (
                      // For group templates, render all nested fields
                      <div className="space-y-3 pt-4">
                        {templateField.nested?.map(nestedField => (
                          <SmartFormField
                            key={nestedField.id}
                            field={nestedField}
                            parentPath={`${fieldPath}.${index}`}
                          />
                        ))}
                      </div>
                    ) : (
                      // For simple templates, render the field directly
                      <SmartFormField
                        field={templateField}
                        parentPath={`${fieldPath}.${index}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-center text-gray-500">
                No items. Click "Add Item" to add the first one.
              </div>
            )}
          </TemplateModeWrapper>
        </FormItem>
      )}
    />
  )
}

// Helper function to create default values based on field type
const getDefaultValueForField = (field: Field): any => {
  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'password':
      return field.defaultValue || ''

    case 'number':
      return field.defaultValue || 0

    case 'checkbox':
      return field.defaultValue || false

    case 'date':
    case 'time':
    case 'datetime':
      return field.defaultValue || ''

    case 'select':
      return field.defaultValue || ''

    case 'multiselect':
      return field.defaultValue || []

    case 'group':
    case 'object': {
      // For object types, create a nested object with defaults
      if (field.nested && field.nested.length > 0) {
        return field.nested.reduce(
          (obj, nestedField) => {
            obj[nestedField.id] = getDefaultValueForField(nestedField)
            return obj
          },
          {} as Record<string, any>,
        )
      }
      return {}
    }

    case 'array':
      return field.defaultValue || []

    default:
      return field.defaultValue || null
  }
}

export default ArrayField
