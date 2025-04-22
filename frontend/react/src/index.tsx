/**
 * SmartForm React Library
 *
 * A comprehensive React library for building dynamic, conditional forms based
 * on the @xraph/smartform-core schema.
 */

// Export main components
export { SmartForm } from './components/Form';
export { FormContext, useFormContext } from './components/FormContext';
export { ErrorBoundary } from './components/ErrorBoundary';
export { Debug } from './components/Debug';

// Export hooks
export { useSmartForm } from './hooks/useSmartForm';
export { useFieldArray } from './hooks/useFieldArray';
export { useConditionalLogic } from './hooks/useConditionalLogic';
export { useValidation } from './hooks/useValidation';
export { useDependentFields } from './hooks/useDependentFields';
export { useFormState } from './hooks/useFormState';

// Export utility functions
export { evaluateCondition } from './utils/conditionEvaluator';
export { getFieldDependencies, findFieldById } from './utils/pathUtils';
export { validateField, validateForm } from './utils/validationUtils';
export {
    getInitialValues,
    getDefaultValueForType,
    formatFieldValue
} from './utils/fieldUtils';

// Export renderers
export { defaultRenderer } from './renderers/defaultRenderer';
export { shadcnRenderer } from './renderers/shadcnRenderer';

// Export types
export * from './types';

// Re-export core types
export type {
    FormSchema,
    Field,
    FieldType,
    FormType,
    Condition,
    ConditionType,
    ValidationRule,
    ValidationType,
    Option,
    OptionsType,
    OptionsConfig,
    DynamicSource
} from '@xraph/smartform-core';