import { Checkbox } from "../ui/checkbox";
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
import { FormField as SmartFormField } from "../form-field";

interface AnyOfFieldProps {
  field: Field;
  path: string;
}

const AnyOfField: React.FC<AnyOfFieldProps> = ({ field, path }) => {
  const { isFieldEnabled, isFieldRequired } = useSmartForm();
  const { control, watch } = useFormContext();

  const disabled = !isFieldEnabled(field);
  const required = isFieldRequired(field);

  if (!field.nested || field.nested.length === 0) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-4">
        <p className="text-red-500">
          Error: AnyOf field {field.id} has no options defined
        </p>
      </div>
    );
  }

  // Create checkboxes for each option
  const optionFields = field.nested.map((option) => {
    const optionPath = `${path}.__selected.${option.id}`;
    const isSelected = watch(optionPath) || false;

    return (
      <div key={option.id} className="space-y-4">
        <FormField
          control={control}
          name={optionPath}
          render={({ field: formField }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
              <FormControl>
                <Checkbox
                  checked={formField.value}
                  onCheckedChange={formField.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <FormLabel className="font-medium">{option.label}</FormLabel>
            </FormItem>
          )}
        />

        {isSelected && (
          <div className="ml-8 border-l-2 pl-4">
            <SmartFormField field={option} parentPath={path} />
          </div>
        )}
      </div>
    );
  });

  return (
    <FormItem className="space-y-4 rounded-md border p-4">
      <FormLabel
        className={
          required ? 'after:ml-0.5 after:text-red-500 after:content-["*"]' : ""
        }
      >
        {field.label}
      </FormLabel>

      <div className="space-y-3">{optionFields}</div>

      {field.helpText && <FormDescription>{field.helpText}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
};

export default AnyOfField;
