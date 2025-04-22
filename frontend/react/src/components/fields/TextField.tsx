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
