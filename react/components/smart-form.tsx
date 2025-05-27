import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type DeepMap,
  type DeepPartial,
  type FieldValues,
  FormProvider,
  type UseFormReturn,
  useForm,
} from "react-hook-form";
import { TemplateEngine } from "../template-engine";
import {
  type Field,
  FieldType,
  type FormSchema,
  FormType,
  type ValidationResult,
  type ValidationType,
} from "../core";
import { useLogger } from "../logger";
import { ComponentRegistry } from "./components-registry";
import { evaluateCondition, getValueByPath } from "./conditions";
import { SmartFormContext, type SmartFormContextType } from "./context";
import { FormField } from "./form-field";
import { buildValidationSchema, isEmpty } from "./validation";

const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;

export interface FieldError {
  fieldId: string;
  message: string;
  ruleType: ValidationType;
}

type RhfDirtyFields<T extends FieldValues = FieldValues> = DeepMap<
  DeepPartial<T>,
  true
>;

export type OnChangePayload = {
  values: Record<string, any>;
  valid: boolean;
  changedField?: string;
  isDirty: boolean;
  dirtyFields: RhfDirtyFields<Record<string, any>>;
  isSubmitted: boolean;
};

interface SmartFormProps {
  schema: FormSchema;
  initialValues?: Record<string, any>;
  onSubmit?: (values: Record<string, any>, valid: boolean) => void;
  onChange?: (payload: OnChangePayload) => void;
  components?: Record<string, React.ComponentType<any>>;
  dynamicOptionsFetcher?: (
    fieldId: string,
    params: Record<string, any>,
  ) => Promise<any[]>;
  showSubmitButton?: boolean;
  submitButtonText?: string;
  validateOnChange?: boolean;
  validateAllFieldsOnChange?: boolean;
  validateOnMount?: boolean;
  variables?: Record<string, any>;
  debug?: boolean;
  debugPosition?: "right" | "left";
}

export const SmartForm: React.FC<SmartFormProps> = ({
  schema,
  initialValues: initialValuesProp = {},
  onSubmit,
  onChange,
  components = {},
  dynamicOptionsFetcher,
  showSubmitButton = false,
  submitButtonText = "Submit",
  validateOnChange = false,
  validateAllFieldsOnChange = false,
  validateOnMount = false,
  variables: variablesProp = {},
  debug = false,
  debugPosition = "right",
}) => {
  const initialValues = useMemo(() => {
    return initialValuesProp ?? {};
  }, [initialValuesProp]);
  const variables = useMemo(() => {
    return variablesProp ?? {};
  }, [variablesProp]);
  const log = useLogger();
  const [localFormStateForDebug, setLocalFormStateForDebug] =
    useState<Record<string, any>>(initialValues);
  const [lastChangedField, setLastChangedField] = useState<string | undefined>(
    undefined,
  );
  const [isDebugCollapsed, setIsDebugCollapsed] = useState<boolean>(true);

  useEffect(() => {
    if (!schema || !schema.fields || !Array.isArray(schema.fields)) {
      log.error("SmartForm: Invalid schema provided", schema);
    }
  }, [schema, log]);

  const templateEngine = useMemo(() => {
    log.info("SmartForm: Initializing TemplateEngine...");
    const engine = new TemplateEngine();
    engine.getVariableRegistry().registerStandardFunctions();
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        engine.getVariableRegistry().registerVariable(key, value);
      });
    }
    return engine;
  }, [variables, log]);

  // Hold the RHF methods instance in state to pass its stable reference to getLatestValuesForZod
  const [methodsRef, setMethodsRef] = useState<UseFormReturn<
    Record<string, any>
  > | null>(null);

  const getLatestValuesForZod = useCallback(() => {
    return methodsRef?.getValues() || initialValues;
  }, [methodsRef, initialValues]);

  const memoizedValidationSchema = useMemo(() => {
    log.info("SmartForm: (Re)building validation schema...");
    return buildValidationSchema(
      schema || { id: "empty", title: "", type: FormType.Regular, fields: [] },
      templateEngine,
      getLatestValuesForZod,
    );
  }, [schema, templateEngine, getLatestValuesForZod, log]);

  const methods = useForm<Record<string, any>>({
    resolver: zodResolver(memoizedValidationSchema),
    defaultValues: initialValues,
    mode: validateOnChange || validateAllFieldsOnChange ? "onChange" : "onBlur",
  });

  // Effect to store the methods instance once it's created.
  useEffect(() => {
    setMethodsRef(methods);
  }, [methods]); // methods from useForm is stable

  const processDefaultWhenValues = useCallback(
    (data: Record<string, any>): Record<string, any> => {
      const result = JSON.parse(JSON.stringify(data));
      const processField = (field: Field, parentPath = "") => {
        const fieldPath = parentPath ? `${parentPath}.${field.id}` : field.id;
        if (field.defaultWhen?.length) {
          for (const defaultWhen of field.defaultWhen) {
            if (evaluateCondition(defaultWhen.condition, result)) {
              let defaultValue = defaultWhen.value;
              if (
                typeof defaultValue === "string" &&
                defaultValue.includes("${")
              ) {
                try {
                  defaultValue = templateEngine.evaluateExpression(
                    defaultValue,
                    result,
                  );
                } catch (error) {
                  log.error(
                    `Error evaluating defaultWhen expr for ${fieldPath}: ${defaultValue}`,
                    error,
                  );
                }
              }
              const existingValue = getValueByPath(result, fieldPath);
              if (
                existingValue === undefined ||
                existingValue === null ||
                existingValue === ""
              ) {
                let current = result;
                const parts = fieldPath.split(".");
                parts.forEach((part, index) => {
                  if (index === parts.length - 1) {
                    current[part] = defaultValue;
                  } else {
                    if (!current[part] || typeof current[part] !== "object") {
                      current[part] = {};
                    }
                    current = current[part];
                  }
                });
              }
              break;
            }
          }
        }
        if (field.nested?.length) {
          field.nested.forEach((nestedField) =>
            processField(nestedField, fieldPath),
          );
        }
      };
      schema?.fields?.forEach((field) => processField(field));
      return result;
    },
    [schema, templateEngine, log],
  );

  // Effect for setting initial values and defaults.
  useEffect(() => {
    if (schema?.fields && methodsRef) {
      // Use methodsRef here
      const processedValues = processDefaultWhenValues(initialValues);
      const currentRHFValues = methodsRef.getValues();
      if (
        JSON.stringify(currentRHFValues) !== JSON.stringify(processedValues)
      ) {
        log.info("SmartForm: Resetting form with processed initial values.");
        methodsRef.reset(processedValues); // Triggers watch
      } else {
        // If reset didn't happen (values were same), watch's initial fire will handle validateOnMount.
        log.info("SmartForm: Initial values matched processed. Reset skipped.");
        // Ensure debug state is accurate if no reset. Watch will update it from RHF if reset occurs.
        setLocalFormStateForDebug(processedValues);
        // If validateOnMount and no reset, the watch initial fire needs to ensure validation if values were empty.
        // The watch's `!name && !type` block will check `validateOnMount`.
      }
    }
  }, [schema, initialValues, processDefaultWhenValues, methodsRef, log]); // Removed validateOnMount directly causing trigger here

  const evaluateTemplateExpression = useCallback(
    /* ... as before ... */ (
      expression: string,
      context?: Record<string, any>,
    ) =>
      templateEngine.evaluateExpression(
        expression,
        context || methods.getValues(),
      ),
    [templateEngine, methods],
  );

  const componentRegistry = useMemo(
    /* ... as before ... */ () => {
      const registry = new ComponentRegistry();

      for (const [type, component] of Object.entries(components)) {
        registry.register(type, component);
      }
      return registry;
    },
    [components],
  );

  const filterVisibleErrors = useCallback(
    (
      errors: Record<string, any>,
      formState: Record<string, any>,
    ): Record<string, any> => {
      if (!schema?.fields) return errors;

      const visibleErrors: Record<string, any> = {};

      const checkFieldVisibility = (field: Field): boolean => {
        // Check both 'visible' and 'visibleWhen' properties
        const visibilityCondition = field.visible || (field as any).visibleWhen;

        if (!visibilityCondition) return true;

        try {
          return evaluateCondition(visibilityCondition, formState);
        } catch (e) {
          log.error(
            `Error evaluating visibility condition for field ${field.id}:`,
            e,
          );
          return true; // Default to visible on error
        }
      };

      const processField = (field: Field, parentPath = ""): void => {
        const fieldPath = parentPath ? `${parentPath}.${field.id}` : field.id;

        // If field is visible and has an error, include it
        if (checkFieldVisibility(field) && errors[fieldPath]) {
          visibleErrors[fieldPath] = errors[fieldPath];
        }

        // Process nested fields
        if (field.nested?.length) {
          if (
            field.type === FieldType.Group ||
            field.type === FieldType.Object
          ) {
            field.nested.forEach((nestedField) =>
              processField(nestedField, fieldPath),
            );
          } else if (field.type === FieldType.Array && field.nested[0]) {
            // For arrays, check if the array field itself is visible
            if (checkFieldVisibility(field)) {
              // Include all array item errors if the array field is visible
              Object.keys(errors).forEach((errorPath) => {
                if (errorPath.startsWith(`${fieldPath}.`)) {
                  visibleErrors[errorPath] = errors[errorPath];
                }
              });
            }
          }
        }
      };

      // Process all top-level fields
      schema.fields.forEach((field) => processField(field));

      return visibleErrors;
    },
    [schema, log],
  );

  // This callback is now primarily dependent on the `onChange` prop itself.
  // `methodsRef.formState` is accessed inside when needed.
  const invokeOnChangeProp = useCallback(
    (
      changedData: Record<string, any>,
      fieldName?: string,
      isMountEvent = false,
    ) => {
      if (onChange && methodsRef) {
        const {
          errors: rawErrors,
          isDirty,
          dirtyFields,
          isSubmitted,
        } = methodsRef.formState;

        // Filter out errors for invisible fields
        const visibleErrors = filterVisibleErrors(rawErrors, changedData);
        const isValid = Object.keys(visibleErrors).length === 0;

        onChange({
          values: changedData,
          valid: isValid,
          changedField: isMountEvent ? undefined : fieldName,
          isDirty,
          dirtyFields: dirtyFields as RhfDirtyFields<Record<string, any>>,
          isSubmitted,
        });
      }
    },
    [onChange, methodsRef], // methodsRef is stable once set
  );

  useEffect(() => {
    if (!methodsRef) return; // Don't subscribe until methods are ready

    const subscription = methodsRef.watch((values, { name, type }) => {
      const currentRHFValues = values as Record<string, any>;
      setLocalFormStateForDebug(currentRHFValues);

      if (type === "change" && name) {
        setLastChangedField(name);
        const valuesAfterDefaults = processDefaultWhenValues(currentRHFValues);
        let defaultsCausedChange = false;

        for (const key in valuesAfterDefaults) {
          if (
            JSON.stringify(valuesAfterDefaults[key]) !==
            JSON.stringify(currentRHFValues[key])
          ) {
            methodsRef.setValue(key, valuesAfterDefaults[key], {
              shouldValidate: validateOnChange || validateAllFieldsOnChange,
              shouldDirty: true,
              shouldTouch: true,
            });
            defaultsCausedChange = true;
          }
        }

        const finalChangedValues = defaultsCausedChange
          ? methodsRef.getValues()
          : valuesAfterDefaults;

        if (validateAllFieldsOnChange) {
          methodsRef.trigger().then(() => {
            // Ensure getValues() after trigger
            invokeOnChangeProp(methodsRef.getValues(), name);
          });
        } else {
          // If only validateOnChange, RHF mode: 'onChange' + shouldValidate handles it.
          // invokeOnChangeProp reads latest formState.
          invokeOnChangeProp(finalChangedValues, name);
        }
      } else if (!name && !type) {
        // Initial fire of watch (after mount/reset)
        if (validateOnMount) {
          log.info("SmartForm: Validating on mount via watch initial fire...");
          methodsRef.trigger().then(() => {
            invokeOnChangeProp(methodsRef.getValues(), undefined, true);
          });
        } else {
          invokeOnChangeProp(currentRHFValues, undefined, true);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [
    methodsRef, // Stable once set
    processDefaultWhenValues, // Stable if its deps are stable
    validateOnChange,
    validateAllFieldsOnChange,
    validateOnMount,
    invokeOnChangeProp, // Stable if onChange and methodsRef are stable
    log,
  ]);

  const getDynamicOptions = useCallback(
    /* ... as before ... */ async (
      fieldId: string,
      dependentValues: Record<string, any>,
    ): Promise<any[]> => {
      if (!dynamicOptionsFetcher) return [];
      try {
        return await dynamicOptionsFetcher(fieldId, dependentValues);
      } catch (error) {
        log.error(`Error fetching dynamic options for ${fieldId}:`, error);
        return [];
      }
    },
    [dynamicOptionsFetcher, log],
  );

  // const isFieldVisible = useCallback(
  //   /* ... as before ... */ (field: Field) => {
  //     if (!methodsRef) return true
  //
  //     // Check both 'visible' and 'visibleWhen' properties
  //     const visibilityCondition = field.visible || (field as any).visibleWhen
  //
  //     if (!visibilityCondition) return true
  //
  //     try {
  //       return evaluateCondition(visibilityCondition, methodsRef.getValues())
  //     } catch (e) {
  //       log.error(
  //         `Error evaluating visibility condition for field ${field.id}:`,
  //         e,
  //       )
  //       return true // Default to visible on error
  //     }
  //   },
  //   [methodsRef, log],
  // )
  //
  // const isFieldEnabled = useCallback(
  //   /* ... as before ... */ (field: Field) => {
  //     if (!methodsRef) return true
  //
  //     // Check both 'enabled' and 'enabledWhen' properties
  //     const enabledCondition =
  //       (field as any).enabled || (field as any).enabledWhen
  //
  //     if (!enabledCondition) return true
  //
  //     try {
  //       return evaluateCondition(enabledCondition, methodsRef.getValues())
  //     } catch (e) {
  //       log.error(
  //         `Error evaluating enabled condition for field ${field.id}:`,
  //         e,
  //       )
  //       return true // Default to enabled on error
  //     }
  //   },
  //   [methodsRef],
  // )

  const isFieldVisible = useCallback(
    /* ... as before ... */ (field: Field) => {
      if (!field.visible || !methodsRef) return true;
      return evaluateCondition(field.visible, methodsRef.getValues());
    },
    [methodsRef],
  );
  const isFieldEnabled = useCallback(
    /* ... as before ... */ (field: Field) => {
      if (!field.visible || !methodsRef) return true;
      return evaluateCondition(field.visible, methodsRef.getValues());
    },
    [methodsRef],
  );

  const isFieldRequired = useCallback(
    /* ... as before ... */ (field: Field) => {
      if (field.required) return true;
      if (!field.requiredIf || !methodsRef) return false;
      return evaluateCondition(field.requiredIf, methodsRef.getValues());
    },
    [methodsRef, log],
  );

  const validateField = useCallback(
    /* ... as before, use methodsRef if needed ... */ (
      fieldId: string,
      value: any,
    ): ValidationResult => {
      const findFieldRecursive = (
        fields: Field[],
        id: string,
      ): Field | null => {
        for (const f of fields) {
          if (f.id === id) return f;
          if (f.nested?.length) {
            const nested = findFieldRecursive(f.nested, id);
            if (nested) return nested;
          }
        }
        return null;
      };
      if (!schema?.fields) return { valid: true, errors: [] };
      const field = findFieldRecursive(schema.fields, fieldId);
      if (!field) return { valid: true, errors: [] };
      const errors: FieldError[] = [];
      if (field.validationRules) {
        for (const rule of field.validationRules) {
          let isValid = true;
          switch (rule.type) {
            case "required":
              isValid = !isEmpty(value);
              break;
            case "minLength":
              if (
                typeof value === "string" &&
                typeof rule.parameters === "number"
              )
                isValid = value.length >= rule.parameters;
              break;
            case "maxLength":
              if (
                typeof value === "string" &&
                typeof rule.parameters === "number"
              )
                isValid = value.length <= rule.parameters;
              break;
            case "pattern":
              if (
                typeof value === "string" &&
                typeof rule.parameters === "string"
              ) {
                try {
                  isValid = new RegExp(rule.parameters).test(value);
                } catch (e) {
                  isValid = false;
                }
              }
              break;
            case "min":
              if (
                typeof value === "number" &&
                typeof rule.parameters === "number"
              )
                isValid = value >= rule.parameters;
              break;
            case "max":
              if (
                typeof value === "number" &&
                typeof rule.parameters === "number"
              )
                isValid = value <= rule.parameters;
              break;
            case "email":
              if (typeof value === "string") isValid = emailRegex.test(value);
              break;
            default:
              isValid = true;
          }
          if (!isValid) {
            errors.push({
              fieldId,
              message: rule.message!,
              ruleType: rule.type as ValidationType,
            });
          }
        }
      }
      return { valid: errors.length === 0, errors };
    },
    [schema],
  );

  const contextValue: SmartFormContextType = useMemo(
    () => ({
      schema,
      formState: methodsRef?.getValues() || initialValues, // Use methodsRef
      templateEngine,
      componentRegistry,
      getDynamicOptions,
      isFieldVisible,
      isFieldEnabled,
      isFieldRequired,
      validateField,
      evaluateTemplateExpression,
    }),
    [
      schema,
      methodsRef,
      templateEngine,
      componentRegistry,
      getDynamicOptions, // Use methodsRef
      isFieldVisible,
      isFieldEnabled,
      isFieldRequired,
      validateField,
      evaluateTemplateExpression,
      initialValues, // Added initialValues as fallback
    ],
  );

  const handleSubmitForm = methods.handleSubmit(
    /* ... as before ... */ (data) => {
      const finalData = processDefaultWhenValues(data);
      setLocalFormStateForDebug(finalData);
      if (onSubmit) {
        onSubmit(finalData, true);
      }
    },
    (formErrors) => {
      log.error("SmartForm validation errors:", formErrors);
      const currentData = methods.getValues();
      const finalData = processDefaultWhenValues(currentData);
      setLocalFormStateForDebug(finalData);
      if (onSubmit) {
        onSubmit(finalData, false);
      }
    },
  );
  const hasFields = schema?.fields?.length > 0;
  const debugPanelStyles: React.CSSProperties = {
    position: "fixed",
    top: "0",
    bottom: "0",
    width: "350px",
    [debugPosition]: isDebugCollapsed ? "-320px" : "0",
    transition: "all 0.3s ease-in-out",
    zIndex: 1001,
    display: "flex",
    flexDirection: "column",
  };
  const toggleButtonStyles: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [debugPosition === "right" ? "left" : "right"]: "0",
    width: "30px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4F46E5",
    color: "white",
    cursor: "pointer",
    borderRadius: debugPosition === "right" ? "4px 0 0 4px" : "0 4px 4px 0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  };
  const contentWrapperStyles: React.CSSProperties = {
    marginRight:
      debug && debugPosition === "right" && !isDebugCollapsed ? "350px" : "0",
    marginLeft:
      debug && debugPosition === "left" && !isDebugCollapsed ? "350px" : "0",
    transition: "all 0.3s ease-in-out",
    width: "100%",
  };

  if (!methodsRef) {
    // Prevent rendering form content until methods are initialized
    return null; // Or a loading spinner
  }

  return (
    <SmartFormContext.Provider value={contextValue}>
      <FormProvider {...methodsRef}>
        {" "}
        {/* Pass methodsRef here */}
        <div style={{ position: "relative", display: "flex" }}>
          {debug && (
            <div
              style={debugPanelStyles}
              className="overflow-hidden border-gray-300 border-l bg-gray-100 shadow-lg dark:border-gray-700 dark:bg-gray-900"
            >
              {" "}
              <div
                style={toggleButtonStyles}
                onClick={() => setIsDebugCollapsed(!isDebugCollapsed)}
                className="font-bold text-sm"
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && setIsDebugCollapsed(!isDebugCollapsed)
                }
                aria-label={
                  isDebugCollapsed ? "Open debug panel" : "Close debug panel"
                }
              >
                {" "}
                {isDebugCollapsed
                  ? debugPosition === "right"
                    ? "◀"
                    : "▶"
                  : debugPosition === "right"
                    ? "▶"
                    : "◀"}{" "}
              </div>{" "}
              <div className="h-full overflow-y-auto p-4">
                {" "}
                <h3 className="sticky top-0 z-10 mb-4 bg-gray-100 py-2 font-bold text-gray-700 text-lg dark:bg-gray-900 dark:text-gray-200">
                  SmartForm Debug
                </h3>{" "}
                {/* ... debug sections ... */}{" "}
                <div className="mb-4">
                  {" "}
                  <h4 className="mb-1 font-medium text-gray-600 dark:text-gray-400">
                    RHF isSubmitted
                  </h4>{" "}
                  <div className="rounded bg-white p-2 text-sm dark:bg-gray-800 dark:text-gray-300">
                    <pre>
                      {JSON.stringify(
                        methodsRef.formState.isSubmitted,
                        null,
                        2,
                      )}
                    </pre>
                  </div>{" "}
                </div>{" "}
              </div>{" "}
            </div>
          )}
          <div style={contentWrapperStyles}>
            <form onSubmit={handleSubmitForm} className="w-full space-y-4">
              {hasFields &&
                schema.fields
                  .filter(contextValue.isFieldVisible)
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((field) => <FormField key={field.id} field={field} />)}
              {showSubmitButton && onSubmit && (
                <div className="flex justify-end space-x-2 pt-4">
                  {" "}
                  <Button
                    type="submit"
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                  >
                    {submitButtonText}
                  </Button>{" "}
                </div>
              )}
            </form>
          </div>
        </div>
      </FormProvider>
    </SmartFormContext.Provider>
  );
};

export default SmartForm;
