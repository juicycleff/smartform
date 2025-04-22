import React, { memo, useContext, useMemo } from 'react';
import { FieldType } from '@xraph/smartform-core';
import { FieldRendererProps } from '../types';
import { FormContext } from './FormContext';
import { getNestedValue } from '../utils/pathUtils';
import { defaultRenderer } from '../renderers/defaultRenderer';
import { shadcnRenderer } from '../renderers/shadcnRenderer';

/**
 * Component for rendering a field based on its type and the current form context
 */
export const FieldRenderer = memo<FieldRendererProps>(({ field, path }) => {
    // Get form context
    const formContext = useContext(FormContext);

    if (!formContext) {
        throw new Error('FieldRenderer must be used within a FormProvider');
    }

    const { state, options, evaluateCondition } = formContext;
    const { values, fieldStates } = state;

    // Get field state
    const fieldState = fieldStates[path] || {
        touched: false,
        dirty: false,
        visible: true,
        enabled: true,
        required: field.required,
        dependent: false,
        dependents: []
    };

    // Skip rendering if the field is not visible
    if (!fieldState.visible) {
        return null;
    }

    // Get field value
    const value = getNestedValue(values, path);

    // Choose the appropriate renderer
    const renderer = options.renderMode === 'shadcn'
        ? shadcnRenderer
        : defaultRenderer;

    // Render the field
    return renderer({ field, formContext, path });
});

FieldRenderer.displayName = 'FieldRenderer';

export default FieldRenderer;