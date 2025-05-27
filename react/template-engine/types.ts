export type TemplateContext = Record<string, any>

export type TemplateFunction = (args: any[]) => any | Promise<any>

export interface VariableSuggestion {
  expr: string
  type: string
  description: string
  value?: any
  children?: string[]
  isNested?: boolean
  arrayInfo?: ArrayInfo
  isFunction?: boolean
  signature?: string
}

export interface ArrayInfo {
  itemType: string
  sampleAccess: string
}

export interface TemplatePart {
  evaluate(
    registry: VariableRegistry,
    context: TemplateContext,
  ): any | Promise<any>
}

export interface TemplateExpression {
  raw: string
  parts: TemplatePart[]
}

// Forward declaration for VariableRegistry to avoid circular dependency issues
// The actual class will be in variable-registry.ts
export declare class VariableRegistry {
  variables: Map<string, any>
  functions: Map<string, TemplateFunction>
  constructor()
  registerVariable(name: string, value: any): void
  getVariable(path: string): { value: any; found: boolean }
  registerFunction(name: string, fn: TemplateFunction): void
  getFunction(name: string): {
    func: TemplateFunction | undefined
    found: boolean
  }
  registerStandardFunctions(): void
  generateVariableSuggestions(): VariableSuggestion[]
}
