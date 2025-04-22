export interface FieldState {
  value: any;
  error: string | string[] | null;
  touched: boolean;
  dirty: boolean;
  focus: boolean;
  disabled: boolean;
  visible: boolean;
  required: boolean;
  validating: boolean;
  dependencies: string[];
  dependents: string[];
}

export interface FormState<TValues = Record<string, any>> {
  values: TValues;
  initialValues: Partial<TValues>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  submitCount: number;
}

export type FormAction<TValues = Record<string, any>> =
  | { type: 'SET_FIELD_VALUE'; field: string; value: any }
  | { type: 'SET_FIELD_ERROR'; field: string; error: string | string[] | null }
  | { type: 'SET_FIELD_TOUCHED'; field: string; touched: boolean }
  | { type: 'SET_FIELD_DISABLED'; field: string; disabled: boolean }
  | { type: 'SET_FIELD_VISIBLE'; field: string; visible: boolean }
  | { type: 'SET_FIELD_REQUIRED'; field: string; required: boolean }
  | { type: 'SET_FIELD_VALIDATING'; field: string; validating: boolean }
  | { type: 'SET_MULTIPLE_FIELDS'; fields: Record<string, any> }
  | { type: 'SET_VALUES'; values: Partial<TValues> }
  | { type: 'SET_ERRORS'; errors: Record<string, string[]> }
  | { type: 'SET_TOUCHED'; touched: Record<string, boolean> }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_VALIDATING'; isValidating: boolean }
  | { type: 'SUBMIT_FORM' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_FAILURE'; errors: Record<string, string[]> }
  | { type: 'RESET_FORM' }
  | { type: 'RESET_FIELD'; field: string }
  | { type: 'INITIALIZE_FORM'; values: Partial<TValues> };
