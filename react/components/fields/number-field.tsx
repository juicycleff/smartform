import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import type React from "react";
import { useFormContext } from "react-hook-form";
import type { Field } from "../../core";
import { useSmartForm } from "../context";
import { TemplateModeWrapper } from "./template-mode-wrapper";

interface NumberFieldProps {
  field: Field;
  path: string;
}

const NumberField: React.FC<NumberFieldProps> = ({ field, path }) => {
  const { isFieldEnabled, isFieldRequired } = useSmartForm();
  const { control } = useFormContext();

  const disabled = !isFieldEnabled(field);
  const required = isFieldRequired(field);

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
          <TemplateModeWrapper
            value={formField.value}
            onChange={formField.onChange}
            onBlur={formField.onBlur}
            path={path}
            disabled={disabled}
          >
            <FormControl>
              <Input
                placeholder={field.placeholder}
                {...formField}
                disabled={disabled}
                type={field.type}
              />
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
};

export default NumberField;
