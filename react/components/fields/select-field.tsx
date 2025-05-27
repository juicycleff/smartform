import { EnhancedSelect } from '../ui/enhanced-select'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Small } from '../ui/typography'
import type React from 'react'
import { useCallback, useRef } from 'react'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { type Field, OptionsType } from '../../core'
import { useSmartForm } from '../context'

interface SelectFieldProps {
  field: Field
  path: string
}

const SelectField: React.FC<SelectFieldProps> = ({ field, path }) => {
  const { isFieldEnabled, isFieldRequired, formState, getDynamicOptions } =
    useSmartForm()
  const { control } = useFormContext()

  const [options, setOptions] = useState<any[]>(field.options?.static || [])
  const [loading, setLoading] = useState(false)
  // Keep track of previous form state to avoid unnecessary reloads
  const prevFormState = useRef<Record<string, any> | null>(null)
  // Track if component is mounted
  const isMounted = useRef(false)

  const disabled = !isFieldEnabled(field)
  const required = isFieldRequired(field)

  const loadOptions = useCallback(async () => {
    if (!field.options) return

    setLoading(true)

    try {
      switch (field.options.type) {
        case OptionsType.Static:
          // Static options are already defined in the schema
          setOptions(field.options.static || [])
          break

        case OptionsType.Dynamic:
          // Fetch dynamic options
          if (field.options.dynamicSource) {
            // Collect dependent values if this option depends on other fields
            const dependentValues: Record<string, any> = {}

            if (field.options.dynamicSource.refreshOn) {
              for (const fieldId of field.options.dynamicSource.refreshOn) {
                dependentValues[fieldId] = formState[fieldId]
              }
            }

            const dynamicOptions = await getDynamicOptions(
              field.id,
              dependentValues,
            )
            if (isMounted.current) {
              setOptions(dynamicOptions ?? [])
            }
          }
          break

        case OptionsType.Dependent:
          // Handle dependent options
          if (field.options.dependency?.field) {
            const dependentFieldValue =
              formState[field.options.dependency.field]
            const valueStr = String(dependentFieldValue)

            if (field.options.dependency?.valueMap?.[valueStr]) {
              setOptions(field.options.dependency.valueMap[valueStr])
            } else {
              setOptions([])
            }
          }
          break
        default:
          setOptions([])
          break
      }
    } catch (error) {
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [field, formState, getDynamicOptions])

  // On initial mount
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  // Function to load options based on the options type
  useEffect(() => {
    // For dynamic options, we need to be more careful about when to reload
    if (
      field.options?.type === OptionsType.Dynamic &&
      field.options.dynamicSource?.refreshOn
    ) {
      // Only reload if the component just mounted OR any of the dependent fields changed
      const shouldRefresh =
        !prevFormState.current ||
        field.options.dynamicSource.refreshOn.some(
          fieldId => formState[fieldId] !== prevFormState.current?.[fieldId],
        )

      if (shouldRefresh) {
        loadOptions()
      }
    } else {
      // For non-dynamic options, load once on mount or when field/formState changes
      // loadOptions()
    }

    // Update the previous form state reference after checking
    prevFormState.current = { ...formState }
  }, [field, formState, getDynamicOptions, loadOptions])

  // Function to load options based on the options type
  useEffect(() => {
    // For dynamic options, we need to be more careful about when to reload
    if (field.options?.type !== OptionsType.Dynamic) {
      // For non-dynamic options, load once on mount or when field/formState changes
      // loadOptions()
    }
  }, [field, formState, loadOptions])

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
            <>
              {field.options?.type !== OptionsType.Dynamic && (
                <Select
                  disabled={disabled || loading}
                  onValueChange={formField.onChange}
                  value={formField.value}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={field.placeholder || 'Select an option'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      options.map(option => (
                        <SelectItem
                          key={String(option.value)}
                          value={option.value}
                        >
                          {option.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
              {field.options?.type === OptionsType.Dynamic && (
                <EnhancedSelect
                  options={options}
                  optionValue="value"
                  optionLabel="label"
                  value={formField.value}
                  placeholder={'Enter value...'}
                  disabled={!field.enabled}
                  size={'sm'}
                  label={undefined}
                  onFocus={() => {
                    if (!loading) {
                      loadOptions()
                    }
                  }}
                  searchable
                  onChange={formField.onChange}
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-expect-error
                  required={field.required}
                  renderValue={(value, options) => {
                    const selectedOption = options.find(
                      option => option.value === value[0],
                    )
                    return selectedOption ? (
                      <div className="flex w-full items-center justify-between text-pyro-text-primary">
                        <div
                          key={selectedOption.value}
                          className="flex items-center gap-2"
                        >
                          <Small>{selectedOption.label}</Small>
                        </div>
                      </div>
                    ) : (
                      <span>{field.placeholder || 'Select an option'}</span>
                    )
                  }}
                  renderOption={ops => (
                    <div>
                      <Small className="font-medium">{ops.name}</Small>
                    </div>
                  )}
                />
              )}
            </>
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

export default SelectField
