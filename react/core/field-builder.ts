import { OptionsBuilder } from './options-builder'
import {
  type Condition,
  ConditionType,
  type DynamicFieldConfig,
  type DynamicFunction,
  type DynamicSource,
  type Field,
  FieldType,
  type Option,
  type OptionsConfig,
  OptionsType,
  type ValidationRule, ValidationType,
} from './types'

/**
 * FieldBuilder provides a fluent API for creating form fields
 */
export class FieldBuilder {
  protected field: Field

  /**
   * Creates a new field builder
   * @param id Field identifier
   * @param fieldType Field type
   * @param label Field display label
   */
  constructor(id: string, fieldType: string | FieldType, label: string) {
    this.field = {
      id,
      type: fieldType as FieldType,
      label,
      required: false,
      properties: {},
      order: 0,
    }
  }

  /**
   * Marks the field as required
   * @param required Whether the field is required
   */
  required(required = true): this {
    this.field.required = required
    return this
  }

  /**
   * Sets the field placeholder text
   * @param placeholder Placeholder text
   */
  placeholder(placeholder: string): this {
    this.field.placeholder = placeholder
    return this
  }

  /**
   * Sets the field help text
   * @param helpText Help text to display
   */
  helpText(helpText: string): this {
    this.field.helpText = helpText
    return this
  }

  /**
   * Sets the field default value
   * @param value Default value
   */
  defaultValue(value: any): this {
    this.field.defaultValue = value
    return this
  }

  /**
   * Sets the field order
   * @param order Display order
   */
  order(order: number): this {
    this.field.order = order
    return this
  }

  /**
   * Sets a custom property on the field
   * @param key Property key
   * @param value Property value
   */
  property(key: string, value: any): this {
    this.field.properties![key] = value
    return this
  }

  /**
   * Sets a conditional requirement for the field
   * @param condition Condition for requirement
   */
  requiredIf(condition: Condition): this {
    this.field.requiredIf = condition
    return this
  }

  /**
   * Makes the field required when another field equals a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  requiredWhenEquals(fieldId: string, value: any): this {
    this.field.requiredIf = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'eq',
      value,
    }
    return this
  }

  /**
   * Makes the field required when another field doesn't equal a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  requiredWhenNotEquals(fieldId: string, value: any): this {
    this.field.requiredIf = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'neq',
      value,
    }
    return this
  }

  /**
   * Makes the field required when another field is greater than a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  requiredWhenGreaterThan(fieldId: string, value: any): this {
    this.field.requiredIf = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'gt',
      value,
    }
    return this
  }

  /**
   * Makes the field required when another field is less than a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  requiredWhenLessThan(fieldId: string, value: any): this {
    this.field.requiredIf = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'lt',
      value,
    }
    return this
  }

  /**
   * Makes the field required when another field exists and is not empty
   * @param fieldId ID of the field to check
   */
  requiredWhenExists(fieldId: string): this {
    this.field.requiredIf = {
      type: ConditionType.Exists,
      field: fieldId,
    }
    return this
  }

  /**
   * Makes the field required when all specified conditions match
   * @param conditions Conditions to check
   */
  requiredWhenAllMatch(...conditions: Condition[]): this {
    this.field.requiredIf = {
      type: ConditionType.And,
      conditions,
    }
    return this
  }

  /**
   * Makes the field required when any of the specified conditions match
   * @param conditions Conditions to check
   */
  requiredWhenAnyMatch(...conditions: Condition[]): this {
    this.field.requiredIf = {
      type: ConditionType.Or,
      conditions,
    }
    return this
  }

  /**
   * Makes the field required based on a custom expression
   * @param expression Custom expression to evaluate
   */
  requiredWithExpression(expression: string): this {
    this.field.requiredIf = {
      type: ConditionType.Expression,
      expression,
    }
    return this
  }

  /**
   * Sets visibility condition for the field
   * @param condition Condition determining visibility
   */
  visibleWhen(condition: Condition): this {
    this.field.visible = condition
    return this
  }

  /**
   * Makes the field visible when another field equals a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  visibleWhenEquals(fieldId: string, value: any): this {
    this.field.visible = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'eq',
      value,
    }
    return this
  }

  /**
   * Makes the field visible when another field doesn't equal a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  visibleWhenNotEquals(fieldId: string, value: any): this {
    this.field.visible = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'neq',
      value,
    }
    return this
  }

  /**
   * Makes the field visible when another field is greater than a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  visibleWhenGreaterThan(fieldId: string, value: any): this {
    this.field.visible = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'gt',
      value,
    }
    return this
  }

  /**
   * Makes the field visible when another field is less than a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  visibleWhenLessThan(fieldId: string, value: any): this {
    this.field.visible = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'lt',
      value,
    }
    return this
  }

  /**
   * Makes the field visible when another field exists and is not empty
   * @param fieldId ID of the field to check
   */
  visibleWhenExists(fieldId: string): this {
    this.field.visible = {
      type: ConditionType.Exists,
      field: fieldId,
    }
    return this
  }

  /**
   * Makes the field visible when all specified conditions match
   * @param conditions Conditions to check
   */
  visibleWhenAllMatch(...conditions: Condition[]): this {
    this.field.visible = {
      type: ConditionType.And,
      conditions,
    }
    return this
  }

  /**
   * Makes the field visible when any of the specified conditions match
   * @param conditions Conditions to check
   */
  visibleWhenAnyMatch(...conditions: Condition[]): this {
    this.field.visible = {
      type: ConditionType.Or,
      conditions,
    }
    return this
  }

  /**
   * Makes the field visible based on a custom expression
   * @param expression Custom expression to evaluate
   */
  visibleWithExpression(expression: string): this {
    this.field.visible = {
      type: ConditionType.Expression,
      expression,
    }
    return this
  }

  /**
   * Sets enablement condition for the field
   * @param condition Condition determining enablement
   */
  enabledWhen(condition: Condition): this {
    this.field.enabled = condition
    return this
  }

  /**
   * Makes the field enabled when another field equals a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  enabledWhenEquals(fieldId: string, value: any): this {
    this.field.enabled = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'eq',
      value,
    }
    return this
  }

  /**
   * Makes the field enabled when another field doesn't equal a value
   * @param fieldId ID of the field to check
   * @param value Value to compare with
   */
  enabledWhenNotEquals(fieldId: string, value: any): this {
    this.field.enabled = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'neq',
      value,
    }
    return this
  }

  /**
   * Makes the field enabled when another field exists and is not empty
   * @param fieldId ID of the field to check
   */
  enabledWhenExists(fieldId: string): this {
    this.field.enabled = {
      type: ConditionType.Exists,
      field: fieldId,
    }
    return this
  }

  /**
   * Adds a validation rule to the field
   * @param rule Validation rule to add
   */
  addValidation(rule: ValidationRule): this {
    if (!this.field.validationRules) {
      this.field.validationRules = []
    }
    this.field.validationRules.push(rule)
    return this
  }

  /**
   * Adds a required validation rule
   * @param message Validation error message
   */
  validateRequired(message: string): this {
    return this.addValidation({
      type: ValidationType.Required,
      message,
    })
  }

  /**
   * Adds a minimum length validation rule
   * @param min Minimum length
   * @param message Validation error message
   */
  validateMinLength(min: number, message: string): this {
    return this.addValidation({
      type: ValidationType.MinLength,
      message,
      parameters: min,
    })
  }

  /**
   * Adds a maximum length validation rule
   * @param max Maximum length
   * @param message Validation error message
   */
  validateMaxLength(max: number, message: string): this {
    return this.addValidation({
      type: ValidationType.MaxLength,
      message,
      parameters: max,
    })
  }

  /**
   * Adds a pattern validation rule
   * @param pattern Regular expression pattern
   * @param message Validation error message
   */
  validatePattern(pattern: string, message: string): this {
    return this.addValidation({
      type: ValidationType.Pattern,
      message,
      parameters: pattern,
    })
  }

  /**
   * Adds a minimum value validation rule
   * @param min Minimum value
   * @param message Validation error message
   */
  validateMin(min: number, message: string): this {
    return this.addValidation({
      type: ValidationType.Min,
      message,
      parameters: min,
    })
  }

  /**
   * Adds a maximum value validation rule
   * @param max Maximum value
   * @param message Validation error message
   */
  validateMax(max: number, message: string): this {
    return this.addValidation({
      type: ValidationType.Max,
      message,
      parameters: max,
    })
  }

  /**
   * Adds an email validation rule
   * @param message Validation error message
   */
  validateEmail(message: string): this {
    return this.addValidation({
      type: ValidationType.Email,
      message,
    })
  }

  /**
   * Adds a URL validation rule
   * @param message Validation error message
   */
  validateURL(message: string): this {
    return this.addValidation({
      type: ValidationType.URL,
      message,
    })
  }

  /**
   * Adds a file type validation rule
   * @param allowedTypes Allowed file types
   * @param message Validation error message
   */
  validateFileType(allowedTypes: string[], message: string): this {
    return this.addValidation({
      type: ValidationType.FileType,
      message,
      parameters: allowedTypes,
    })
  }

  /**
   * Adds a file size validation rule
   * @param maxSize Maximum file size
   * @param message Validation error message
   */
  validateFileSize(maxSize: number, message: string): this {
    return this.addValidation({
      type: ValidationType.FileType,
      message,
      parameters: maxSize,
    })
  }

  /**
   * Adds an image dimensions validation rule
   * @param dimensions Image dimension constraints
   * @param message Validation error message
   */
  validateImageDimensions(
    dimensions: Record<string, any>,
    message: string,
  ): this {
    return this.addValidation({
      type: ValidationType.ImageDimensions,
      message,
      parameters: dimensions,
    })
  }

  /**
   * Adds a field dependency validation rule
   * @param dependency Dependency configuration
   * @param message Validation error message
   */
  validateDependency(dependency: Record<string, any>, message: string): this {
    return this.addValidation({
      type: ValidationType.Dependency,
      message,
      parameters: dependency,
    })
  }

  /**
   * Adds a uniqueness validation rule
   * @param message Validation error message
   */
  validateUnique(message: string): this {
    return this.addValidation({
      type: ValidationType.Unique,
      message,
    })
  }

  /**
   * Adds a custom validation rule
   * @param params Rule parameters
   * @param message Validation error message
   */
  validateCustom(params: Record<string, any>, message: string): this {
    return this.addValidation({
      type: ValidationType.Custom,
      message,
      parameters: params,
    })
  }

  /**
   * Adds static options to the field
   * @param options Options to add
   */
  withStaticOptions(options: Option[]): this {
    this.field.options = {
      type: OptionsType.Static,
      static: options,
    }
    return this
  }

  /**
   * Adds dynamic options that come directly from a function
   * @param functionNameOrFn Function name or implementation
   */
  withDynamicFunctionOptions(
    functionNameOrFn: string | DynamicFunction,
  ): DynamicOptionsFunctionBuilder {
    // Create a dynamic options source
    const source: DynamicSource = {
      type: 'function',
      parameters: {},
    }

    // Set function name or generate one for direct function
    if (typeof functionNameOrFn === 'string') {
      source.functionName = functionNameOrFn
    } else {
      // Generate a unique name for the function
      const uniqueName = `direct_func_${Date.now()}`
      source.functionName = uniqueName
      source.directFunction = functionNameOrFn
    }

    // Create a DynamicOptionsBuilder to configure the source
    const optionsBuilder = new OptionsBuilder().dynamic()
    optionsBuilder.withSource(source)

    // Set the options on the field
    this.field.options = optionsBuilder.build()

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName: source.functionName,
      arguments: {},
    }

    // Return a builder to configure the function options
    return new DynamicOptionsFunctionBuilder(optionsBuilder, config)
  }

  /**
   * Adds dynamic options to the field
   * @param source Dynamic options source
   */
  withDynamicOptions(source: DynamicSource): this {
    this.field.options = {
      type: OptionsType.Dynamic,
      dynamicSource: source,
    }
    return this
  }

  /**
   * Adds a dynamic function to the field
   * @param functionName Function name
   */
  withDynamicFunction(functionName: string): DynamicFunctionBuilder {
    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    }

    // Store the config in field properties
    this.field.properties!.dynamicFunction = config

    // Return a builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config)
  }

  /**
   * Checks if the field has a dynamic function
   */
  hasDynamicFunction(): boolean {
    return this.field.properties!.dynamicFunction !== undefined
  }

  /**
   * Gets the dynamic function config for the field
   */
  getDynamicFunctionConfig(): DynamicFieldConfig | undefined {
    return this.field.properties!.dynamicFunction as DynamicFieldConfig
  }

  /**
   * Adds dependent options to the field
   * @param dependentField Field that options depend on
   * @param valueMap Mapping from dependent field values to options
   */
  withDependentOptions(
    dependentField: string,
    valueMap: Record<string, Option[]>,
  ): this {
    this.field.options = {
      type: OptionsType.Dependent,
      dependency: {
        field: dependentField,
        valueMap,
      },
    }
    return this
  }

  /**
   * Adds a single option to the field
   * @param value Option value
   * @param label Option label
   */
  addOption(value: any, label: string): this {
    const option: Option = { value, label }

    if (!this.field.options) {
      this.field.options = {
        type: OptionsType.Static,
        static: [option],
      }
    } else if (this.field.options.type === OptionsType.Static) {
      if (!this.field.options.static) {
        this.field.options.static = []
      }
      this.field.options.static.push(option)
    } else {
      // Convert to static options if it was another type
      this.field.options = {
        type: OptionsType.Static,
        static: [option],
      }
    }

    return this
  }

  /**
   * Adds multiple options to the field
   * @param options Options to add
   */
  addOptions(...options: Option[]): this {
    if (!this.field.options) {
      this.field.options = {
        type: OptionsType.Static,
        static: options,
      }
    } else if (this.field.options.type === OptionsType.Static) {
      if (!this.field.options.static) {
        this.field.options.static = []
      }
      this.field.options.static.push(...options)
    } else {
      // Convert to static options if it was another type
      this.field.options = {
        type: OptionsType.Static,
        static: options,
      }
    }

    return this
  }

  /**
   * Adds dynamic options from an API endpoint
   * @param endpoint API endpoint URL
   * @param method HTTP method
   * @param valuePath JSON path to value in response
   * @param labelPath JSON path to label in response
   */
  withOptionsFromAPI(
    endpoint: string,
    method: string,
    valuePath: string,
    labelPath: string,
  ): this {
    const source: DynamicSource = {
      type: 'api',
      endpoint,
      method,
      valuePath,
      labelPath,
    }

    return this.withDynamicOptions(source)
  }

  /**
   * Adds refresh triggers to dynamic options
   * @param fieldIDs Fields that trigger refresh
   */
  withOptionsRefreshingOn(...fieldIDs: string[]): this {
    if (this.field.options?.dynamicSource) {
      this.field.options.dynamicSource.refreshOn = fieldIDs
    }
    return this
  }

  /**
   * Adds dynamic options from a config
   * @param config Options configuration
   */
  withDynamicOptionsConfig(config: OptionsConfig): this {
    if (config.type === OptionsType.Dynamic && config.dynamicSource) {
      this.field.options = {
        type: OptionsType.Dynamic,
        dynamicSource: config.dynamicSource,
      }
    } else {
      this.field.options = config
    }
    return this
  }

  /**
   * Adds a dynamic value calculation to the field
   * @param functionName Function name
   */
  dynamicValue(functionName: string): DynamicFunctionBuilder {
    this.field.properties!.dynamicValue = true
    return this.withDynamicFunction(functionName)
  }

  /**
   * Adds a dynamic validation rule to the field
   * @param functionName Function name
   * @param message Validation error message
   */
  dynamicValidation(
    functionName: string,
    message: string,
  ): DynamicFunctionBuilder {
    // Create the dynamic function config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    }

    // Add validation rule
    this.addValidation({
      type: ValidationType.Custom,
      message,
      parameters: {
        dynamicFunction: config,
      },
    })

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config)
  }

  /**
   * Adds autocomplete functionality to text fields
   * @param functionName Function name
   */
  autocompleteField(functionName: string): DynamicFunctionBuilder | null {
    if (
      this.field.type !== FieldType.Text &&
      this.field.type !== FieldType.Email &&
      this.field.type !== FieldType.Password
    ) {
      // Only applicable to text-like fields
      return null
    }

    this.field.properties!.autocomplete = true

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    }

    // Store the config
    this.field.properties!.autocompleteFunction = config

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config)
  }

  /**
   * Adds live search capability to a field
   * @param functionName Function name
   */
  liveSearch(functionName: string): DynamicFunctionBuilder {
    this.field.properties!.liveSearch = true

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    }

    // Store the config
    this.field.properties!.searchFunction = config

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config)
  }

  /**
   * Sets a dynamic data source for the field
   * @param functionName Function name
   */
  dataSource(functionName: string): DynamicFunctionBuilder {
    this.field.properties!.dataSource = true

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    }

    // Store the config
    this.field.properties!.dataSourceFunction = config

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config)
  }

  /**
   * Adds a dynamic formatter to the field
   * @param functionName Function name
   */
  formatter(functionName: string): DynamicFunctionBuilder {
    this.field.properties!.formatter = true

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    }

    // Store the config
    this.field.properties!.formatterFunction = config

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config)
  }

  /**
   * Adds a dynamic parser to the field
   * @param functionName Function name
   */
  parser(functionName: string): DynamicFunctionBuilder {
    this.field.properties!.parser = true

    // Create dynamic field config
    const config: DynamicFieldConfig = {
      functionName,
      arguments: {},
    }

    // Store the config
    this.field.properties!.parserFunction = config

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config)
  }

  /**
   * Adds a conditional default value to the field
   * @param condition Condition to check
   * @param value Default value to apply if condition is true
   */
  defaultWhen(condition: Condition, value: any): this {
    if (!this.field.defaultWhen) {
      this.field.defaultWhen = []
    }
    this.field.defaultWhen.push({ condition, value })
    return this
  }

  /**
   * Adds a conditional default value based on field equality
   * @param fieldId Field to check
   * @param equals Value to compare with
   * @param value Default value to apply
   */
  defaultWhenEquals(fieldId: string, equals: any, value: any): this {
    const condition = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'eq',
      value: equals,
    }
    return this.defaultWhen(condition, value)
  }

  /**
   * Adds a conditional default value based on field inequality
   * @param fieldId Field to check
   * @param notEquals Value to compare with
   * @param value Default value to apply
   */
  defaultWhenNotEquals(fieldId: string, notEquals: any, value: any): this {
    const condition = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'neq',
      value: notEquals,
    }
    return this.defaultWhen(condition, value)
  }

  /**
   * Adds a conditional default value based on field comparison
   * @param fieldId Field to check
   * @param greaterThan Value to compare with
   * @param value Default value to apply
   */
  defaultWhenGreaterThan(fieldId: string, greaterThan: any, value: any): this {
    const condition = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'gt',
      value: greaterThan,
    }
    return this.defaultWhen(condition, value)
  }

  /**
   * Adds a conditional default value based on field comparison
   * @param fieldId Field to check
   * @param lessThan Value to compare with
   * @param value Default value to apply
   */
  defaultWhenLessThan(fieldId: string, lessThan: any, value: any): this {
    const condition = {
      type: ConditionType.Simple,
      field: fieldId,
      operator: 'lt',
      value: lessThan,
    }
    return this.defaultWhen(condition, value)
  }

  /**
   * Adds a conditional default value based on field existence
   * @param fieldId Field to check
   * @param value Default value to apply
   */
  defaultWhenExists(fieldId: string, value: any): this {
    const condition = {
      type: ConditionType.Exists,
      field: fieldId,
    }
    return this.defaultWhen(condition, value)
  }

  /**
   * Adds a conditional default value based on a custom expression
   * @param expression Expression to evaluate
   * @param value Default value to apply
   */
  defaultWhenExpression(expression: string, value: any): this {
    const condition = {
      type: ConditionType.Expression,
      expression,
    }
    return this.defaultWhen(condition, value)
  }

  /**
   * Finalizes and returns the field
   * @returns The completed field
   */
  build(): Field {
    return this.field
  }
}

/**
 * DynamicFunctionBuilder provides a fluent API for configuring dynamic functions
 */
export class DynamicFunctionBuilder {
  fieldBuilder: FieldBuilder
  config: DynamicFieldConfig

  /**
   * Creates a new dynamic function builder
   * @param fieldBuilder Parent field builder
   * @param config Dynamic function configuration
   */
  constructor(fieldBuilder: FieldBuilder, config: DynamicFieldConfig) {
    this.fieldBuilder = fieldBuilder
    this.config = config
  }

  /**
   * Adds an argument to the dynamic function
   * @param name Argument name
   * @param value Argument value
   */
  withArgument(name: string, value: any): this {
    this.config.arguments![name] = value
    return this
  }

  /**
   * Adds multiple arguments to the dynamic function
   * @param args Arguments to add
   */
  withArguments(args: Record<string, any>): this {
    for (const [name, value] of Object.entries(args)) {
      this.config.arguments![name] = value
    }
    return this
  }

  /**
   * Adds a field reference as an argument
   * @param argName Argument name
   * @param fieldId Field ID to reference
   */
  withFieldReference(argName: string, fieldId: string): this {
    this.config.arguments![argName] = `\${${fieldId}}`
    return this
  }

  /**
   * Adds a data transformer to the dynamic function
   * @param transformerName Transformer name
   */
  withTransformer(transformerName: string): this {
    this.config.transformerName = transformerName
    this.config.transformerParams = {}
    return this
  }

  /**
   * Adds a parameter to the transformer
   * @param name Parameter name
   * @param value Parameter value
   */
  withTransformerParam(name: string, value: any): this {
    if (!this.config.transformerParams) {
      this.config.transformerParams = {}
    }
    this.config.transformerParams[name] = value
    return this
  }

  /**
   * Returns to the field builder
   * @returns The parent field builder
   */
  end(): FieldBuilder {
    return this.fieldBuilder
  }
}

/**
 * DynamicOptionsFunctionBuilder provides a fluent API for configuring dynamic function options
 */
export class DynamicOptionsFunctionBuilder {
  dynamicOptionsBuilder: any // Using any temporarily
  config: DynamicFieldConfig

  /**
   * Creates a new dynamic options function builder
   * @param dynamicOptionsBuilder Parent options builder
   * @param config Dynamic function configuration
   */
  constructor(dynamicOptionsBuilder: any, config: DynamicFieldConfig) {
    this.dynamicOptionsBuilder = dynamicOptionsBuilder
    this.config = config
  }

  /**
   * Adds an argument to the dynamic function
   * @param name Argument name
   * @param value Argument value
   */
  withArgument(name: string, value: any): this {
    // Set in the config for backward compatibility
    this.config.arguments![name] = value

    // Also set directly in the dynamic source parameters
    if (this.dynamicOptionsBuilder.config.dynamicSource?.parameters) {
      this.dynamicOptionsBuilder.config.dynamicSource.parameters[name] = value
    }

    return this
  }

  /**
   * Adds multiple arguments to the dynamic function
   * @param args Arguments to add
   */
  withArguments(args: Record<string, any>): this {
    for (const [name, value] of Object.entries(args)) {
      this.withArgument(name, value)
    }
    return this
  }

  /**
   * Adds a field reference as an argument
   * @param argName Argument name
   * @param fieldId Field ID to reference
   */
  withFieldReference(argName: string, fieldId: string): this {
    const fieldRef = `\${${fieldId}}`
    return this.withArgument(argName, fieldRef)
  }

  /**
   * Adds a data transformer to the dynamic function
   * @param transformerName Transformer name
   */
  withTransformer(transformerName: string): this {
    // Set in the config for backward compatibility
    this.config.transformerName = transformerName
    this.config.transformerParams = {}

    // Also set in the dynamic source
    if (this.dynamicOptionsBuilder.config.dynamicSource?.parameters) {
      this.dynamicOptionsBuilder.config.dynamicSource.parameters.transformer =
        transformerName
      this.dynamicOptionsBuilder.config.dynamicSource.parameters.transformerParams =
        {}
    }

    return this
  }

  /**
   * Adds a parameter to the transformer
   * @param name Parameter name
   * @param value Parameter value
   */
  withTransformerParam(name: string, value: any): this {
    // Set in the config for backward compatibility
    if (!this.config.transformerParams) {
      this.config.transformerParams = {}
    }
    this.config.transformerParams[name] = value

    // Also set in the dynamic source
    if (this.dynamicOptionsBuilder.config.dynamicSource?.parameters) {
      const transformerParams =
        this.dynamicOptionsBuilder.config.dynamicSource.parameters
          .transformerParams || {}
      transformerParams[name] = value
      this.dynamicOptionsBuilder.config.dynamicSource.parameters.transformerParams =
        transformerParams
    }

    return this
  }

  /**
   * Enables search and filtering for the options
   */
  withSearchSupport(): this {
    if (!this.config.transformerParams) {
      this.config.transformerParams = {}
    }
    this.config.transformerParams.enableSearch = true
    return this
  }

  /**
   * Specifies which fields can be filtered
   * @param fields Fields that can be filtered
   */
  withFilterableFields(...fields: string[]): this {
    if (!this.config.transformerParams) {
      this.config.transformerParams = {}
    }
    this.config.transformerParams.filterableFields = fields
    return this
  }

  /**
   * Specifies which fields can be sorted
   * @param fields Fields that can be sorted
   */
  withSortableFields(...fields: string[]): this {
    if (!this.config.transformerParams) {
      this.config.transformerParams = {}
    }
    this.config.transformerParams.sortableFields = fields
    return this
  }

  /**
   * Enables pagination for the options
   * @param defaultLimit Default page size
   */
  withPagination(defaultLimit: number): this {
    if (!this.config.transformerParams) {
      this.config.transformerParams = {}
    }
    this.config.transformerParams.enablePagination = true
    this.config.transformerParams.defaultLimit = defaultLimit
    return this
  }

  /**
   * Returns to the dynamic options builder
   * @returns The parent dynamic options builder
   */
  end(): any {
    return this.dynamicOptionsBuilder
  }
}
