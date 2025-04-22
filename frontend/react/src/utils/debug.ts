import { FormSchema, Field, Condition } from '@xraph/smartform-core';
import { FormState, FieldState } from '../types';

/**
 * Performance data for debugging
 */
interface PerformanceData {
    renders: Record<string, number>;
    lastRenderTime: Record<string, number>;
    evaluations: Record<string, number>;
    validations: Record<string, number>;
    timings: {
        render: Record<string, number[]>;
        evaluate: Record<string, number[]>;
        validate: Record<string, number[]>;
    };
}

// Global performance data
let performanceData: PerformanceData = {
    renders: {},
    lastRenderTime: {},
    evaluations: {},
    validations: {},
    timings: {
        render: {},
        evaluate: {},
        validate: {},
    },
};

/**
 * Resets performance data
 */
export function resetPerformanceData(): void {
    performanceData = {
        renders: {},
        lastRenderTime: {},
        evaluations: {},
        validations: {},
        timings: {
            render: {},
            evaluate: {},
            validate: {},
        },
    };
}

/**
 * Tracks a field render
 */
export function trackFieldRender(fieldId: string): void {
    performanceData.renders[fieldId] = (performanceData.renders[fieldId] || 0) + 1;
    performanceData.lastRenderTime[fieldId] = Date.now();
}

/**
 * Tracks a field evaluation
 */
export function trackFieldEvaluation(fieldId: string): void {
    performanceData.evaluations[fieldId] = (performanceData.evaluations[fieldId] || 0) + 1;
}

/**
 * Tracks a field validation
 */
export function trackFieldValidation(fieldId: string): void {
    performanceData.validations[fieldId] = (performanceData.validations[fieldId] || 0) + 1;
}

/**
 * Tracks timing of an operation
 */
export function trackTiming(type: 'render' | 'evaluate' | 'validate', fieldId: string, time: number): void {
    if (!performanceData.timings[type][fieldId]) {
        performanceData.timings[type][fieldId] = [];
    }

    performanceData.timings[type][fieldId].push(time);
}

/**
 * Gets performance data
 */
export function getPerformanceData(): PerformanceData {
    return performanceData;
}

/**
 * Gets performance summary
 */
export function getPerformanceSummary(): Record<string, any> {
    const totalRenders = Object.values(performanceData.renders).reduce((sum, count) => sum + count, 0);
    const totalEvaluations = Object.values(performanceData.evaluations).reduce((sum, count) => sum + count, 0);
    const totalValidations = Object.values(performanceData.validations).reduce((sum, count) => sum + count, 0);

    // Calculate average render time
    let totalRenderTime = 0;
    let renderCount = 0;

    Object.values(performanceData.timings.render).forEach(times => {
        times.forEach(time => {
            totalRenderTime += time;
            renderCount++;
        });
    });

    const averageRenderTime = renderCount > 0 ? totalRenderTime / renderCount : 0;

    // Find fields with the most renders
    const fieldsByRenderCount = Object.entries(performanceData.renders)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 5);

    return {
        totalRenders,
        totalEvaluations,
        totalValidations,
        averageRenderTime,
        topFields: fieldsByRenderCount,
    };
}

/**
 * Visualizes form dependencies
 */
export function visualizeDependencies(schema: FormSchema): Record<string, any> {
    const dependencies: Record<string, string[]> = {};
    const dependents: Record<string, string[]> = {};

    // Process all fields recursively
    const processField = (field: Field, prefix = ''): void => {
        const fieldId = prefix ? `${prefix}.${field.id}` : field.id;
        dependencies[fieldId] = [];

        // Check visibility condition
        if (field.visible) {
            extractDependencies(field.visible, dependencies[fieldId]);
        }

        // Check requiredIf condition
        if (field.requiredIf) {
            extractDependencies(field.requiredIf, dependencies[fieldId]);
        }

        // Check enabled condition
        if (field.enabled) {
            extractDependencies(field.enabled, dependencies[fieldId]);
        }

        // Process options dependencies
        if (field.options) {
            if (field.options.type === 'dependent' && field.options.dependency) {
                dependencies[fieldId].push(field.options.dependency.field);
            }

            if (field.options.type === 'dynamic' && field.options.dynamicSource?.refreshOn) {
                dependencies[fieldId].push(...field.options.dynamicSource.refreshOn);
            }
        }

        // Process nested fields
        if (field.nested && field.nested.length > 0) {
            field.nested.forEach(nestedField => {
                processField(nestedField, fieldId);
            });
        }
    };

    // Extract dependencies from a condition
    const extractDependencies = (condition: Condition, deps: string[]): void => {
        if (!condition) return;

        switch (condition.type) {
            case 'simple':
                if (condition.field && !deps.includes(condition.field)) {
                    deps.push(condition.field);
                }
                break;

            case 'and':
            case 'or':
                if (condition.conditions) {
                    condition.conditions.forEach(cond => extractDependencies(cond, deps));
                }
                break;

            case 'not':
                if (condition.conditions && condition.conditions[0]) {
                    extractDependencies(condition.conditions[0], deps);
                }
                break;

            case 'exists':
                if (condition.field && !deps.includes(condition.field)) {
                    deps.push(condition.field);
                }
                break;
        }
    };

    // Process all top-level fields
    schema.fields.forEach(field => {
        processField(field);
    });

    // Build dependents (inverse of dependencies)
    Object.entries(dependencies).forEach(([fieldId, deps]) => {
        deps.forEach(dep => {
            if (!dependents[dep]) {
                dependents[dep] = [];
            }

            if (!dependents[dep].includes(fieldId)) {
                dependents[dep].push(fieldId);
            }
        });
    });

    return {
        dependencies,
        dependents,
    };
}

/**
 * Formats the form state for display
 */
export function formatFormState<TValues = Record<string, any>>(formState: FormState<TValues>): Record<string, any> {
    return {
        values: formState.values,
        errors: formState.errors,
        touched: formState.touched,
        dirty: formState.dirty,
        isSubmitting: formState.isSubmitting,
        isValidating: formState.isValidating,
        isValid: formState.isValid,
        isDirty: formState.isDirty,
        submitCount: formState.submitCount,
    };
}

/**
 * Formats field states for display
 */
export function formatFieldStates(fieldStates: Record<string, FieldState>): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(fieldStates).forEach(([fieldId, state]) => {
        result[fieldId] = {
            value: state.value,
            error: state.error,
            touched: state.touched,
            dirty: state.dirty,
            visible: state.visible,
            required: state.required,
            disabled: state.disabled,
            dependencies: state.dependencies,
            dependents: state.dependents,
        };
    });

    return result;
}

/**
 * Creates a debug log entry
 */
export function debugLog(message: string, data?: any): void {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[SmartForm] ${message}`, data);
    }
}

/**
 * Creates a debug warning entry
 */
export function debugWarn(message: string, data?: any): void {
    if (process.env.NODE_ENV !== 'production') {
        console.warn(`[SmartForm] ${message}`, data);
    }
}

/**
 * Creates a debug error entry
 */
export function debugError(message: string, data?: any): void {
    if (process.env.NODE_ENV !== 'production') {
        console.error(`[SmartForm] ${message}`, data);
    }
}