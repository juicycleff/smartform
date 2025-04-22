#!/bin/bash

# Create project directories
mkdir -p new/components/fields
mkdir -p new/hooks
mkdir -p new/types
mkdir -p new/utils
mkdir -p new/renderers
mkdir -p @xraph/smartform-react/tests/components
mkdir -p @xraph/smartform-react/tests/hooks
mkdir -p @xraph/smartform-react/tests/utils
mkdir -p @xraph/smartform-react/tests/integration

# Create package.json
cat > @xraph/smartform-react/package.json << 'EOL'
{
  "name": "@xraph/smartform-react",
  "version": "0.1.0",
  "description": "React library for SmartForm - a dynamic, conditional form framework",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "prettier": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "@xraph/smartform-core": "^0.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "cel-js": "^0.0.4"
  },
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "eslint": "^8.40.0",
    "jest": "^29.5.0",
    "prettier": "^2.8.8",
    "typescript": "^5.0.4"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "author": "XGraph",
  "license": "MIT"
}
EOL

# Create tsconfig.json
cat > @xraph/smartform-react/tsconfig.json << 'EOL'
{
  "compilerOptions": {
    "target": "es6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOL

# Create Types

# Create types/index.ts
cat > new/types/index.ts << 'EOL'
export * from './form';
export * from './field';
export * from './validation';
export * from './state';
EOL

# Create types/form.ts
cat > new/types/form.ts << 'EOL'
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
EOL

# Create types/field.ts
cat > new/types/field.ts << 'EOL'
import { Field } from '@xraph/smartform-core';
import { FieldState } from './state';
import { FormContextValue } from './form';

export interface FieldProps<TValue = any> {
  field: Field;
  name: string;
  id: string;
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
  state: FieldState;
  error?: string | string[];
  touched: boolean;
  dirty: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  isVisible: boolean;
  placeholder?: string;
  className?: string;
  context: FormContextValue;
}

export interface FieldRendererProps {
  field: Field;
  name: string;
  context: FormContextValue;
}

export interface FieldArrayHelpers<TItem = any> {
  items: TItem[];
  append: (value: TItem) => void;
  prepend: (value: TItem) => void;
  insert: (index: number, value: TItem) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  swap: (indexA: number, indexB: number) => void;
  replace: (index: number, value: TItem) => void;
  update: (index: number, updater: (value: TItem) => TItem) => void;
}

export interface FieldArrayProps<TItem = any> extends FieldProps<TItem[]> {
  helpers: FieldArrayHelpers<TItem>;
}
EOL

# Create types/validation.ts
cat > new/types/validation.ts << 'EOL'
import { ValidationRule, ValidationType } from '@xraph/smartform-core';

export interface ValidationOptions {
  abortEarly?: boolean;
  validateAllFields?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export interface Validator {
  validate: (value: any, rules: ValidationRule[], context?: any) => string[];
  validateField: (field: string, value: any, rules: ValidationRule[], context?: any) => string[];
  validateForm: (values: Record<string, any>, schema: any, options?: ValidationOptions) => ValidationResult;
}

export interface ValidationConfig {
  mode: 'onChange' | 'onBlur' | 'onSubmit' | 'all';
  validateOnMount?: boolean;
  revalidateOnChange?: boolean;
  debounce?: number;
}
EOL

# Create types/state.ts
cat > new/types/state.ts << 'EOL'
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
EOL

# Create Components

# Create components/Form.tsx
cat > new/components/Form.tsx << 'EOL'
import React, { useEffect, useMemo } from 'react';
import { SmartFormProps } from '../types';
import { FormContext } from './FormContext';
import { useSmartForm } from '../hooks/useSmartForm';
import { ErrorBoundary } from './ErrorBoundary';
import { fieldMapping } from '../utils/fieldMapping';
import { defaultRenderer } from '../renderers/defaultRenderer';
import { shadcnRenderer } from '../renderers/shadcnRenderer';
import { Debug } from './Debug';

export const SmartForm = <TValues extends Record<string, any> = Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
  onChange,
  onError,
  components,
  renderer = 'default',
  debug = false,
  disabled = false,
  readOnly = false,
  className,
  children,
}: SmartFormProps<TValues>) => {
  const formMethods = useSmartForm<TValues>({
    schema,
    initialValues: initialValues as TValues,
    onSubmit,
    onChange,
    onError,
  });

  const { formState, values, errors, isSubmitting, submitForm } = formMethods;

  // Merge default components with custom components
  const mergedComponents = useMemo(() => {
    return { ...fieldMapping, ...components };
  }, [components]);

  // Choose renderer based on prop
  const rendererComponent = useMemo(() => {
    if (typeof renderer === 'function') {
      return renderer;
    }
    return renderer === 'shadcn' ? shadcnRenderer : defaultRenderer;
  }, [renderer]);

  // Call onChange when values change
  useEffect(() => {
    onChange?.(values, formState);
  }, [values, formState, onChange]);

  // Call onError when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      onError?.(errors);
    }
  }, [errors, onError]);

  return (
    <ErrorBoundary>
      <FormContext.Provider
        value={{
          ...formMethods,
          components: mergedComponents,
          renderer: rendererComponent,
          debug,
          disabled,
          readOnly,
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitForm();
          }}
          className={className}
          noValidate
        >
          {schema.fields.map((field) => {
            const isVisible = formMethods.shouldDisplayField(field.id);
            if (!isVisible) return null;

            const FieldComponent = rendererComponent;

            return (
              <FieldComponent
                key={field.id}
                field={field}
                name={field.id}
                context={formMethods as any}
              />
            );
          })}

          {children}

          {debug && <Debug />}
        </form>
      </FormContext.Provider>
    </ErrorBoundary>
  );
};
EOL

# Create components/FormContext.tsx
cat > new/components/FormContext.tsx << 'EOL'
import React, { createContext, useContext } from 'react';
import { FormContextValue } from '../types';

// Create context with an empty default value
export const FormContext = createContext<FormContextValue | undefined>(undefined);

// Custom hook to use the form context
export const useFormContext = <TValues extends Record<string, any> = Record<string, any>>(): FormContextValue<TValues> => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useFormContext must be used within a SmartForm component');
  }

  return context as FormContextValue<TValues>;
};
EOL

# Create components/ErrorBoundary.tsx
cat > new/components/ErrorBoundary.tsx << 'EOL'
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      error,
      errorInfo,
    });

    // Log the error to an error reporting service
    console.error('SmartForm error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="smartform-error">
            <h2>Something went wrong in SmartForm</h2>
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details</summary>
              {this.state.error?.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </details>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
EOL

# Create components/Debug.tsx
cat > new/components/Debug.tsx << 'EOL'
import React, { useState } from 'react';
import { useFormContext } from './FormContext';

export const Debug: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'state' | 'fields' | 'deps' | 'perf'>('state');
  const { formState, fieldStates, values, schema } = useFormContext();

  // Get dependencies for all fields
  const dependencies = Object.keys(fieldStates).reduce((acc, fieldId) => {
    acc[fieldId] = {
      dependencies: fieldStates[fieldId].dependencies,
      dependents: fieldStates[fieldId].dependents,
    };
    return acc;
  }, {} as Record<string, { dependencies: string[], dependents: string[] }>);

  const renderPerformanceMetrics = () => {
    // This would show render counts, timing info, etc.
    // For now, just a placeholder
    return (
      <div className="smartform-debug-perf">
        <p>Performance data will be displayed here.</p>
      </div>
    );
  };

  const renderStateTab = () => {
    return (
      <div className="smartform-debug-state">
        <h4>Form State</h4>
        <pre>{JSON.stringify(formState, null, 2)}</pre>

        <h4>Current Values</h4>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    );
  };

  const renderFieldsTab = () => {
    return (
      <div className="smartform-debug-fields">
        <h4>Field States</h4>
        <table className="smartform-debug-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
              <th>Touched</th>
              <th>Dirty</th>
              <th>Error</th>
              <th>Visible</th>
              <th>Disabled</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(fieldStates).map(([fieldId, state]) => (
              <tr key={fieldId}>
                <td>{fieldId}</td>
                <td>{JSON.stringify(state.value)}</td>
                <td>{state.touched ? '✅' : '❌'}</td>
                <td>{state.dirty ? '✅' : '❌'}</td>
                <td>{state.error ? JSON.stringify(state.error) : '-'}</td>
                <td>{state.visible ? '✅' : '❌'}</td>
                <td>{state.disabled ? '✅' : '❌'}</td>
                <td>{state.required ? '✅' : '❌'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDependenciesTab = () => {
    return (
      <div className="smartform-debug-deps">
        <h4>Field Dependencies</h4>
        <table className="smartform-debug-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Depends On</th>
              <th>Affects</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(dependencies).map(([fieldId, deps]) => (
              <tr key={fieldId}>
                <td>{fieldId}</td>
                <td>{deps.dependencies.length > 0 ? deps.dependencies.join(', ') : '-'}</td>
                <td>{deps.dependents.length > 0 ? deps.dependents.join(', ') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="smartform-debug">
      <div className="smartform-debug-header">
        <h3>SmartForm Debug</h3>
        <div className="smartform-debug-tabs">
          <button
            className={activeTab === 'state' ? 'active' : ''}
            onClick={() => setActiveTab('state')}
          >
            State
          </button>
          <button
            className={activeTab === 'fields' ? 'active' : ''}
            onClick={() => setActiveTab('fields')}
          >
            Fields
          </button>
          <button
            className={activeTab === 'deps' ? 'active' : ''}
            onClick={() => setActiveTab('deps')}
          >
            Dependencies
          </button>
          <button
            className={activeTab === 'perf' ? 'active' : ''}
            onClick={() => setActiveTab('perf')}
          >
            Performance
          </button>
        </div>
      </div>

      <div className="smartform-debug-content">
        {activeTab === 'state' && renderStateTab()}
        {activeTab === 'fields' && renderFieldsTab()}
        {activeTab === 'deps' && renderDependenciesTab()}
        {activeTab === 'perf' && renderPerformanceMetrics()}
      </div>
    </div>
  );
};
EOL

# Create fields/index.ts
cat > new/components/fields/index.ts << 'EOL'
export * from './TextField';
export * from './TextareaField';
export * from './NumberField';
export * from './SelectField';
export * from './MultiSelectField';
export * from './CheckboxField';
export * from './RadioField';
export * from './DateField';
export * from './TimeField';
export * from './DateTimeField';
export * from './FileField';
export * from './GroupField';
export * from './ArrayField';
export * from './OneOfField';
export * from './AnyOfField';
export * from './APIField';
export * from './AuthField';
export * from './BranchField';
export * from './CustomField';
EOL

# Create TextField.tsx as an example field component
cat > new/components/fields/TextField.tsx << 'EOL'
import React, { useCallback, memo } from 'react';
import { FieldProps } from '../../types';

export const TextField: React.FC<FieldProps<string>> = memo(({
  field,
  name,
  id,
  value,
  onChange,
  onBlur,
  state,
  error,
  touched,
  dirty,
  disabled,
  readOnly,
  required,
  isVisible,
  placeholder,
  className,
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  if (!isVisible) return null;

  return (
    <div className={`smartform-field ${error && touched ? 'has-error' : ''} ${className || ''}`}>
      {field.label && (
        <label htmlFor={id} className="smartform-label">
          {field.label}
          {required && <span className="smartform-required">*</span>}
        </label>
      )}

      <input
        type="text"
        id={id}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        placeholder={placeholder || field.placeholder}
        className="smartform-input"
        aria-invalid={!!error && touched}
        aria-describedby={error && touched ? `${id}-error` : undefined}
        data-dirty={dirty || undefined}
        data-touched={touched || undefined}
      />

      {error && touched && (
        <div id={`${id}-error`} className="smartform-error-message">
          {Array.isArray(error) ? error[0] : error}
        </div>
      )}

      {field.helpText && (
        <div className="smartform-help-text">{field.helpText}</div>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';
EOL

# Create ArrayField.tsx as an example complex field
cat > new/components/fields/ArrayField.tsx << 'EOL'
import React, { useCallback, memo } from 'react';
import { FieldArrayProps } from '../../types';
import { useFieldArray } from '../../hooks/useFieldArray';
import { useFormContext } from '../FormContext';

export const ArrayField: React.FC<FieldArrayProps> = memo(({
  field,
  name,
  id,
  value = [],
  onChange,
  onBlur,
  state,
  error,
  touched,
  dirty,
  disabled,
  readOnly,
  required,
  isVisible,
  className,
  context,
}) => {
  const { schema, components, renderer } = useFormContext();

  const helpers = useFieldArray({
    name,
    value,
    onChange,
  });

  const handleAddItem = useCallback(() => {
    // Create a new empty item with default values
    const template = field.nested?.[0];
    if (!template) return;

    // Create default value based on field type
    const defaultValue = template.defaultValue !== undefined
      ? template.defaultValue
      : template.type === 'object' || template.type === 'group'
        ? {}
        : template.type === 'array'
          ? []
          : '';

    helpers.append(defaultValue);
  }, [field.nested, helpers]);

  if (!isVisible) return null;

  const templateField = field.nested?.[0];
  if (!templateField) {
    console.error(`ArrayField ${name} has no template field defined`);
    return null;
  }

  return (
    <div className={`smartform-field smartform-array-field ${error && touched ? 'has-error' : ''} ${className || ''}`}>
      {field.label && (
        <div className="smartform-array-header">
          <label htmlFor={id} className="smartform-label">
            {field.label}
            {required && <span className="smartform-required">*</span>}
          </label>

          {!disabled && !readOnly && (
            <button
              type="button"
              className="smartform-array-add-button"
              onClick={handleAddItem}
              aria-label={`Add ${field.label}`}
            >
              Add
            </button>
          )}
        </div>
      )}

      <div className="smartform-array-items">
        {value.length === 0 ? (
          <div className="smartform-array-empty">
            No items. Click "Add" to create one.
          </div>
        ) : (
          value.map((item, index) => {
            const itemName = `${name}[${index}]`;
            const itemId = `${id}_${index}`;

            return (
              <div key={itemId} className="smartform-array-item">
                <div className="smartform-array-item-header">
                  <span className="smartform-array-item-index">
                    {field.label} #{index + 1}
                  </span>

                  {!disabled && !readOnly && (
                    <div className="smartform-array-item-actions">
                      {index > 0 && (
                        <button
                          type="button"
                          className="smartform-array-item-move-up"
                          onClick={() => helpers.move(index, index - 1)}
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                      )}

                      {index < value.length - 1 && (
                        <button
                          type="button"
                          className="smartform-array-item-move-down"
                          onClick={() => helpers.move(index, index + 1)}
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      )}

                      <button
                        type="button"
                        className="smartform-array-item-remove"
                        onClick={() => helpers.remove(index)}
                        aria-label="Remove"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <div className="smartform-array-item-content">
                  {/* Render the template field with the item value */}
                  {templateField.type === 'group' || templateField.type === 'object' ? (
                    // Render nested fields
                    templateField.nested?.map(nestedField => {
                      const FieldComponent = context.components[nestedField.type] || renderer;

                      return (
                        <FieldComponent
                          key={nestedField.id}
                          field={nestedField}
                          name={`${itemName}.${nestedField.id}`}
                          context={context}
                        />
                      );
                    })
                  ) : (
                    // Render single field
                    React.createElement(context.components[templateField.type] || renderer, {
                      field: templateField,
                      name: itemName,
                      context,
                    })
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {error && touched && (
        <div id={`${id}-error`} className="smartform-error-message">
          {Array.isArray(error) ? error[0] : error}
        </div>
      )}

      {field.helpText && (
        <div className="smartform-help-text">{field.helpText}</div>
      )}
    </div>
  );
});

ArrayField.displayName = 'ArrayField';
EOL

# Create hooks

# Create hooks/useSmartForm.ts
cat > new/hooks/useSmartForm.ts << 'EOL'
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
EOL

# Create hooks/useFieldArray.ts
cat > new/hooks/useFieldArray.ts << 'EOL'
import { useCallback } from 'react';
import { FieldArrayHelpers } from '../types';

interface UseFieldArrayOptions<TItem = any> {
  name: string;
  value: TItem[];
  onChange: (value: TItem[]) => void;
}

export function useFieldArray<TItem = any>({
  name,
  value = [],
  onChange,
}: UseFieldArrayOptions<TItem>): FieldArrayHelpers<TItem> {
  const items = value;

  const append = useCallback((item: TItem) => {
    onChange([...value, item]);
  }, [value, onChange]);

  const prepend = useCallback((item: TItem) => {
    onChange([item, ...value]);
  }, [value, onChange]);

  const insert = useCallback((index: number, item: TItem) => {
    const newValue = [...value];
    newValue.splice(index, 0, item);
    onChange(newValue);
  }, [value, onChange]);

  const remove = useCallback((index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  }, [value, onChange]);

  const move = useCallback((from: number, to: number) => {
    if (from === to) return;

    const newValue = [...value];
    const item = newValue[from];
    newValue.splice(from, 1);
    newValue.splice(to, 0, item);
    onChange(newValue);
  }, [value, onChange]);

  const swap = useCallback((indexA: number, indexB: number) => {
    if (indexA === indexB) return;

    const newValue = [...value];
    const itemA = newValue[indexA];
    const itemB = newValue[indexB];
    newValue[indexA] = itemB;
    newValue[indexB] = itemA;
    onChange(newValue);
  }, [value, onChange]);

  const replace = useCallback((index: number, item: TItem) => {
    const newValue = [...value];
    newValue[index] = item;
    onChange(newValue);
  }, [value, onChange]);

  const update = useCallback((index: number, updater: (value: TItem) => TItem) => {
    const newValue = [...value];
    newValue[index] = updater(newValue[index]);
    onChange(newValue);
  }, [value, onChange]);

  return {
    items,
    append,
    prepend,
    insert,
    remove,
    move,
    swap,
    replace,
    update,
  };
}
EOL

# Create hooks/useConditionalLogic.ts
cat > new/hooks/useConditionalLogic.ts << 'EOL'
import { useCallback, useMemo } from 'react';
import { Condition } from '@xraph/smartform-core';
import { evaluateCondition } from '../utils/conditionEvaluator';
import { getFieldDependencies } from '../utils/pathUtils';

interface UseConditionalLogicOptions {
  schema: any;
  values: Record<string, any>;
}

export function useConditionalLogic({ schema, values }: UseConditionalLogicOptions) {
  // Evaluate a condition against the current form values
  const evaluate = useCallback((condition: Condition) => {
    return evaluateCondition(condition, values);
  }, [values]);

  // Determine if a field should be visible
  const isVisible = useCallback((fieldId: string) => {
    const field = schema.fields.find((f: any) => f.id === fieldId);
    if (!field) return false;

    if (!field.visible) return true;

    return evaluate(field.visible);
  }, [schema.fields, evaluate]);

  // Determine if a field is required
  const isRequired = useCallback((fieldId: string) => {
    const field = schema.fields.find((f: any) => f.id === fieldId);
    if (!field) return false;

    if (field.required) return true;

    if (field.requiredIf) {
      return evaluate(field.requiredIf);
    }

    return false;
  }, [schema.fields, evaluate]);

  // Determine if a field is enabled
  const isEnabled = useCallback((fieldId: string) => {
    const field = schema.fields.find((f: any) => f.id === fieldId);
    if (!field) return true;

    if (!field.enabled) return true;

    return evaluate(field.enabled);
  }, [schema.fields, evaluate]);

  // Get all field dependencies
  const getDependencies = useCallback((fieldId: string) => {
    return getFieldDependencies(schema, fieldId);
  }, [schema]);

  // Get fields that depend on a specific field
  const getDependents = useCallback((fieldId: string) => {
    const allDependencies = Object.keys(values).reduce((acc, field) => {
      acc[field] = getDependencies(field);
      return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(allDependencies)
      .filter(([_, deps]) => deps.includes(fieldId))
      .map(([field]) => field);
  }, [values, getDependencies]);

  // Calculate visibility for all fields at once
  const visibleFields = useMemo(() => {
    return schema.fields.reduce((acc: Record<string, boolean>, field: any) => {
      acc[field.id] = isVisible(field.id);
      return acc;
    }, {});
  }, [schema.fields, isVisible]);

  // Calculate required status for all fields at once
  const requiredFields = useMemo(() => {
    return schema.fields.reduce((acc: Record<string, boolean>, field: any) => {
      acc[field.id] = isRequired(field.id);
      return acc;
    }, {});
  }, [schema.fields, isRequired]);

  // Calculate enabled status for all fields at once
  const enabledFields = useMemo(() => {
    return schema.fields.reduce((acc: Record<string, boolean>, field: any) => {
      acc[field.id] = isEnabled(field.id);
      return acc;
    }, {});
  }, [schema.fields, isEnabled]);

  return {
    evaluate,
    isVisible,
    isRequired,
    isEnabled,
    getDependencies,
    getDependents,
    visibleFields,
    requiredFields,
    enabledFields,
  };
}
EOL

# Create hooks/useValidation.ts
cat > new/hooks/useValidation.ts << 'EOL'
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
EOL

# Create hooks/useDependentFields.ts
cat > new/hooks/useDependentFields.ts << 'EOL'
import { useCallback, useMemo } from 'react';
import { FormSchema, Field } from '@xraph/smartform-core';
import { getFieldDependencies } from '../utils/pathUtils';
import { buildDependencyGraph } from '../utils/dependencyUtils';

interface UseDependentFieldsOptions {
  schema: FormSchema;
  values: Record<string, any>;
}

export function useDependentFields({ schema, values }: UseDependentFieldsOptions) {
  // Build a dependency graph between fields
  const dependencyGraph = useMemo(() => {
    return buildDependencyGraph(schema);
  }, [schema]);

  // Get all fields that depend on a specific field
  const getDependentFields = useCallback((fieldId: string): string[] => {
    if (!dependencyGraph.dependents[fieldId]) {
      return [];
    }

    return dependencyGraph.dependents[fieldId];
  }, [dependencyGraph]);

  // Get all fields that a specific field depends on
  const getFieldDependenciesFn = useCallback((fieldId: string): string[] => {
    return getFieldDependencies(schema, fieldId);
  }, [schema]);

  // Get all fields affected by a change to a specific field
  const getAffectedFields = useCallback((fieldId: string): string[] => {
    const visited = new Set<string>();
    const result: string[] = [];

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const dependents = getDependentFields(id);
      dependents.forEach(dep => {
        result.push(dep);
        traverse(dep);
      });
    };

    traverse(fieldId);
    return result;
  }, [getDependentFields]);

  // Get all fields that have dependencies
  const getFieldsWithDependencies = useMemo(() => {
    return Object.keys(dependencyGraph.dependencies).filter(
      fieldId => dependencyGraph.dependencies[fieldId].length > 0
    );
  }, [dependencyGraph]);

  // Check if a field has any dependencies
  const hasFieldDependencies = useCallback((fieldId: string): boolean => {
    return (
      dependencyGraph.dependencies[fieldId]?.length > 0 ||
      dependencyGraph.dependents[fieldId]?.length > 0
    );
  }, [dependencyGraph]);

  return {
    dependencyGraph,
    getDependentFields,
    getFieldDependencies: getFieldDependenciesFn,
    getAffectedFields,
    getFieldsWithDependencies,
    hasFieldDependencies,
  };
}
EOL

# Create hooks/useFormState.ts
cat > new/hooks/useFormState.ts << 'EOL'
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
EOL