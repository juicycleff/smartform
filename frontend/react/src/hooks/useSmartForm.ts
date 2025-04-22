import { useReducer, useCallback, useMemo, useEffect, useState } from 'react';
import {
  FormSchema,
  Field,
  Condition,
  ValidationRule
} from '@xraph/smartform-core';
import { FormState, FormAction, FieldState, FormContextValue } from '../types';
import { getInitialValues } from '../utils/fieldUtils';
import { evaluateCondition } from '../utils/conditionEvaluator';
import { getFieldDependencies } from '../utils/pathUtils';
import { validateField, validateForm } from '../utils/validationUtils';

interface UseSmartFormOptions<TValues = Record<string, any>> {
  schema: FormSchema;
  initialValues?: Partial<TValues>;
  onSubmit?: (values: TValues) => void | Promise<void>;
  onChange?: (values: TValues, formState: FormState<TValues>) => void;
  onError?: (errors: Record<string, string[]>) => void;
}

function formReducer<TValues>(state: FormState<TValues>, action: FormAction<TValues>): FormState<TValues> {
  switch (action.type) {
    case 'SET_FIELD_VALUE': {
      const { field, value } = action;
      const newValues = { ...state.values, [field]: value } as TValues;

      return {
        ...state,
        values: newValues,
        dirty: { ...state.dirty, [field]: true },
        isDirty: true,
      };
    }

    case 'SET_FIELD_ERROR': {
      const { field, error } = action;
      const newErrors = { ...state.errors };

      if (error === null) {
        delete newErrors[field];
      } else {
        newErrors[field] = Array.isArray(error) ? error : [error];
      }

      const isValid = Object.keys(newErrors).length === 0;

      return {
        ...state,
        errors: newErrors,
        isValid,
      };
    }

    case 'SET_FIELD_TOUCHED': {
      const { field, touched } = action;
      return {
        ...state,
        touched: { ...state.touched, [field]: touched },
      };
    }

    case 'SET_VALUES': {
      const { values } = action;
      const newValues = { ...state.values, ...values } as TValues;

      return {
        ...state,
        values: newValues,
        isDirty: true,
      };
    }

    case 'SET_ERRORS': {
      const { errors } = action;
      const isValid = Object.keys(errors).length === 0;

      return {
        ...state,
        errors,
        isValid,
      };
    }

    case 'SET_TOUCHED': {
      const { touched } = action;
      return {
        ...state,
        touched,
      };
    }

    case 'SET_SUBMITTING': {
      const { isSubmitting } = action;
      return {
        ...state,
        isSubmitting,
      };
    }

    case 'SET_VALIDATING': {
      const { isValidating } = action;
      return {
        ...state,
        isValidating,
      };
    }

    case 'SUBMIT_FORM': {
      return {
        ...state,
        isSubmitting: true,
        submitCount: state.submitCount + 1,
      };
    }

    case 'SUBMIT_SUCCESS': {
      return {
        ...state,
        isSubmitting: false,
      };
    }

    case 'SUBMIT_FAILURE': {
      const { errors } = action;
      return {
        ...state,
        isSubmitting: false,
        errors,
        isValid: false,
      };
    }

    case 'RESET_FORM': {
      return {
        ...state,
        values: state.initialValues as TValues,
        errors: {},
        touched: {},
        dirty: {},
        isSubmitting: false,
        isValidating: false,
        isValid: true,
        isDirty: false,
      };
    }

    case 'RESET_FIELD': {
      const { field } = action;
      const initialValue = (state.initialValues as any)?.[field];

      const newValues = { ...state.values } as TValues;
      (newValues as any)[field] = initialValue;

      const newErrors = { ...state.errors };
      delete newErrors[field];

      const newTouched = { ...state.touched };
      delete newTouched[field];

      const newDirty = { ...state.dirty };
      delete newDirty[field];

      return {
        ...state,
        values: newValues,
        errors: newErrors,
        touched: newTouched,
        dirty: newDirty,
        isValid: Object.keys(newErrors).length === 0,
        isDirty: Object.keys(newDirty).length > 0,
      };
    }

    case 'INITIALIZE_FORM': {
      const { values } = action;
      return {
        ...state,
        initialValues: { ...state.initialValues, ...values } as Partial<TValues>,
        values: { ...state.values, ...values } as TValues,
      };
    }

    default:
      return state;
  }
}

export function useSmartForm<TValues extends Record<string, any> = Record<string, any>>(
  options: UseSmartFormOptions<TValues>
): FormContextValue<TValues> {
  const { schema, initialValues = {} as Partial<TValues>, onSubmit, onChange, onError } = options;

  // Compute initial values from schema and provided initialValues
  const computedInitialValues = useMemo(() => {
    return {
      ...getInitialValues(schema),
      ...initialValues,
    } as TValues;
  }, [schema, initialValues]);

  // Initialize form state
  const [formState, dispatch] = useReducer(formReducer<TValues>, {
    values: computedInitialValues,
    initialValues: initialValues as Partial<TValues>,
    errors: {},
    touched: {},
    dirty: {},
    isSubmitting: false,
    isValidating: false,
    isValid: true,
    isDirty: false,
    submitCount: 0,
  });

  // Track field states
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});

  // Field handlers
  const setFieldValue = useCallback(<K extends keyof TValues>(
    field: K,
    value: TValues[K]
  ) => {
    dispatch({ type: 'SET_FIELD_VALUE', field: field as string, value });

    // Update field state
    setFieldStates(prev => ({
      ...prev,
      [field as string]: {
        ...prev[field as string],
        value,
        dirty: true,
      }
    }));
  }, []);

  const setFieldTouched = useCallback((field: string, isTouched: boolean) => {
    dispatch({ type: 'SET_FIELD_TOUCHED', field, touched: isTouched });

    // Update field state
    setFieldStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        touched: isTouched,
      }
    }));
  }, []);

  const setFieldError = useCallback((field: string, error: string | string[] | null) => {
    dispatch({ type: 'SET_FIELD_ERROR', field, error });

    // Update field state
    setFieldStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        error,
      }
    }));
  }, []);

  // Validation
  const validateFieldFn = useCallback((field: string) => {
    const fieldSchema = schema.fields.find(f => f.id === field);
    if (!fieldSchema) return null;

    const value = (formState.values as any)[field];
    const result = validateField(value, fieldSchema, formState.values);

    if (result.length > 0) {
      setFieldError(field, result);
    } else {
      setFieldError(field, null);
    }

    return result.length > 0 ? result : null;
  }, [formState.values, schema.fields, setFieldError]);

  const validateFormFn = useCallback(() => {
    dispatch({ type: 'SET_VALIDATING', isValidating: true });

    const result = validateForm(formState.values, schema);
    dispatch({ type: 'SET_ERRORS', errors: result.errors });

    // Update field states with errors
    setFieldStates(prev => {
      const newStates = { ...prev };

      Object.entries(result.errors).forEach(([field, errors]) => {
        newStates[field] = {
          ...newStates[field],
          error: errors,
        };
      });

      return newStates;
    });

    dispatch({ type: 'SET_VALIDATING', isValidating: false });
    return result.valid;
  }, [formState.values, schema]);

  // Form submission
  const submitForm = useCallback(async () => {
    dispatch({ type: 'SUBMIT_FORM' });

    // Mark all fields as touched
    const allTouched = Object.keys(fieldStates).reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);

    dispatch({ type: 'SET_TOUCHED', touched: allTouched });

    // Validate form
    const isValid = validateFormFn();

    if (!isValid) {
      onError?.(formState.errors);
      dispatch({ type: 'SUBMIT_FAILURE', errors: formState.errors });
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(formState.values);
      }
      dispatch({ type: 'SUBMIT_SUCCESS' });
    } catch (error) {
      console.error('Form submission error:', error);
      dispatch({ type: 'SUBMIT_FAILURE', errors: { form: [(error as Error).message] } });
    }
  }, [fieldStates, formState.errors, formState.values, onError, onSubmit, validateFormFn]);

  // Form reset
  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });

    // Reset field states
    setFieldStates(prev => {
      const newStates = { ...prev };

      Object.keys(newStates).forEach(field => {
        newStates[field] = {
          ...newStates[field],
          value: (computedInitialValues as any)[field],
          error: null,
          touched: false,
          dirty: false,
        };
      });

      return newStates;
    });
  }, [computedInitialValues]);

  // Condition evaluation
  const evaluateConditionFn = useCallback((condition: Condition, values: any) => {
    return evaluateCondition(condition, values);
  }, []);

  // Field visibility
  const shouldDisplayField = useCallback((fieldId: string) => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field) return false;

    if (!field.visible) return true;

    return evaluateCondition(field.visible, formState.values);
  }, [schema.fields, formState.values]);

  // Field dependencies
  const getFieldDependenciesFn = useCallback((fieldId: string) => {
    return getFieldDependencies(schema, fieldId);
  }, [schema]);

  // Field props
  const getFieldProps = useCallback((fieldId: string) => {
    const field = schema.fields.find(f => f.id === fieldId);
    if (!field) return {};

    const value = (formState.values as any)[fieldId];
    const error = formState.errors[fieldId];
    const touched = !!formState.touched[fieldId];
    const dirty = !!formState.dirty[fieldId];

    return {
      field,
      name: fieldId,
      id: `smartform-${fieldId}`,
      value,
      onChange: (newValue: any) => setFieldValue(fieldId as keyof TValues, newValue),
      onBlur: () => setFieldTouched(fieldId, true),
      state: fieldStates[fieldId] || {
        value,
        error,
        touched,
        dirty,
        focus: false,
        disabled: false,
        visible: true,
        required: field.required,
        validating: false,
        dependencies: [],
        dependents: [],
      },
      error,
      touched,
      dirty,
      disabled: false,
      readOnly: false,
      required: field.required,
      isVisible: shouldDisplayField(fieldId),
      placeholder: field.placeholder,
    };
  }, [schema.fields, formState.values, formState.errors, formState.touched, formState.dirty, fieldStates, setFieldValue, setFieldTouched, shouldDisplayField]);

  // Get field state
  const getFieldState = useCallback((fieldId: string) => {
    return fieldStates[fieldId] || {
      value: (formState.values as any)[fieldId],
      error: formState.errors[fieldId] || null,
      touched: !!formState.touched[fieldId],
      dirty: !!formState.dirty[fieldId],
      focus: false,
      disabled: false,
      visible: true,
      required: !!schema.fields.find(f => f.id === fieldId)?.required,
      validating: false,
      dependencies: [],
      dependents: [],
    };
  }, [fieldStates, formState.values, formState.errors, formState.touched, formState.dirty, schema.fields]);

  // Initialize field states when the schema changes
  useEffect(() => {
    const initialFieldStates: Record<string, FieldState> = {};

    // Function to recursively process fields
    const processFields = (fields: Field[], prefix = '') => {
      fields.forEach(field => {
        const fieldId = prefix ? `${prefix}.${field.id}` : field.id;

        // Calculate field dependencies
        const dependencies = getFieldDependencies(schema, fieldId);

        initialFieldStates[fieldId] = {
          value: (formState.values as any)[fieldId],
          error: formState.errors[fieldId] || null,
          touched: !!formState.touched[fieldId],
          dirty: !!formState.dirty[fieldId],
          focus: false,
          disabled: false,
          visible: !field.visible || evaluateCondition(field.visible, formState.values),
          required: field.required,
          validating: false,
          dependencies,
          dependents: [],
        };

        // Process nested fields
        if (field.nested && field.nested.length > 0) {
          processFields(field.nested, fieldId);
        }
      });
    };

    processFields(schema.fields);

    // Calculate dependents (inverse of dependencies)
    Object.entries(initialFieldStates).forEach(([fieldId, state]) => {
      state.dependencies.forEach(dep => {
        if (initialFieldStates[dep]) {
          if (!initialFieldStates[dep].dependents) {
            initialFieldStates[dep].dependents = [];
          }
          initialFieldStates[dep].dependents.push(fieldId);
        }
      });
    });

    setFieldStates(initialFieldStates);
  }, [schema, formState.values, formState.errors, formState.touched, formState.dirty]);

  return {
    schema,
    formState,
    fieldStates,
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    dirty: formState.dirty,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    components: {},
    renderer: 'default',
    debug: false,
    disabled: false,
    readOnly: false,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField: validateFieldFn,
    validateForm: validateFormFn,
    resetForm,
    submitForm,
    getFieldProps,
    getFieldState,
    evaluateCondition: evaluateConditionFn,
    shouldDisplayField,
    getFieldDependencies: getFieldDependenciesFn,
  };
}
