import { type Condition, ConditionType } from '../core'
import { Logger } from '../logger'

/**
 * Evaluates a condition against form data
 */
export const evaluateCondition = (
  condition: Condition,
  formState: Record<string, any>,
): boolean => {
  if (!condition) return true

  switch (condition.type) {
    case ConditionType.Simple:
      return evaluateSimpleCondition(condition, formState)

    case ConditionType.And:
      return evaluateAndCondition(condition, formState)

    case ConditionType.Or:
      return evaluateOrCondition(condition, formState)

    case ConditionType.Not:
      return evaluateNotCondition(condition, formState)

    case ConditionType.Exists:
      return evaluateExistsCondition(condition, formState)

    case ConditionType.Expression:
      return evaluateExpressionCondition(condition, formState)

    default:
      return true
  }
}

/**
 * Evaluates a simple condition comparing a field value against a specified value
 */
const evaluateSimpleCondition = (
  condition: Condition,
  formState: Record<string, any>,
): boolean => {
  if (!condition.field) return true

  const fieldValue = getValueByPath(formState, condition.field)

  switch (condition.operator) {
    case 'eq':
      return deepEqual(fieldValue, condition.value)

    case 'neq':
      return !deepEqual(fieldValue, condition.value)

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

/**
 * Evaluates an AND condition (all sub-conditions must be true)
 */
const evaluateAndCondition = (
  condition: Condition,
  formState: Record<string, any>,
): boolean => {
  if (!condition.conditions || condition.conditions.length === 0) {
    return true
  }

  return condition.conditions.every(c => evaluateCondition(c, formState))
}

/**
 * Evaluates an OR condition (at least one sub-condition must be true)
 */
const evaluateOrCondition = (
  condition: Condition,
  formState: Record<string, any>,
): boolean => {
  if (!condition.conditions || condition.conditions.length === 0) {
    return false
  }

  return condition.conditions.some(c => evaluateCondition(c, formState))
}

/**
 * Evaluates a NOT condition (negates a sub-condition)
 */
const evaluateNotCondition = (
  condition: Condition,
  formState: Record<string, any>,
): boolean => {
  if (!condition.conditions || condition.conditions.length === 0) {
    return true
  }

  const cond = condition.conditions.at(0)
  if (!cond) {
    return true
  }

  return !evaluateCondition(cond, formState)
}

/**
 * Evaluates an EXISTS condition (field exists and is not empty)
 */
const evaluateExistsCondition = (
  condition: Condition,
  formState: Record<string, any>,
): boolean => {
  if (!condition.field) {
    return false
  }

  const value = getValueByPath(formState, condition.field)
  return !isEmpty(value)
}

/**
 * Evaluates a custom expression condition
 */
const evaluateExpressionCondition = (
  condition: Condition,
  formState: Record<string, any>,
): boolean => {
  const log = Logger.withContext()
  if (!condition.expression) {
    return true
  }

  // For a real implementation, you'd use a JavaScript expression evaluator
  // This is a simplified implementation
  try {
    // WARNING: Using new Function is potentially dangerous if expressions are user-provided
    // You should use a safer alternative in production
    const evalFunc = new Function('data', `return ${condition.expression}`)
    return Boolean(evalFunc(formState))
  } catch (error) {
    log.error(`Error evaluating expression: ${condition.expression}`, error)
    return false
  }
}

/**
 * Gets a value from a nested object using dot notation
 */
export const getValueByPath = (obj: Record<string, any>, path: string): any => {
  const parts = path.split('.')

  // Handle array indexing
  const arrayRegex = /(.*)\[(\d+)\]$/

  let current = obj

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    // Check if this part contains an array index
    const matches = part?.match(arrayRegex)

    if (matches && matches[1] !== undefined) {
      // It's an array access
      const fieldName = matches[1]
      const index = Number.parseInt(matches[2] || '0', 10)

      // Get the array
      const arr = current[fieldName]
      if (!arr || !Array.isArray(arr) || index < 0 || index >= arr.length) {
        return undefined
      }

      // If this is the last part, return the array element
      if (i === parts.length - 1) {
        return arr[index]
      }

      // Otherwise, continue down the path
      const nextValue = arr[index]
      if (nextValue && typeof nextValue === 'object') {
        current = nextValue as Record<string, any>
      } else {
        return undefined
      }
    } else {
      // Regular field access
      if (!current || typeof current !== 'object' || part === undefined) {
        return undefined
      }

      if (i === parts.length - 1) {
        return current[part]
      }

      current = current[part]
    }
  }

  return undefined
}

/**
 * Checks if a value is empty
 */
export const isEmpty = (value: any): boolean => {
  if (value === null || value === undefined) {
    return true
  }

  if (typeof value === 'string') {
    return value.trim() === ''
  }

  if (Array.isArray(value)) {
    return value.length === 0
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0
  }

  return false
}

/**
 * Performs a deep equality check between two values
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) {
    return true
  }

  if (a === null || a === undefined || b === null || b === undefined) {
    return false
  }

  if (typeof a !== typeof b) {
    return false
  }

  if (typeof a !== 'object') {
    return a === b
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false
      }
    }

    return true
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
      return false
    }
  }

  return true
}
