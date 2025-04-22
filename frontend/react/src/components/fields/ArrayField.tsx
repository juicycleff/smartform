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
