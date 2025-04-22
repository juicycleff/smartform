import React, {  memo } from 'react';
import { FieldRendererProps } from '../types';
import { useFormContext } from '../components/FormContext';
import { createSafeFieldId } from '../utils/fieldUtils';

/**
 * ShadCN UI field renderer component
 *
 * This renderer uses ShadCN UI components instead of the default
 * components. It automatically maps field types to the appropriate
 * ShadCN UI components.
 *
 * Note: In a real implementation, this would import and use the actual
 * ShadCN UI components. For now, this is just a placeholder that shows
 * how it would be structured.
 */
export const shadcnRenderer = memo((props: FieldRendererProps) => {
    const { field, name, context } = props;
    const { components, getFieldProps } = useFormContext();

    // Get the field properties
    const fieldProps = getFieldProps(name);

    // Create a safe ID for the field
    const id = createSafeFieldId(name);

    // ShadCN UI component mapping
    // In a real implementation, you would import these from the ShadCN UI library
    // For now, we're just using placeholders

    // This would map field types to ShadCN UI components
    const shadcnComponents: Record<string, React.ComponentType<any>> = {
        // Text-based fields
        text: components.text, // This would be Input from "@/components/ui/input"
        textarea: components.textarea, // This would be Textarea from "@/components/ui/textarea"
        email: components.text, // Uses Input
        password: components.text, // Uses Input with type="password"

        // Selection fields
        select: components.select, // This would be Select from "@/components/ui/select"
        multiselect: components.multiselect, // This would be MultiSelect from "@/components/ui/multi-select"
        checkbox: components.checkbox, // This would be Checkbox from "@/components/ui/checkbox"
        radio: components.radio, // This would be RadioGroup from "@/components/ui/radio-group"

        // Date/time fields
        date: components.date, // This would be DatePicker from "@/components/ui/date-picker"
        time: components.time, // This would be TimePicker from "@/components/ui/time-picker"
        datetime: components.datetime, // This would be DateTimePicker from "@/components/ui/date-time-picker"

        // Other fields
        number: components.number, // This would be Input with type="number"
        file: components.file, // This would be FileInput from "@/components/ui/file-input"
        switch: components.switch, // This would be Switch from "@/components/ui/switch"
        slider: components.slider, // This would be Slider from "@/components/ui/slider"

        // Complex fields
        group: components.group, // Group component
        array: components.array, // Array component
        oneOf: components.oneOf, // OneOf component
        anyOf: components.anyOf, // AnyOf component
    };

    // Get the ShadCN UI component for this field type
    const Component = shadcnComponents[field.type] || components[field.type];

    if (!Component) {
        console.error(`No component found for field type: ${field.type}`);
        return (
            <div className="smartform-error">
                Unknown field type: {field.type}
            </div>
        );
    }

    // Helper to wrap field components with ShadCN UI form elements
    const renderField = () => {
        return (
            <div className="space-y-2">
                {field.label && (
                    <label
                        htmlFor={id}
                        className={`text-sm font-medium ${fieldProps.required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}
                    >
                        {field.label}
                    </label>
                )}

                <Component
                    {...fieldProps}
                    id={id}
                    name={name}
                    context={context}
                    className={`w-full ${fieldProps.error && fieldProps.touched ? 'border-red-500' : ''}`}
                />

                {fieldProps.error && fieldProps.touched && (
                    <p className="text-sm text-red-500">
                        {Array.isArray(fieldProps.error) ? fieldProps.error[0] : fieldProps.error}
                    </p>
                )}

                {field.helpText && (
                    <p className="text-sm text-gray-500">{field.helpText}</p>
                )}
            </div>
        );
    };

    return renderField();
});

shadcnRenderer.displayName = 'ShadcnRenderer';