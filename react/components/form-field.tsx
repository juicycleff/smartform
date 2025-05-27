import type React from "react";
import { type Field, FieldType } from "../core";
import { useSmartForm } from "./context";
import ArrayField from "./fields/array-field";
import DefaultFormField from "./fields/default-form-field";

interface FormFieldProps {
  field: Field;
  parentPath?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  parentPath = "",
}) => {
  const { componentRegistry, isFieldVisible } = useSmartForm();
  const fieldPath = parentPath ? `${parentPath}.${field.id}` : field.id;

  // Skip rendering if field is not visible
  if (!isFieldVisible(field)) {
    return null;
  }

  // Handle compound fields with nested fields
  if (field.type === FieldType.Group || field.type === FieldType.Object) {
    return (
      <div className="space-y-3 rounded-md border p-4">
        {field.label && <h3 className="font-medium text-lg">{field.label}</h3>}
        <div className="space-y-3">
          {field.nested
            ?.filter(isFieldVisible)
            .map((nestedField) => (
              <FormField
                key={nestedField.id}
                field={nestedField}
                parentPath={fieldPath}
              />
            ))}
        </div>
      </div>
    );
  }

  // Handle array fields that contain multiple items
  if (field.type === FieldType.Array) {
    // Array fields are more complex and will be implemented separately
    return <ArrayField field={field} parentPath={fieldPath} />;
  }

  // Render a standard field using the component registry
  const FieldComponent = componentRegistry.get(field.type) || DefaultFormField;

  return <FieldComponent field={field} path={fieldPath} />;
};
