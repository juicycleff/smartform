import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import type React from "react";
import { useFormContext } from "react-hook-form";
import type { Field } from "../../core";
import { useSmartForm } from "../context";

interface CustomFieldProps {
  field: Field;
  path: string;
}

const CustomField: React.FC<CustomFieldProps> = ({ field, path }) => {
  const { isFieldEnabled, isFieldRequired, componentRegistry } = useSmartForm();
  const { control } = useFormContext();

  const disabled = !isFieldEnabled(field);
  const required = isFieldRequired(field);

  // Get the component name from properties
  const componentName = field.properties?.componentName as string;
  const componentProps = {
    ...((field.properties?.componentProps as Record<string, any>) || {}),
    disabled, // Pass disabled state to the custom component
    required, // Pass required state to the custom component
  };

  const CustomComponent = componentName
    ? componentRegistry.get(componentName)
    : undefined;

  // This component would typically look up the custom component from a registry
  // For now, we'll render a placeholder
  return (
    <FormField
      control={control}
      name={path}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel
            className={
              required
                ? 'after:ml-0.5 after:text-red-500 after:content-["*"]'
                : ""
            }
          >
            {field.label}
          </FormLabel>

          <FormControl>
            {CustomComponent ? (
              <CustomComponent
                {...componentProps}
                {...formField}
                formField={formField}
                field={field}
                path={path}
              />
            ) : (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-700">
                  <strong>Component not found:</strong>{" "}
                  {componentName || "No component name specified"}
                </p>
                <p className="mt-2 text-xs text-yellow-600">
                  Register this component in the ComponentRegistry to use it.
                </p>
                <p className="mt-1 text-gray-500 text-xs">
                  Current value: {JSON.stringify(formField.value)}
                </p>
              </div>
            )}
          </FormControl>

          {field.helpText && (
            <FormDescription>{field.helpText}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomField;
