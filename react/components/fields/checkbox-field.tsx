import { Checkbox } from "../ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import type React from "react";
import { useFormContext } from "react-hook-form";
import { TemplateModeWrapper } from "./template-mode-wrapper";
import { type Field, FieldType } from "../../core";
import { useSmartForm } from "../context";

interface CheckboxFieldProps {
  field: Field;
  path: string;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ field, path }) => {
  const { isFieldEnabled, isFieldRequired } = useSmartForm();
  const { control } = useFormContext();

  const disabled = !isFieldEnabled(field);
  const required = isFieldRequired(field);

  // If this is a radio group, render radio buttons
  if (field.type === FieldType.Radio && field.options?.static) {
    return (
      <FormField
        control={control}
        name={path}
        render={({ field: formField }) => (
          <FormItem className="sf:space-y-3">
            <FormLabel
              className={
                required
                  ? 'after:ml-0.5 after:text-red-500 after:content-["*"]'
                  : ""
              }
            >
              {field.label}
            </FormLabel>
            <TemplateModeWrapper
              value={formField.value}
              onChange={formField.onChange}
              onBlur={formField.onBlur}
              path={path}
              disabled={disabled}
            >
              <FormControl>
                <RadioGroup
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                  disabled={disabled}
                  className="flex flex-col space-y-1"
                >
                  {field.options?.static?.map((option) => (
                    <FormItem
                      key={String(option.value)}
                      className="flex items-center space-x-3 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={String(option.value)} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {option.label}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
            </TemplateModeWrapper>
            {field.helpText && (
              <FormDescription>{field.helpText}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Otherwise, render a checkbox
  return (
    <FormField
      control={control}
      name={path}
      render={({ field: formField }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={formField.value}
              onCheckedChange={formField.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel
              className={
                required
                  ? 'after:ml-0.5 after:text-red-500 after:content-["*"]'
                  : ""
              }
            >
              {field.label}
            </FormLabel>
            {field.helpText && (
              <FormDescription>{field.helpText}</FormDescription>
            )}
          </div>
        </FormItem>
      )}
    />
  );
};

export default CheckboxField;
