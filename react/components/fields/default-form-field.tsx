import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import type React from 'react'
import { useFormContext } from 'react-hook-form'
import type { Field } from '../../core'
import { useSmartForm } from '../context'

interface DefaultFormFieldProps {
  field: Field
  path: string
}

const DefaultFormField: React.FC<DefaultFormFieldProps> = ({ field, path }) => {
  const { isFieldEnabled, isFieldRequired } = useSmartForm()
  const { control } = useFormContext()

  const disabled = !isFieldEnabled(field)
  const required = isFieldRequired(field)

  return (
    <FormField
      control={control}
      name={path}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel
            className={
              required
                ? 'after:ml-0.5 after:text-red-500 after:content-["*"]'
                : ''
            }
          >
            {field.label}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={field.placeholder || `Enter ${field.label}`}
              {...formField}
              disabled={disabled}
            />
          </FormControl>
          {field.helpText && (
            <FormDescription>{field.helpText}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default DefaultFormField
