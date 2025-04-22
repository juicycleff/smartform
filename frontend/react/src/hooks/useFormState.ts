import { useCallback } from 'react';
import { FormState } from '../types';

interface UseFormStateOptions<TValues = Record<string, any>> {
  values: TValues;
  initialValues: Partial<TValues>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  setFieldValue: <K extends keyof TValues>(field: K, value: TValues[K]) => void;
  setFieldTouched: (field: string, isTouched: boolean) => void;
  setFieldError: (field: string, error: string | string[] | null) => void;
  resetForm: () => void;
}

export function useFormState<TValues extends Record<string, any> = Record<string, any>>({
  values,
  initialValues,
  errors,
  touched,
  dirty,
  setFieldValue,
  setFieldTouched,
  setFieldError,
  resetForm,
}: UseFormStateOptions<TValues>) {
  // Set a specific value in form state
  const setValue = useCallback(<K extends keyof TValues>(field: K, value: TValues[K]) => {
    setFieldValue(field, value);
  }, [setFieldValue]);

  // Set multiple values at once
  const setValues = useCallback((newValues: Partial<TValues>) => {
    Object.entries(newValues).forEach(([field, value]) => {
      setFieldValue(field as keyof TValues, value as TValues[keyof TValues]);
    });
  }, [setFieldValue]);

  // Check if a field has been touched
  const isTouched = useCallback((field: string) => {
    return !!touched[field];
  }, [touched]);

  // Check if a field is dirty (value changed from initial)
  const isDirty = useCallback((field: string) => {
    return !!dirty[field];
  }, [dirty]);

  // Get errors for a specific field
  const getFieldError = useCallback((field: string) => {
    return errors[field] || null;
  }, [errors]);

  // Check if a field has errors
  const hasError = useCallback((field: string) => {
    return !!errors[field]?.length;
  }, [errors]);

  // Mark all fields as touched
  const touchAll = useCallback(() => {
    Object.keys(values).forEach(field => {
      setFieldTouched(field, true);
    });
  }, [values, setFieldTouched]);

  // Reset a specific field
  const resetField = useCallback((field: string) => {
    const initialValue = (initialValues as any)?.[field];
    setFieldValue(field as keyof TValues, initialValue);
    setFieldTouched(field, false);
    setFieldError(field, null);
  }, [initialValues, setFieldValue, setFieldTouched, setFieldError]);

  // Get form state summary
  const getFormState = useCallback((): FormState<TValues> => {
    return {
      values,
      initialValues,
      errors,
      touched,
      dirty,
      isSubmitting: false,
      isValidating: false,
      isValid: Object.keys(errors).length === 0,
            isDirty: Object.keys(dirty).length > 0,
            submitCount: 0,
          };
        }, [values, initialValues, errors, touched, dirty]);
      
        return {
          values,
          initialValues,
          errors,
          touched,
          dirty,
          setValue,
          setValues,
          isTouched,
          isDirty,
          getFieldError,
          hasError,
          touchAll,
          resetField,
          resetForm,
          getFormState,
        };
      }
