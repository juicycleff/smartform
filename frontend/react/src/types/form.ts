import { FormSchema } from '@xraph/smartform-core';
import { FieldProps } from './field';
import { FieldState, FormState } from './state';

export interface SmartFormProps<TValues = Record<string, any>> {
  schema: FormSchema;
  initialValues?: Partial<TValues>;
  onSubmit?: (values: TValues) => void | Promise<void>;
  onChange?: (values: TValues, formState: FormState<TValues>) => void;
  onError?: (errors: Record<string, string[]>) => void;
  components?: Record<string, React.ComponentType<FieldProps<any>>>;
  renderer?: 'default' | 'shadcn' | React.ComponentType<FieldProps<any>>;
  debug?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface FormContextValue<TValues = Record<string, any>> {
  schema: FormSchema;
  formState: FormState<TValues>;
  fieldStates: Record<string, FieldState>;
  values: TValues;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  components: Record<string, React.ComponentType<FieldProps<any>>>;
  renderer: 'default' | 'shadcn' | React.ComponentType<FieldProps<any>>;
  debug: boolean;
  disabled: boolean;
  readOnly: boolean;
  setFieldValue: <K extends keyof TValues>(field: K, value: TValues[K]) => void;
  setFieldTouched: (field: string, isTouched: boolean) => void;
  setFieldError: (field: string, error: string | string[] | null) => void;
  validateField: (field: string) => string[] | null;
  validateForm: () => boolean;
  resetForm: () => void;
  submitForm: () => Promise<void>;
  getFieldProps: (field: string) => any;
  getFieldState: (field: string) => FieldState;
  evaluateCondition: (condition: any, values: any) => boolean;
  shouldDisplayField: (field: string) => boolean;
  getFieldDependencies: (field: string) => string[];
}
