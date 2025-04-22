import { useCallback, useMemo } from 'react';
import {Condition, Validator} from '@xraph/smartform-core';
import { evaluateCondition } from '../utils/conditionEvaluator';
import { getFieldDependencies } from '../utils/pathUtils';

interface UseConditionalLogicOptions {
  schema: any;
  values: Record<string, any>;
}

export function useConditionalLogic({ schema, values }: UseConditionalLogicOptions) {
  const validator = new Validator();
  // Evaluate a condition against the current form values
  const evaluate = useCallback((condition: Condition) => {
    return evaluateCondition(condition, values);
  }, [values]);

  // Determine if a field should be visible
  const isVisible = useCallback((fieldId: string) => {
    const field = schema.fields.find((f: any) => f.id === fieldId);
    if (!field) return false;

    if (!field.visible) return true;

    return evaluate(field.visible);
  }, [schema.fields, evaluate]);

  // Determine if a field is required
  const isRequired = useCallback((fieldId: string) => {
    const field = schema.fields.find((f: any) => f.id === fieldId);
    if (!field) return false;

    if (field.required) return true;

    if (field.requiredIf) {
      return evaluate(field.requiredIf);
    }

    return false;
  }, [schema.fields, evaluate]);

  // Determine if a field is enabled
  const isEnabled = useCallback((fieldId: string) => {
    const field = schema.fields.find((f: any) => f.id === fieldId);
    if (!field) return true;

    if (!field.enabled) return true;

    return evaluate(field.enabled);
  }, [schema.fields, evaluate]);

  // Get all field dependencies
  const getDependencies = useCallback((fieldId: string) => {
    return getFieldDependencies(schema, fieldId);
  }, [schema]);

  // Get fields that depend on a specific field
  const getDependents = useCallback((fieldId: string) => {
    const allDependencies = Object.keys(values).reduce((acc, field) => {
      acc[field] = getDependencies(field);
      return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(allDependencies)
      .filter(([_, deps]) => deps.includes(fieldId))
      .map(([field]) => field);
  }, [values, getDependencies]);

  // Calculate visibility for all fields at once
  const visibleFields = useMemo(() => {
    return schema.fields.reduce((acc: Record<string, boolean>, field: any) => {
      acc[field.id] = isVisible(field.id);
      return acc;
    }, {});
  }, [schema.fields, isVisible]);

  // Calculate required status for all fields at once
  const requiredFields = useMemo(() => {
    return schema.fields.reduce((acc: Record<string, boolean>, field: any) => {
      acc[field.id] = isRequired(field.id);
      return acc;
    }, {});
  }, [schema.fields, isRequired]);

  // Calculate enabled status for all fields at once
  const enabledFields = useMemo(() => {
    return schema.fields.reduce((acc: Record<string, boolean>, field: any) => {
      acc[field.id] = isEnabled(field.id);
      return acc;
    }, {});
  }, [schema.fields, isEnabled]);

  return {
    evaluate,
    isVisible,
    isRequired,
    isEnabled,
    getDependencies,
    getDependents,
    visibleFields,
    requiredFields,
    enabledFields,
  };
}
