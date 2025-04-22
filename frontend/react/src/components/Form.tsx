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
