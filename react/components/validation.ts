import * as z from 'zod'
import { TemplateEngine } from '../template-engine'
import {
  type Condition,
  type Field,
  FieldType,
  type FormSchema,
  ValidationType,
} from '../core'
import { Logger } from '../logger'
import { evaluateCondition } from './conditions'

const log = Logger.forComponent('validation')
const emailRegexInternal = /^[^@]+@[^@]+\.[^@]+$/

export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

const resolveMaybeTemplate = (
  value: any,
  templateEngine: TemplateEngine,
  formState: Record<string, any>,
  fieldPath: string,
): any => {
  if (typeof value === 'string' && value.includes('${')) {
    try {
      return templateEngine.evaluateExpression(value, formState)
    } catch (e) {
      log.error(
        `Error evaluating template "${value}" for field "${fieldPath}":`,
        e,
      )
      return value
    }
  }
  return value
}

const preprocessIfTemplate = async (
    val: any,
    templateEngine: TemplateEngine,
    getFormState: () => Record<string, any>,
    fieldPath: string,
    expectedType?: 'number' | 'boolean' | 'string' | 'array' | 'object',
): Promise<any> => {
  if (typeof val === 'string' && val.includes('${') && val.includes('}')) {
    try {
      const formState = getFormState()
      log.debug(`Preprocessing template for field "${fieldPath}": ${val}`)
      let resolvedValue = await templateEngine.evaluateExpression(val, formState)
      log.debug(
        `Resolved value for "${fieldPath}" (raw from engine):`,
        resolvedValue,
      )

      if (expectedType) {
        if (expectedType === 'number') {
          if (typeof resolvedValue === 'string') {
            const num = Number(resolvedValue)
            if (!isNaN(num) && isFinite(num) && resolvedValue.trim() !== '') {
              resolvedValue = num
            }
          }
        } else if (
          expectedType === 'boolean' &&
          typeof resolvedValue !== 'boolean'
        ) {
          if (typeof resolvedValue === 'string') {
            if (resolvedValue.toLowerCase() === 'true') resolvedValue = true
            else if (resolvedValue.toLowerCase() === 'false')
              resolvedValue = false
          } else if (typeof resolvedValue === 'number') {
            resolvedValue = resolvedValue !== 0
          }
        } else if (
          expectedType === 'string' &&
          typeof resolvedValue !== 'string' &&
          resolvedValue !== null &&
          resolvedValue !== undefined
        ) {
          resolvedValue = String(resolvedValue)
        }
      }
      log.debug(
        `Resolved value for "${fieldPath}" (after hint coercion):`,
        resolvedValue,
      )
      return resolvedValue
    } catch (e) {
      log.error(
        `Error evaluating template "${val}" during preprocess for field "${fieldPath}":`,
        e,
      )
      return val
    }
  }
  return val
}

const buildFieldValidation = (
  field: Field,
  templateEngine: TemplateEngine,
  getFormState: () => Record<string, any>,
  parentPath = '',
): [string, z.ZodTypeAny] => {
  const fieldPath = parentPath ? `${parentPath}.${field.id}` : field.id
  let schema: z.ZodTypeAny

  switch (field.type) {
    case FieldType.Text:
    case FieldType.Textarea:
    case FieldType.Password:
      schema = z.preprocess(
        val =>
          preprocessIfTemplate(
            val,
            templateEngine,
            getFormState,
            fieldPath,
            'string',
          ),
        z.string({
          invalid_type_error: `Expected a string for ${
            field.label || field.id
          }`,
        }),
      )
      break
    case FieldType.Email:
      schema = z.preprocess(
        val =>
          preprocessIfTemplate(
            val,
            templateEngine,
            getFormState,
            fieldPath,
            'string',
          ),
        z
          .string({
            invalid_type_error: `Expected a string for ${
              field.label || field.id
            }`,
          })
          .email({
            message:
              field.validationRules?.find(r => r.type === ValidationType.Email)
                ?.message || 'Invalid email address',
          }),
      )
      break
    case FieldType.Number:
      schema = z.preprocess(
        val =>
          preprocessIfTemplate(
            val,
            templateEngine,
            getFormState,
            fieldPath,
            'number',
          ),
        z.preprocess(
          val => {
            if (
              val === '' ||
              val === undefined ||
              val === null ||
              (typeof val === 'string' && val.trim() === '')
            ) {
              return undefined
            }
            return Number(val)
          },
          z.number({
            invalid_type_error: `Expected a number for ${
              field.label || field.id
            }`,
          }),
        ),
      )
      break
    case FieldType.Checkbox:
      schema = z.preprocess(
        val =>
          preprocessIfTemplate(
            val,
            templateEngine,
            getFormState,
            fieldPath,
            'boolean',
          ),
        z.boolean({
          invalid_type_error: `Expected a boolean for ${
            field.label || field.id
          }`,
        }),
      )
      break
    case FieldType.Date:
    case FieldType.Time:
    case FieldType.DateTime:
      schema = z.preprocess(
        val =>
          preprocessIfTemplate(
            val,
            templateEngine,
            getFormState,
            fieldPath,
            'string',
          ),
        z.string({
          invalid_type_error: `Expected a date/time string for ${
            field.label || field.id
          }`,
        }),
      )
      break
    case FieldType.Select:
      schema = z.preprocess(
        val =>
          preprocessIfTemplate(val, templateEngine, getFormState, fieldPath),
        z.any(),
      )
      break
    case FieldType.MultiSelect:
      schema = z.preprocess(
        val =>
          preprocessIfTemplate(
            val,
            templateEngine,
            getFormState,
            fieldPath,
            'array',
          ),
        z.array(z.any()),
      )
      break
    case FieldType.Group:
    case FieldType.Object:
      if (field.nested?.length) {
        const nestedFields = field.nested.map(nestedField =>
          buildFieldValidation(
            nestedField,
            templateEngine,
            getFormState,
            fieldPath,
          ),
        )
        schema = z.object(Object.fromEntries(nestedFields))
      } else {
        schema = z.object({})
      }
      break
    case FieldType.Array:
      if (field.nested?.length) {
        const itemField = field.nested[0]
        if (!itemField) {
          log.warn(
            `Invalid array field schema: ${fieldPath}. Item definition missing.`,
          )
          return [field.id, z.array(z.any())]
        }
        const [, itemSchema] = buildFieldValidation(
          itemField,
          templateEngine,
          getFormState,
        )
        schema = z.array(itemSchema)
      } else {
        schema = z.array(z.any())
      }
      break
    default:
      schema = z.preprocess(
        val =>
          preprocessIfTemplate(val, templateEngine, getFormState, fieldPath),
        z.any(),
      )
  }

  let hasRequiredConstraint = false

  if (field.validationRules) {
    for (const rule of field.validationRules) {
      if (rule.type === ValidationType.Required) {
        hasRequiredConstraint = true
      }
      if (
        rule.type === ValidationType.Email &&
        field.type === FieldType.Email
      ) {
        if (rule.message) {
          schema = schema.refine(
            val => {
              if (typeof val !== 'string' || val === '') return true
              return z.string().email().safeParse(val).success
            },
            {
              message: resolveMaybeTemplate(
                rule.message,
                templateEngine,
                getFormState(),
                fieldPath,
              ) as string,
            },
          )
        }
        continue
      }

      schema = schema.superRefine((val, ctx) => {
        const formState = getFormState()
        const resolvedMessage = resolveMaybeTemplate(
          rule.message || 'Invalid input.',
          templateEngine,
          formState,
          fieldPath,
        ) as string

        switch (rule.type) {
          case ValidationType.Required:
            if (isEmpty(val)) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: resolvedMessage,
              })
            }
            break
          case ValidationType.MinLength: {
            const minLength = resolveMaybeTemplate(
              rule.parameters,
              templateEngine,
              formState,
              fieldPath,
            )
            if (typeof minLength !== 'number') {
              log.error(`Invalid MinLength param for ${fieldPath}`)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid MinLength config.',
              })
              break
            }
            if (
              (typeof val === 'string' || Array.isArray(val)) &&
              val !== null &&
              val !== undefined &&
              val.length < minLength
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.too_small,
                minimum: minLength,
                type: typeof val === 'string' ? 'string' : 'array',
                inclusive: true,
                message: resolvedMessage,
              })
            }
            break
          }
          case ValidationType.MaxLength: {
            const maxLength = resolveMaybeTemplate(
              rule.parameters,
              templateEngine,
              formState,
              fieldPath,
            )
            if (typeof maxLength !== 'number') {
              log.error(`Invalid MaxLength param for ${fieldPath}`)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid MaxLength config.',
              })
              break
            }
            if (
              (typeof val === 'string' || Array.isArray(val)) &&
              val !== null &&
              val !== undefined &&
              val.length > maxLength
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.too_big,
                maximum: maxLength,
                type: typeof val === 'string' ? 'string' : 'array',
                inclusive: true,
                message: resolvedMessage,
              })
            }
            break
          }
          case ValidationType.Pattern: {
            const patternStr = resolveMaybeTemplate(
              rule.parameters,
              templateEngine,
              formState,
              fieldPath,
            )
            if (typeof patternStr !== 'string') {
              log.error(`Invalid Pattern param for ${fieldPath}`)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid Pattern config.',
              })
              break
            }
            if (typeof val === 'string' && val !== '') {
              try {
                if (!new RegExp(patternStr).test(val)) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.invalid_string,
                    validation: 'regex',
                    message: resolvedMessage,
                  })
                }
              } catch (e) {
                log.error(`Invalid regex: ${patternStr}`, e)
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: 'Invalid pattern config.',
                })
              }
            }
            break
          }
          case ValidationType.Min: {
            const min = resolveMaybeTemplate(
              rule.parameters,
              templateEngine,
              formState,
              fieldPath,
            )
            if (typeof min !== 'number') {
              log.error(`Invalid Min param for ${fieldPath}`)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid Min config.',
              })
              break
            }
            if (typeof val === 'number' && val < min) {
              ctx.addIssue({
                code: z.ZodIssueCode.too_small,
                minimum: min,
                type: 'number',
                inclusive: true,
                message: resolvedMessage,
              })
            }
            break
          }
          case ValidationType.Max: {
            const max = resolveMaybeTemplate(
              rule.parameters,
              templateEngine,
              formState,
              fieldPath,
            )
            if (typeof max !== 'number') {
              log.error(`Invalid Max param for ${fieldPath}`)
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Invalid Max config.',
              })
              break
            }
            if (typeof val === 'number' && val > max) {
              ctx.addIssue({
                code: z.ZodIssueCode.too_big,
                maximum: max,
                type: 'number',
                inclusive: true,
                message: resolvedMessage,
              })
            }
            break
          }
          case ValidationType.Email:
            if (
              field.type !== FieldType.Email &&
              typeof val === 'string' &&
              val !== '' &&
              !emailRegexInternal.test(val)
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.invalid_string,
                validation: 'email',
                message: resolvedMessage,
              })
            }
            break
          default:
            break
        }
      })
    }
  }

  if (field.required && !hasRequiredConstraint) {
    hasRequiredConstraint = true
    schema = schema.superRefine((val, ctx) => {
      if (isEmpty(val)) {
        const formState = getFormState()
        const message = resolveMaybeTemplate(
          `${field.label || field.id} is required.`,
          templateEngine,
          formState,
          fieldPath,
        )
        ctx.addIssue({ code: z.ZodIssueCode.custom, message })
      }
    })
  }

  if (field.requiredIf) {
    hasRequiredConstraint = true
    schema = schema.superRefine((val, ctx) => {
      const formState = getFormState()
      if (
        evaluateCondition(field.requiredIf as Condition, formState) &&
        isEmpty(val)
      ) {
        const message = resolveMaybeTemplate(
          (field.requiredIf as Condition).message ||
            `Field "${field.label || field.id}" is conditionally required.`,
          templateEngine,
          formState,
          fieldPath,
        )
        ctx.addIssue({ code: z.ZodIssueCode.custom, message })
      }
    })
  }

  if (!hasRequiredConstraint) {
    schema = schema.nullable().optional()
  }

  return [field.id, schema]
}

export const buildValidationSchema = (
  formSchema: FormSchema,
  templateEngine?: TemplateEngine,
  getFormState?: () => Record<string, any>,
): z.ZodObject<any> => {
  if (!formSchema || !formSchema.fields || !Array.isArray(formSchema.fields)) {
    log.warn('Invalid schema provided to buildValidationSchema', formSchema)
    return z.object({})
  }

  const resolvedTemplateEngine = templateEngine || new TemplateEngine()
  const resolvedGetFormState = getFormState || (() => ({}))

  const fields = formSchema.fields.map(field =>
    buildFieldValidation(
      field,
      resolvedTemplateEngine,
      resolvedGetFormState,
      '',
    ),
  )

  return z.object(Object.fromEntries(fields))
}
