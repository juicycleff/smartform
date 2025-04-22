import { useCallback, useMemo } from 'react';
import { FormSchema, Field, ValidationRule } from '@xraph/smartform-core';
import { ValidationOptions, ValidationResult } from '../types';
import { validateField, validateForm } from '../utils/validationUtils';

interface UseValidationOptions {
  schema: FormSchema;
  values: Record<string, any>;
}

export function useValidation({ schema, values }: UseValidationOptions) {
  // Validate a single field
  const validateFieldFn = useCallback((fieldId: string) => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field) return [];

    const value = values[fieldId];
    return validateField(value, field, values);
  }, [schema.fields, values]);

  // Validate all fields
  const validateAllFields = useCallback((options?: ValidationOptions): ValidationResult => {
    return validateForm(values, schema, options);
  }, [schema, values]);

  // Get all validation rules for a field
  const getFieldRules = useCallback((fieldId: string): ValidationRule[] => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field || !field.validationRules) return [];

    return field.validationRules;
  }, [schema.fields]);

  // Check if a field is required
  const isFieldRequired = useCallback((fieldId: string): boolean => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field) return false;

    return field.required || false;
  }, [schema.fields]);

  // Check if the form is valid
  const isFormValid = useMemo(() => {
    const result = validateAllFields({ validateAllFields: false });
    return result.valid;
  }, [validateAllFields]);

  return {
    validateField: validateFieldFn,
    validateAllFields,
    validateForm: validateAllFields,
    getFieldRules,
    isFieldRequired,
    isFormValid,
  };
}
