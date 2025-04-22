import { FormSchema, Field } from '@xraph/smartform-core';
import { getFieldDependencies } from './pathUtils';

interface DependencyGraph {
    dependencies: Record<string, string[]>; // field -> fields it depends on
    dependents: Record<string, string[]>;   // field -> fields that depend on it
}

/**
 * Builds a dependency graph for all fields in a schema
 */
export function buildDependencyGraph(schema: FormSchema): DependencyGraph {
    const dependencies: Record<string, string[]> = {};
    const dependents: Record<string, string[]> = {};

    // Process all fields recursively
    const processField = (field: Field, prefix = ''): void => {
        const fieldId = prefix ? `${prefix}.${field.id}` : field.id;

        // Get all dependencies for this field
        dependencies[fieldId] = getFieldDependencies(schema, fieldId);

        // Register this field as a dependent for each of its dependencies
        dependencies[fieldId].forEach(dep => {
            if (!dependents[dep]) {
                dependents[dep] = [];
            }

            if (!dependents[dep].includes(fieldId)) {
                dependents[dep].push(fieldId);
            }
        });

        // Process nested fields
        if (field.nested && field.nested.length > 0) {
            field.nested.forEach(nestedField => {
                processField(nestedField, fieldId);
            });
        }
    };

    // Process all top-level fields
    schema.fields.forEach(field => {
        processField(field);
    });

    return { dependencies, dependents };
}

/**
 * Finds all fields affected by a change to the specified fields
 */
export function getAffectedFields(
    fieldIds: string[],
    dependencyGraph: DependencyGraph
): string[] {
    const affectedFields = new Set<string>();
    const visited = new Set<string>();

    // Recursively find all dependent fields
    const findDependents = (fieldId: string): void => {
        if (visited.has(fieldId)) return;
        visited.add(fieldId);

        const dependents = dependencyGraph.dependents[fieldId] || [];

        dependents.forEach(depField => {
            affectedFields.add(depField);
            findDependents(depField);
        });
    };

    // Process each field
    fieldIds.forEach(fieldId => {
        affectedFields.add(fieldId);
        findDependents(fieldId);
    });

    return Array.from(affectedFields);
}

/**
 * Topologically sorts fields based on their dependencies
 */
export function topologicalSortFields(dependencyGraph: DependencyGraph): string[] {
    const sorted: string[] = [];
    const visited: Set<string> = new Set();
    const temp: Set<string> = new Set(); // For detecting cycles

    const allFields = new Set([
        ...Object.keys(dependencyGraph.dependencies),
        ...Object.keys(dependencyGraph.dependents),
    ]);

    // Visit function for depth-first search
    const visit = (fieldId: string): void => {
        // If we've already processed this field, skip it
        if (visited.has(fieldId)) return;

        // If we're currently processing this field, we have a cycle
        if (temp.has(fieldId)) {
            console.warn(`Circular dependency detected involving field: ${fieldId}`);
            return;
        }

        // Mark the field as being processed
        temp.add(fieldId);

        // Visit all dependencies
        const deps = dependencyGraph.dependencies[fieldId] || [];
        deps.forEach(dep => visit(dep));

        // Mark the field as processed and add to sorted list
        temp.delete(fieldId);
        visited.add(fieldId);
        sorted.push(fieldId);
    };

    // Visit all fields
    Array.from(allFields).forEach(fieldId => {
        if (!visited.has(fieldId)) {
            visit(fieldId);
        }
    });

    return sorted;
}