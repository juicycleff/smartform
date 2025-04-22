import { useCallback, useMemo } from 'react';
import { FormSchema, Field } from '@xraph/smartform-core';
import { getFieldDependencies } from '../utils/pathUtils';
import { buildDependencyGraph } from '../utils/dependencyUtils';

interface UseDependentFieldsOptions {
  schema: FormSchema;
  values: Record<string, any>;
}

export function useDependentFields({ schema, values }: UseDependentFieldsOptions) {
  // Build a dependency graph between fields
  const dependencyGraph = useMemo(() => {
    return buildDependencyGraph(schema);
  }, [schema]);

  // Get all fields that depend on a specific field
  const getDependentFields = useCallback((fieldId: string): string[] => {
    if (!dependencyGraph.dependents[fieldId]) {
      return [];
    }

    return dependencyGraph.dependents[fieldId];
  }, [dependencyGraph]);

  // Get all fields that a specific field depends on
  const getFieldDependenciesFn = useCallback((fieldId: string): string[] => {
    return getFieldDependencies(schema, fieldId);
  }, [schema]);

  // Get all fields affected by a change to a specific field
  const getAffectedFields = useCallback((fieldId: string): string[] => {
    const visited = new Set<string>();
    const result: string[] = [];

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const dependents = getDependentFields(id);
      dependents.forEach(dep => {
        result.push(dep);
        traverse(dep);
      });
    };

    traverse(fieldId);
    return result;
  }, [getDependentFields]);

  // Get all fields that have dependencies
  const getFieldsWithDependencies = useMemo(() => {
    return Object.keys(dependencyGraph.dependencies).filter(
      fieldId => dependencyGraph.dependencies[fieldId].length > 0
    );
  }, [dependencyGraph]);

  // Check if a field has any dependencies
  const hasFieldDependencies = useCallback((fieldId: string): boolean => {
    return (
      dependencyGraph.dependencies[fieldId]?.length > 0 ||
      dependencyGraph.dependents[fieldId]?.length > 0
    );
  }, [dependencyGraph]);

  return {
    dependencyGraph,
    getDependentFields,
    getFieldDependencies: getFieldDependenciesFn,
    getAffectedFields,
    getFieldsWithDependencies,
    hasFieldDependencies,
  };
}
