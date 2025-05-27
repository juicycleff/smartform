import * as standardFunctions from './functions' // Assuming functions.ts exports all standard funcs
import type { TemplateFunction, VariableSuggestion } from './types'
import { getValueByPath } from './utils'

export class VariableRegistry {
  variables: Map<string, any>
  functions: Map<string, TemplateFunction>

  constructor() {
    this.variables = new Map<string, any>()
    this.functions = new Map<string, TemplateFunction>()
    this.registerStandardFunctions()
  }

  registerVariable(name: string, value: any): void {
    this.variables.set(name, value)
  }

  getVariable(path: string): { value: any; found: boolean } {
    const parts = path.split('.')
    if (parts.length === 0) {
      return { value: undefined, found: false }
    }

    const rootVarName = parts[0].split('[')[0] // Handle root like "items" from "items[0]"

    if (this.variables.has(rootVarName)) {
      const rootValue = this.variables.get(rootVarName)
      if (path === rootVarName) {
        // Direct access to root variable
        return { value: rootValue, found: true }
      }
      // Use getValueByPath for nested properties/array elements starting from the root object
      // We need to effectively treat the root variable as the 'data' for getValueByPath.
      // If path is "obj.prop" and "obj" is in registry, getValueByPath needs to work on "prop" against rootValue.
      const value = getValueByPath({ [rootVarName]: rootValue }, path)

      if (value !== undefined) {
        return { value, found: true }
      }
    }

    // Fallback for simple cases or if getValueByPath doesn't find it under the wrapped root
    // The original Go code has more intricate logic for VariablePart evaluation involving context and registry
    // This simplified GetVariable primarily handles direct registry access.
    // More complex path resolution is often handled within VariablePart's evaluate method.

    if (this.variables.has(path)) {
      // Simple case: path is a direct variable name
      return { value: this.variables.get(path), found: true }
    }

    return { value: undefined, found: false }
  }

  registerFunction(name: string, fn: TemplateFunction): void {
    this.functions.set(name, fn)
  }

  getFunction(name: string): {
    func: TemplateFunction | undefined
    found: boolean
  } {
    const fn = this.functions.get(name)
    return { func: fn, found: fn !== undefined }
  }

  registerStandardFunctions(): void {
    // Example based on functions.go
    this.registerFunction('if', standardFunctions.funcIf)
    this.registerFunction('eq', standardFunctions.funcEquals)
    this.registerFunction('ne', standardFunctions.funcNotEquals)
    this.registerFunction('gt', standardFunctions.funcGreaterThan)
    this.registerFunction('lt', standardFunctions.funcLessThan)
    this.registerFunction('gte', standardFunctions.funcGreaterThanOrEqual)
    this.registerFunction('lte', standardFunctions.funcLessThanOrEqual)
    this.registerFunction('format', standardFunctions.funcFormat)
    this.registerFunction('add', standardFunctions.funcAdd)
    this.registerFunction('subtract', standardFunctions.funcSubtract)
    this.registerFunction('multiply', standardFunctions.funcMultiply)
    this.registerFunction('divide', standardFunctions.funcDivide)
    this.registerFunction('mod', standardFunctions.funcModulo)
    this.registerFunction('round', standardFunctions.funcRound)
    this.registerFunction('concat', standardFunctions.funcConcat)
    this.registerFunction('length', standardFunctions.funcLength)
    this.registerFunction('substring', standardFunctions.funcSubstring)
    this.registerFunction('toLower', standardFunctions.funcToLower)
    this.registerFunction('toUpper', standardFunctions.funcToUpper)
    this.registerFunction('trim', standardFunctions.funcTrim)
    this.registerFunction('join', standardFunctions.funcJoin)
    this.registerFunction('first', standardFunctions.funcFirst)
    this.registerFunction('last', standardFunctions.funcLast)
    this.registerFunction('count', standardFunctions.funcCount)
    this.registerFunction('toString', standardFunctions.funcToString)
    this.registerFunction('toNumber', standardFunctions.funcToNumber)
    this.registerFunction('toBool', standardFunctions.funcToBool)
    this.registerFunction('default', standardFunctions.funcDefault)
    this.registerFunction('coalesce', standardFunctions.funcCoalesce)
    this.registerFunction('now', standardFunctions.funcNow)
    this.registerFunction('formatDate', standardFunctions.funcFormatDate)
    this.registerFunction('addDays', standardFunctions.funcAddDays)
    this.registerFunction('and', standardFunctions.funcAnd)
    this.registerFunction('or', standardFunctions.funcOr)
  }

  // generateVariableSuggestions and helpers would go here
  // (Adapted from variable_suggestions.go)
  generateVariableSuggestions(): VariableSuggestion[] {
    const suggestions: VariableSuggestion[] = []

    // Add variables
    for (const [name, value] of this.variables.entries()) {
      const varType = this.getValueType(value)
      const rootSuggestion: VariableSuggestion = {
        expr: name,
        type: varType,
        description: `${name} variable`,
        value: this.getSampleValue(value),
        children: [], // Will be populated by nested suggestions
      }
      suggestions.push(rootSuggestion)

      const nestedSuggestions = this._generateNestedSuggestions(
        name,
        value,
        rootSuggestion,
      )
      suggestions.push(...nestedSuggestions)
    }

    // Add functions
    for (const [name] of this.functions.entries()) {
      const { signature, description } = this.getFunctionInfo(name) //
      suggestions.push({
        expr: name,
        type: 'function',
        description: description,
        isFunction: true,
        signature: signature,
      })
    }
    return suggestions
  }

  private _generateNestedSuggestions(
    prefix: string,
    value: any,
    parentSuggestion?: VariableSuggestion,
  ): VariableSuggestion[] {
    const suggestions: VariableSuggestion[] = [] //

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          const firstItem = value[0]
          const itemExpr = `${prefix}[0]`
          const itemType = this.getValueType(firstItem)

          const itemSuggestion: VariableSuggestion = {
            expr: itemExpr,
            type: itemType,
            description: `First element of ${prefix} array`,
            value: this.getSampleValue(firstItem),
            isNested: true,
          }
          suggestions.push(itemSuggestion)
          suggestions.push(
            ...this._generateNestedSuggestions(
              itemExpr,
              firstItem,
              itemSuggestion,
            ),
          )

          if (parentSuggestion) {
            // Update parent (the array itself) with ArrayInfo
            parentSuggestion.arrayInfo = {
              itemType: itemType,
              sampleAccess: itemExpr,
            }
          }
        }
      } else {
        // Plain object
        const childNames: string[] = []
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            childNames.push(key)
            const propVal = value[key]
            const propExpr = `${prefix}.${key}`
            const propType = this.getValueType(propVal)

            const propSuggestion: VariableSuggestion = {
              expr: propExpr,
              type: propType,
              description: `Property of ${prefix}`,
              value: this.getSampleValue(propVal),
              isNested: true,
              children: [],
            }
            suggestions.push(propSuggestion)
            suggestions.push(
              ...this._generateNestedSuggestions(
                propExpr,
                propVal,
                propSuggestion,
              ),
            )
            if (
              propSuggestion.children &&
              propSuggestion.children.length === 0
            ) {
              // remove children if it's empty
              delete propSuggestion.children
            }
            if (parentSuggestion?.children) {
              parentSuggestion.children.push(key)
            }
          }
        }
        if (parentSuggestion?.children) {
          parentSuggestion.children.sort()
        }
      }
    }
    return suggestions
  }

  private getValueType(value: any): string {
    //
    if (value === null || value === undefined) return 'null'
    if (typeof value === 'boolean') return 'boolean'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (value instanceof Date) return 'date'
    if (Array.isArray(value)) {
      return value.length > 0
        ? `array<${this.getValueType(value[0])}>`
        : 'array'
    }
    if (typeof value === 'object') return 'object'
    return typeof value
  }

  private getSampleValue(value: any): any {
    //
    if (value === null || value === undefined) return null
    if (Array.isArray(value)) {
      return value.length > 0 ? [this.getSampleValue(value[0]), '...'] : []
    }
    if (typeof value === 'object' && !(value instanceof Date)) {
      const sample: Record<string, any> = {}
      const keys = Object.keys(value)
      const limit = 3
      for (let i = 0; i < Math.min(keys.length, limit); i++) {
        sample[keys[i]] = this.getSampleValue(value[keys[i]])
      }
      if (keys.length > limit) sample['...'] = '...'
      return sample
    }
    if (typeof value === 'string' && value.length > 20)
      return value.substring(0, 20) + '...'
    return value
  }

  private getFunctionInfo(name: string): {
    signature: string
    description: string
  } {
    //
    const predefined: Record<
      string,
      { signature: string; description: string }
    > = {
      if: {
        signature: 'if(condition, trueValue, falseValue)',
        description:
          'Returns trueValue if condition is true, otherwise falseValue',
      },
      eq: {
        signature: 'eq(value1, value2)',
        description: 'Returns true if value1 equals value2',
      },
      // ... (add all from functions.go getFunctionInfo)
      coalesce: {
        signature: 'coalesce(value1, value2, ...)',
        description: 'Returns the first non-null, non-empty value',
      },
      now: {
        signature: 'now()',
        description: 'Returns the current date and time',
      },
    }
    return (
      predefined[name] || {
        signature: `${name}(...)`,
        description: 'Custom function',
      }
    )
  }
}
