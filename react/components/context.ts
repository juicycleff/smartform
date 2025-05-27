import { createContext, useContext } from 'react'
import type { TemplateEngine } from '../template-engine'
import type { Field, FormSchema, ValidationResult } from '../core'
import type { ComponentRegistry } from './components-registry.ts'

// Create a context for form-wide functionality
export interface SmartFormContextType {
  schema: FormSchema
  templateEngine: TemplateEngine
  formState: Record<string, any>
  componentRegistry: ComponentRegistry
  getDynamicOptions: (
    fieldId: string,
    dependentValues: Record<string, any>,
  ) => Promise<any[]>
  isFieldVisible: (field: Field) => boolean
  isFieldEnabled: (field: Field) => boolean
  isFieldRequired: (field: Field) => boolean
  validateField: (fieldId: string, value: any) => ValidationResult
  evaluateTemplateExpression: (
    expression: string,
    context?: Record<string, any>,
  ) => any
}

export const SmartFormContext = createContext<SmartFormContextType | undefined>(
  undefined,
)

export const useSmartForm = () => {
  const context = useContext(SmartFormContext)
  if (!context) {
    throw new Error('useSmartForm must be used within a SmartFormProvider')
  }
  return context
}
