import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import {
  RadioGroup,
  RadioGroupItem,
} from '../ui/radio-group'
import type React from 'react'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import type { Field } from '../../core'
import { useSmartForm } from '../context'
import { FormField as SmartFormField } from '../form-field'

interface OneOfFieldProps {
  field: Field
  path: string
}

interface OneOfFieldProps {
  field: Field
  path: string
}

const OneOfField: React.FC<OneOfFieldProps> = ({ field, path }) => {
  const { isFieldEnabled, isFieldRequired } = useSmartForm()
  const { control, setValue, watch } = useFormContext()

  const disabled = !isFieldEnabled(field)
  const required = isFieldRequired(field)

  // Create an internal field to track which option is selected
  const selectedOptionPath = `${path}.__selectedOption`
  const selectedOption = watch(selectedOptionPath)

  // When selection changes, reset all other fields to avoid data conflicts
  useEffect(() => {
    if (selectedOption && field.nested) {
      for (const nestedField of field.nested) {
        if (nestedField.id !== selectedOption) {
          setValue(`${path}.${nestedField.id}`, undefined)
        }
      }
    }
  }, [selectedOption, field.nested, path, setValue])

  if (!field.nested || field.nested.length === 0) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4">
        <p className="text-red-500">
          Error: OneOf field {field.id} has no options defined
        </p>
      </div>
    )
  }

  return (
    <FormItem className="space-y-4 rounded-md border p-4">
      <FormLabel
        className={
          required ? 'after:ml-0.5 after:text-red-500 after:content-["*"]' : ''
        }
      >
        {field.label}
      </FormLabel>

      <FormField
        control={control}
        name={selectedOptionPath}
        render={({ field: formField }) => (
          <FormItem>
            <FormControl>
              <RadioGroup
                onValueChange={formField.onChange}
                value={formField.value}
                disabled={disabled}
                className="space-y-3"
              >
                {field.nested?.map(option => (
                  <FormItem
                    key={option.id}
                    className="flex items-start space-x-3 space-y-0"
                  >
                    <FormControl>
                      <RadioGroupItem value={option.id} />
                    </FormControl>
                    <FormLabel className="font-medium">
                      {option.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      {selectedOption && (
        <div className="mt-4 border-t pt-4">
          {field.nested
            .filter(option => option.id === selectedOption)
            .map(option => (
              <SmartFormField
                key={option.id}
                field={option}
                parentPath={path}
              />
            ))}
        </div>
      )}

      {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
      <FormMessage />
    </FormItem>
  )
}

export default OneOfField
