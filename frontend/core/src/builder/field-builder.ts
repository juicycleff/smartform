import {
  Field,
  FieldType,
  Condition,
  ConditionType,
  ValidationRule,
  ValidationType,
  Option,
  OptionsType,
  DynamicSource,
  DynamicFieldConfig,
} from "../types";
import { BaseBuilder } from "./base-builder";
import { DynamicFunctionBuilder } from "./dynamic-function-builder";

/**
 * Field builder for creating form fields
 */
export class FieldBuilder extends BaseBuilder<Field> {
  constructor(id: string, type: FieldType, label: string) {
    super({
      id,
      type,
      label,
      required: false,
      properties: {},
      order: 0,
    });
  }

  /**
   * Mark the field as required
   */
  public required(required: boolean = true): FieldBuilder {
    this.buildTarget.required = required;
    return this;
  }

  /**
   * Set the field placeholder text
   */
  public placeholder(placeholder: string): FieldBuilder {
    this.buildTarget.placeholder = placeholder;
    return this;
  }

  /**
   * Set the field help text
   */
  public helpText(helpText: string): FieldBuilder {
    this.buildTarget.helpText = helpText;
    return this;
  }

  /**
   * Set the field default value
   */
  public defaultValue(value: any): FieldBuilder {
    this.buildTarget.defaultValue = value;
    return this;
  }

  /**
   * Set the field display order
   */
  public order(order: number): FieldBuilder {
    this.buildTarget.order = order;
    return this;
  }

  /**
   * Set a custom property on the field
   */
  public property(key: string, value: any): FieldBuilder {
    this.buildTarget.properties[key] = value;
    return this;
  }

  /**
   * Set requiredIf condition for the field
   */
  public requiredIf(condition: Condition): FieldBuilder {
    this.buildTarget.requiredIf = condition;
    return this;
  }

  /**
   * Make the field required when another field equals a value
   */
  public requiredWhenEquals(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.requiredIf = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "eq",
      value,
    };
    return this;
  }

  /**
   * Make the field required when another field doesn't equal a value
   */
  public requiredWhenNotEquals(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.requiredIf = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "neq",
      value,
    };
    return this;
  }

  /**
   * Make the field required when another field is greater than a value
   */
  public requiredWhenGreaterThan(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.requiredIf = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "gt",
      value,
    };
    return this;
  }

  /**
   * Make the field required when another field is less than a value
   */
  public requiredWhenLessThan(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.requiredIf = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "lt",
      value,
    };
    return this;
  }

  /**
   * Make the field required when another field exists and is not empty
   */
  public requiredWhenExists(fieldId: string): FieldBuilder {
    this.buildTarget.requiredIf = {
      type: ConditionType.EXISTS,
      field: fieldId,
    };
    return this;
  }

  /**
   * Make the field required when all specified conditions match
   */
  public requiredWhenAllMatch(conditions: Condition[]): FieldBuilder {
    this.buildTarget.requiredIf = {
      type: ConditionType.AND,
      conditions,
    };
    return this;
  }

  /**
   * Make the field required when any of the specified conditions match
   */
  public requiredWhenAnyMatch(conditions: Condition[]): FieldBuilder {
    this.buildTarget.requiredIf = {
      type: ConditionType.OR,
      conditions,
    };
    return this;
  }

  /**
   * Make the field required based on a custom expression
   */
  public requiredWithExpression(expression: string): FieldBuilder {
    this.buildTarget.requiredIf = {
      type: ConditionType.EXPRESSION,
      expression,
    };
    return this;
  }

  /**
   * Set visibility condition for the field
   */
  public visibleWhen(condition: Condition): FieldBuilder {
    this.buildTarget.visible = condition;
    return this;
  }

  /**
   * Make the field visible when another field equals a value
   */
  public visibleWhenEquals(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.visible = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "eq",
      value,
    };
    return this;
  }

  /**
   * Make the field visible when another field doesn't equal a value
   */
  public visibleWhenNotEquals(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.visible = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "neq",
      value,
    };
    return this;
  }

  /**
   * Make the field visible when another field is greater than a value
   */
  public visibleWhenGreaterThan(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.visible = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "gt",
      value,
    };
    return this;
  }

  /**
   * Make the field visible when another field is less than a value
   */
  public visibleWhenLessThan(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.visible = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "lt",
      value,
    };
    return this;
  }

  /**
   * Make the field visible when another field exists and is not empty
   */
  public visibleWhenExists(fieldId: string): FieldBuilder {
    this.buildTarget.visible = {
      type: ConditionType.EXISTS,
      field: fieldId,
    };
    return this;
  }

  /**
   * Make the field visible when all specified conditions match
   */
  public visibleWhenAllMatch(conditions: Condition[]): FieldBuilder {
    this.buildTarget.visible = {
      type: ConditionType.AND,
      conditions,
    };
    return this;
  }

  /**
   * Make the field visible when any of the specified conditions match
   */
  public visibleWhenAnyMatch(conditions: Condition[]): FieldBuilder {
    this.buildTarget.visible = {
      type: ConditionType.OR,
      conditions,
    };
    return this;
  }

  /**
   * Make the field visible based on a custom expression
   */
  public visibleWithExpression(expression: string): FieldBuilder {
    this.buildTarget.visible = {
      type: ConditionType.EXPRESSION,
      expression,
    };
    return this;
  }

  /**
   * Set enablement condition for the field
   */
  public enabledWhen(condition: Condition): FieldBuilder {
    this.buildTarget.enabled = condition;
    return this;
  }

  /**
   * Make the field enabled when another field equals a value
   */
  public enabledWhenEquals(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.enabled = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "eq",
      value,
    };
    return this;
  }

  /**
   * Make the field enabled when another field doesn't equal a value
   */
  public enabledWhenNotEquals(fieldId: string, value: any): FieldBuilder {
    this.buildTarget.enabled = {
      type: ConditionType.SIMPLE,
      field: fieldId,
      operator: "neq",
      value,
    };
    return this;
  }

  /**
   * Make the field enabled when another field exists and is not empty
   */
  public enabledWhenExists(fieldId: string): FieldBuilder {
    this.buildTarget.enabled = {
      type: ConditionType.EXISTS,
      field: fieldId,
    };
    return this;
  }

  /**
   * Add a validation rule to the field
   */
  public addValidation(rule: ValidationRule): FieldBuilder {
    if (!this.buildTarget.validationRules) {
      this.buildTarget.validationRules = [];
    }
    this.buildTarget.validationRules.push(rule);
    return this;
  }

  /**
   * Add a required validation rule
   */
  public validateRequired(message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.REQUIRED,
      message,
    });
  }

  /**
   * Add a minimum length validation rule
   */
  public validateMinLength(min: number, message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.MIN_LENGTH,
      message,
      parameters: min,
    });
  }

  /**
   * Add a maximum length validation rule
   */
  public validateMaxLength(max: number, message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.MAX_LENGTH,
      message,
      parameters: max,
    });
  }

  /**
   * Add a pattern validation rule
   */
  public validatePattern(pattern: string, message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.PATTERN,
      message,
      parameters: pattern,
    });
  }

  /**
   * Add a minimum value validation rule
   */
  public validateMin(min: number, message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.MIN,
      message,
      parameters: min,
    });
  }

  /**
   * Add a maximum value validation rule
   */
  public validateMax(max: number, message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.MAX,
      message,
      parameters: max,
    });
  }

  /**
   * Add an email validation rule
   */
  public validateEmail(message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.EMAIL,
      message,
    });
  }

  /**
   * Add a URL validation rule
   */
  public validateURL(message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.URL,
      message,
    });
  }

  /**
   * Add a file type validation rule
   */
  public validateFileType(
    allowedTypes: string[],
    message: string,
  ): FieldBuilder {
    return this.addValidation({
      type: ValidationType.FILE_TYPE,
      message,
      parameters: allowedTypes,
    });
  }

  /**
   * Add a file size validation rule
   */
  public validateFileSize(maxSize: number, message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.FILE_SIZE,
      message,
      parameters: maxSize,
    });
  }

  /**
   * Add an image dimensions validation rule
   */
  public validateImageDimensions(
    dimensions: Record<string, any>,
    message: string,
  ): FieldBuilder {
    return this.addValidation({
      type: ValidationType.IMAGE_DIMENSIONS,
      message,
      parameters: dimensions,
    });
  }

  /**
   * Add a field dependency validation rule
   */
  public validateDependency(
    dependency: Record<string, any>,
    message: string,
  ): FieldBuilder {
    return this.addValidation({
      type: ValidationType.DEPENDENCY,
      message,
      parameters: dependency,
    });
  }

  /**
   * Add a uniqueness validation rule
   */
  public validateUnique(message: string): FieldBuilder {
    return this.addValidation({
      type: ValidationType.UNIQUE,
      message,
    });
  }

  /**
   * Add a custom validation rule
   */
  public validateCustom(
    params: Record<string, any>,
    message: string,
  ): FieldBuilder {
    return this.addValidation({
      type: ValidationType.CUSTOM,
      message,
      parameters: params,
    });
  }

  /**
   * Configure field with static options
   */
  public withStaticOptions(options: Option[]): FieldBuilder {
    this.buildTarget.options = {
      type: OptionsType.STATIC,
      static: options,
    };
    return this;
  }

  /**
   * Configure field with dynamic options
   */
  public withDynamicOptions(source: DynamicSource): FieldBuilder {
    this.buildTarget.options = {
      type: OptionsType.DYNAMIC,
      dynamicSource: source,
    };
    return this;
  }

  /**
   * Configure field with a dynamic function
   */
  public withDynamicFunction(functionName: string): DynamicFunctionBuilder {
    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    };

    // Store the config in field properties
    this.buildTarget.properties.dynamicFunction = config;

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }

  /**
   * Check if the field has a dynamic function
   */
  public hasDynamicFunction(): boolean {
    return !!this.buildTarget.properties.dynamicFunction;
  }

  /**
   * Get the dynamic function configuration for the field
   */
  public getDynamicFunctionConfig(): DynamicFieldConfig | null {
    return this.buildTarget.properties.dynamicFunction || null;
  }

  /**
   * Configure field with dependent options
   */
  public withDependentOptions(
    dependentField: string,
    valueMap: Record<string, Option[]>,
  ): FieldBuilder {
    this.buildTarget.options = {
      type: OptionsType.DEPENDENT,
      dependency: {
        field: dependentField,
        valueMap,
      },
    };
    return this;
  }

  /**
   * Add a single option to the field
   */
  public addOption(value: any, label: string): FieldBuilder {
    const option: Option = { value, label };

    if (!this.buildTarget.options) {
      this.buildTarget.options = {
        type: OptionsType.STATIC,
        static: [option],
      };
    } else if (this.buildTarget.options.type === OptionsType.STATIC) {
      if (!this.buildTarget.options.static) {
        this.buildTarget.options.static = [];
      }
      this.buildTarget.options.static.push(option);
    } else {
      // Convert to static options if it was another type
      this.buildTarget.options = {
        type: OptionsType.STATIC,
        static: [option],
      };
    }

    return this;
  }

  /**
   * Add multiple options to the field
   */
  public addOptions(options: Option[]): FieldBuilder {
    if (!this.buildTarget.options) {
      this.buildTarget.options = {
        type: OptionsType.STATIC,
        static: [...options],
      };
    } else if (this.buildTarget.options.type === OptionsType.STATIC) {
      if (!this.buildTarget.options.static) {
        this.buildTarget.options.static = [];
      }
      this.buildTarget.options.static.push(...options);
    } else {
      // Convert to static options if it was another type
      this.buildTarget.options = {
        type: OptionsType.STATIC,
        static: [...options],
      };
    }

    return this;
  }

  /**
   * Configure field with options from an API endpoint
   */
  public withOptionsFromAPI(
    endpoint: string,
    method: string,
    valuePath: string,
    labelPath: string,
  ): FieldBuilder {
    const source: DynamicSource = {
      type: "api",
      endpoint,
      method,
      valuePath,
      labelPath,
    };

    return this.withDynamicOptions(source);
  }

  /**
   * Configure dynamic options to refresh when specified fields change
   */
  public withOptionsRefreshingOn(fieldIds: string[]): FieldBuilder {
    if (this.buildTarget.options?.dynamicSource) {
      this.buildTarget.options.dynamicSource.refreshOn = fieldIds;
    }
    return this;
  }

  /**
   * Add dynamic value calculation to the field
   */
  public dynamicValue(functionName: string): DynamicFunctionBuilder {
    this.buildTarget.properties.dynamicValue = true;
    return this.withDynamicFunction(functionName);
  }

  /**
   * Add dynamic validation to the field
   */
  public dynamicValidation(
    functionName: string,
    message: string,
  ): DynamicFunctionBuilder {
    // Create the dynamic function config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    };

    // Add validation rule
    this.addValidation({
      type: ValidationType.CUSTOM,
      message,
      parameters: {
        dynamicFunction: config,
      },
    });

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }

  /**
   * Add autocomplete functionality to the field
   */
  public autocompleteField(functionName: string): DynamicFunctionBuilder {
    if (
      this.buildTarget.type !== FieldType.TEXT &&
      this.buildTarget.type !== FieldType.EMAIL &&
      this.buildTarget.type !== FieldType.PASSWORD
    ) {
      throw new Error("Autocomplete is only applicable to text-like fields");
    }

    this.buildTarget.properties.autocomplete = true;

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.buildTarget.properties.autocompleteFunction = config;

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }

  /**
   * Add live search capability to the field
   */
  public liveSearch(functionName: string): DynamicFunctionBuilder {
    this.buildTarget.properties.liveSearch = true;

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.buildTarget.properties.searchFunction = config;

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }

  /**
   * Set a dynamic data source for the field
   */
  public dataSource(functionName: string): DynamicFunctionBuilder {
    this.buildTarget.properties.dataSource = true;

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.buildTarget.properties.dataSourceFunction = config;

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }

  /**
   * Add a dynamic formatter to the field
   */
  public formatter(functionName: string): DynamicFunctionBuilder {
    this.buildTarget.properties.formatter = true;

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.buildTarget.properties.formatterFunction = config;

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }

  /**
   * Add a dynamic parser to the field
   */
  public parser(functionName: string): DynamicFunctionBuilder {
    this.buildTarget.properties.parser = true;

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.buildTarget.properties.parserFunction = config;

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }
}

/**
 * Create a new option
 */
export function createOption(value: any, label: string, icon?: string): Option {
  return { value, label, icon };
}
