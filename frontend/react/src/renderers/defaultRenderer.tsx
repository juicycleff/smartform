import { memo } from 'react';
import { FieldRendererProps } from '../types';
import { useFormContext } from '../components/FormContext';
import { createSafeFieldId } from '../utils/fieldUtils';

/**
 * Default field renderer component
 *
 * This component renders a field based on its type using the
 * appropriate component from the form context.
 */
export const defaultRenderer = memo((props: FieldRendererProps) => {
    const { field, name, context } = props;
    const { components, getFieldProps } = useFormContext();

    // Get the component for this field type
    const Component = components[field.type];

    if (!Component) {
        console.error(`No component found for field type: ${field.type}`);
        return (
            <div className="smartform-error">
                Unknown field type: {field.type}
            </div>
        );
    }

    // Get the field properties
    const fieldProps = getFieldProps(name);

    // Create a safe ID for the field
    const id = createSafeFieldId(name);

    return (
        <Component
            {...fieldProps}
            id={id}
            name={name}
            context={context}
        />
    );
});

defaultRenderer.displayName = 'DefaultRenderer';