import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { cn } from '../../lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import type React from 'react'
import { useFormContext } from 'react-hook-form'
import type { Field } from '../../core'
import { useSmartForm } from '../context'
import { TemplateModeWrapper } from './template-mode-wrapper'

interface DateFieldProps {
  field: Field
  path: string
}

const DateField: React.FC<DateFieldProps> = ({ field, path }) => {
  const { isFieldEnabled, isFieldRequired } = useSmartForm()
  const { control } = useFormContext()

  const disabled = !isFieldEnabled(field)
  const required = isFieldRequired(field)

  return (
    <FormField
      control={control}
      name={path}
      render={({ field: formField }) => (
        <FormItem className="flex flex-col">
          <FormLabel
            className={
              required
                ? 'after:ml-0.5 after:text-red-500 after:content-["*"]'
                : ''
            }
          >
            {field.label}
          </FormLabel>
          <TemplateModeWrapper
            value={formField.value}
            onChange={formField.onChange}
            onBlur={formField.onBlur}
            path={path}
            disabled={disabled}
          >
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full pl-3 text-left font-normal',
                      !formField.value && 'text-muted-foreground',
                    )}
                    disabled={disabled}
                  >
                    {formField.value ? (
                      format(new Date(formField.value), 'PPP')
                    ) : (
                      <span>{field.placeholder || 'Select a date'}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    formField.value ? new Date(formField.value) : undefined
                  }
                  onSelect={formField.onChange}
                  disabled={disabled}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </TemplateModeWrapper>
          {field.helpText && (
            <FormDescription>{field.helpText}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default DateField
