import {
  type DynamicFunction,
  type DynamicSource,
  type Option,
  type OptionsConfig,
  OptionsType,
} from './types'

/**
 * OptionsBuilder provides a fluent API for creating field options
 */
export class OptionsBuilder {
  config: OptionsConfig

  /**
   * Creates a new options builder
   */
  constructor() {
    this.config = {
      type: OptionsType.Static,
    }
  }

  /**
   * Creates a static options configuration
   */
  static(): StaticOptionsBuilder {
    this.config.type = OptionsType.Static
    this.config.static = []
    return new StaticOptionsBuilder(this)
  }

  /**
   * Creates a dynamic options configuration
   */
  dynamic(): DynamicOptionsBuilder {
    this.config.type = OptionsType.Dynamic
    this.config.dynamicSource = {} as DynamicSource
    return new DynamicOptionsBuilder(this)
  }

  /**
   * Creates a dependent options configuration
   * @param field Field that options depend on
   */
  dependent(field: string): DependentOptionsBuilder {
    this.config.type = OptionsType.Dependent
    this.config.dependency = {
      field,
      valueMap: {},
    }
    return new DependentOptionsBuilder(this)
  }

  /**
   * Extracts the dynamic source from the options config
   */
  getDynamicSource(): DynamicSource | undefined {
    if (this.config.type === OptionsType.Dynamic) {
      return this.config.dynamicSource
    }
    return undefined
  }

  /**
   * Finalizes and returns the options configuration
   */
  build(): OptionsConfig {
    return this.config
  }
}

/**
 * StaticOptionsBuilder provides a fluent API for creating static options
 */
export class StaticOptionsBuilder {
  private optionsBuilder: OptionsBuilder

  /**
   * Creates a new static options builder
   * @param optionsBuilder Parent options builder
   */
  constructor(optionsBuilder: OptionsBuilder) {
    this.optionsBuilder = optionsBuilder
  }

  /**
   * Adds an option to the static options list
   * @param value Option value
   * @param label Option label
   */
  addOption(value: any, label: string): this {
    const option: Option = {
      value,
      label,
    }

    if (!this.optionsBuilder.config.static) {
      this.optionsBuilder.config.static = []
    }

    this.optionsBuilder.config.static.push(option)
    return this
  }

  /**
   * Adds an option with an icon to the static options list
   * @param value Option value
   * @param label Option label
   * @param icon Option icon
   */
  addOptionWithIcon(value: any, label: string, icon: string): this {
    const option: Option = {
      value,
      label,
      icon,
    }

    if (!this.optionsBuilder.config.static) {
      this.optionsBuilder.config.static = []
    }

    this.optionsBuilder.config.static.push(option)
    return this
  }

  /**
   * Adds multiple options to the static options list
   * @param options Options to add
   */
  addOptions(...options: Option[]): this {
    if (!this.optionsBuilder.config.static) {
      this.optionsBuilder.config.static = []
    }

    this.optionsBuilder.config.static.push(...options)
    return this
  }

  /**
   * Finalizes and returns the options configuration
   */
  build(): OptionsConfig {
    return this.optionsBuilder.build()
  }
}

/**
 * DynamicOptionsBuilder provides a fluent API for creating dynamic options
 */
export class DynamicOptionsBuilder {
  private optionsBuilder: OptionsBuilder

  /**
   * Creates a new dynamic options builder
   * @param optionsBuilder Parent options builder
   */
  constructor(optionsBuilder: OptionsBuilder) {
    this.optionsBuilder = optionsBuilder
  }

  /**
   * Configures options to be fetched from an API endpoint
   * @param endpoint API endpoint URL
   * @param method HTTP method
   */
  fromAPI(endpoint: string, method: string): this {
    if (this.optionsBuilder.config.dynamicSource) {
      this.optionsBuilder.config.dynamicSource.type = 'api'
      this.optionsBuilder.config.dynamicSource.endpoint = endpoint
      this.optionsBuilder.config.dynamicSource.method = method
    }
    return this
  }

  /**
   * Configures options to be fetched from an API endpoint with paths
   * @param endpoint API endpoint URL
   * @param method HTTP method
   * @param valuePath JSON path to value in response
   * @param labelPath JSON path to label in response
   */
  fromAPIWithPath(
    endpoint: string,
    method: string,
    valuePath: string,
    labelPath: string,
  ): this {
    if (this.optionsBuilder.config.dynamicSource) {
      this.optionsBuilder.config.dynamicSource.type = 'api'
      this.optionsBuilder.config.dynamicSource.endpoint = endpoint
      this.optionsBuilder.config.dynamicSource.method = method
      this.optionsBuilder.config.dynamicSource.valuePath = valuePath
      this.optionsBuilder.config.dynamicSource.labelPath = labelPath
    }
    return this
  }

  /**
   * Adds an HTTP header to the API request
   * @param key Header key
   * @param value Header value
   */
  withHeader(key: string, value: string): this {
    if (this.optionsBuilder.config.dynamicSource) {
      if (!this.optionsBuilder.config.dynamicSource.headers) {
        this.optionsBuilder.config.dynamicSource.headers = {}
      }
      this.optionsBuilder.config.dynamicSource.headers[key] = value
    }
    return this
  }

  /**
   * Adds a parameter to the API request
   * @param key Parameter key
   * @param value Parameter value
   */
  withParameter(key: string, value: any): this {
    if (this.optionsBuilder.config.dynamicSource) {
      if (!this.optionsBuilder.config.dynamicSource.parameters) {
        this.optionsBuilder.config.dynamicSource.parameters = {}
      }
      this.optionsBuilder.config.dynamicSource.parameters[key] = value
    }
    return this
  }

  /**
   * Sets the JSON path to the value in the response
   * @param path JSON path
   */
  withValuePath(path: string): this {
    if (this.optionsBuilder.config.dynamicSource) {
      this.optionsBuilder.config.dynamicSource.valuePath = path
    }
    return this
  }

  /**
   * Sets the JSON path to the label in the response
   * @param path JSON path
   */
  withLabelPath(path: string): this {
    if (this.optionsBuilder.config.dynamicSource) {
      this.optionsBuilder.config.dynamicSource.labelPath = path
    }
    return this
  }

  /**
   * Sets fields that trigger options refresh
   * @param fieldIDs Field IDs
   */
  refreshOn(...fieldIDs: string[]): this {
    if (this.optionsBuilder.config.dynamicSource) {
      this.optionsBuilder.config.dynamicSource.refreshOn = fieldIDs
    }
    return this
  }

  /**
   * Configures options to be generated by a custom function
   * @param functionName Function name
   */
  fromFunction(functionName: string): this {
    if (this.optionsBuilder.config.dynamicSource) {
      this.optionsBuilder.config.dynamicSource.type = 'function'
      this.optionsBuilder.config.dynamicSource.functionName = functionName
    }
    return this
  }

  /**
   * Configures options to come from a dynamic function
   * @param functionNameOrFn Function name or implementation
   */
  withFunctionOptions(functionNameOrFn: string | DynamicFunction): any {
    if (this.optionsBuilder.config.dynamicSource) {
      this.optionsBuilder.config.dynamicSource.type = 'function'

      // Check if we got a function name (string) or a direct function reference
      if (typeof functionNameOrFn === 'string') {
        // It's a function name (string)
        this.optionsBuilder.config.dynamicSource.functionName = functionNameOrFn
      } else {
        // It's a direct function reference
        // Generate a unique name for the function
        const uniqueName = `direct_func_${Date.now()}`
        this.optionsBuilder.config.dynamicSource.functionName = uniqueName
        this.optionsBuilder.config.dynamicSource.directFunction =
          functionNameOrFn
      }

      // Initialize parameters if needed
      if (!this.optionsBuilder.config.dynamicSource.parameters) {
        this.optionsBuilder.config.dynamicSource.parameters = {}
      }
    }

    // Return a builder for configuring the function options
    return new DynamicOptionsFunctionBuilder(this.optionsBuilder)
  }

  withSource(source: DynamicSource): this {
    if (this.optionsBuilder.config.dynamicSource) {
      this.optionsBuilder.config.dynamicSource = source
    }
    return this
  }

  /**
   * Finalizes and returns the options configuration
   */
  build(): OptionsConfig {
    return this.optionsBuilder.build()
  }
}

/**
 * DependentOptionsBuilder provides a fluent API for creating dependent options
 */
export class DependentOptionsBuilder {
  private optionsBuilder: OptionsBuilder

  /**
   * Creates a new dependent options builder
   * @param optionsBuilder Parent options builder
   */
  constructor(optionsBuilder: OptionsBuilder) {
    this.optionsBuilder = optionsBuilder
  }

  /**
   * Adds options for a specific value of the dependent field
   * @param value Dependent field value
   */
  whenEquals(value: string): DependentValueOptionsBuilder {
    return new DependentValueOptionsBuilder(this, value)
  }

  /**
   * Sets a custom expression for option filtering
   * @param expression Custom expression
   */
  withExpression(expression: string): this {
    if (this.optionsBuilder.config.dependency) {
      this.optionsBuilder.config.dependency.expression = expression
    }
    return this
  }

  /**
   * Finalizes and returns the options configuration
   */
  build(): OptionsConfig {
    return this.optionsBuilder.build()
  }
}

/**
 * DependentValueOptionsBuilder provides a fluent API for creating options for a specific value
 */
export class DependentValueOptionsBuilder {
  private dependentOptionsBuilder: DependentOptionsBuilder
  private value: string

  /**
   * Creates a new dependent value options builder
   * @param dependentOptionsBuilder Parent dependent options builder
   * @param value Dependent field value
   */
  constructor(dependentOptionsBuilder: DependentOptionsBuilder, value: string) {
    this.dependentOptionsBuilder = dependentOptionsBuilder
    this.value = value
  }

  /**
   * Adds an option for the current value
   * @param value Option value
   * @param label Option label
   */
  addOption(value: any, label: string): this {
    const option: Option = {
      value,
      label,
    }

    const config = (this.dependentOptionsBuilder as any).optionsBuilder.config

    if (config.dependency?.valueMap) {
      if (!config.dependency.valueMap[this.value]) {
        config.dependency.valueMap[this.value] = []
      }

      config.dependency.valueMap[this.value].push(option)
    }

    return this
  }

  /**
   * Adds an option with an icon for the current value
   * @param value Option value
   * @param label Option label
   * @param icon Option icon
   */
  addOptionWithIcon(value: any, label: string, icon: string): this {
    const option: Option = {
      value,
      label,
      icon,
    }

    const config = (this.dependentOptionsBuilder as any).optionsBuilder.config

    if (config.dependency?.valueMap) {
      if (!config.dependency.valueMap[this.value]) {
        config.dependency.valueMap[this.value] = []
      }

      config.dependency.valueMap[this.value].push(option)
    }

    return this
  }

  /**
   * Adds multiple options for the current value
   * @param options Options to add
   */
  addOptions(...options: Option[]): this {
    const config = (this.dependentOptionsBuilder as any).optionsBuilder.config

    if (config.dependency?.valueMap) {
      if (!config.dependency.valueMap[this.value]) {
        config.dependency.valueMap[this.value] = []
      }

      config.dependency.valueMap[this.value].push(...options)
    }

    return this
  }

  /**
   * Returns to the parent dependent options builder
   */
  end(): DependentOptionsBuilder {
    return this.dependentOptionsBuilder
  }
}

/**
 * Helper functions for creating options
 */

/**
 * Creates a new option
 * @param value Option value
 * @param label Option label
 */
export function newOption(value: any, label: string): Option {
  return {
    value,
    label,
  }
}

/**
 * Creates a new option with an icon
 * @param value Option value
 * @param label Option label
 * @param icon Option icon
 */
export function newOptionWithIcon(
  value: any,
  label: string,
  icon: string,
): Option {
  return {
    value,
    label,
    icon,
  }
}

/**
 * DynamicOptionsFunctionBuilder provides a fluent API for configuring dynamic function options
 */
export class DynamicOptionsFunctionBuilder {
  private optionsBuilder: OptionsBuilder

  /**
   * Creates a new dynamic options function builder
   * @param optionsBuilder Parent options builder
   */
  constructor(optionsBuilder: OptionsBuilder) {
    this.optionsBuilder = optionsBuilder
  }

  /**
   * Adds an argument to the dynamic function
   * @param name Argument name
   * @param value Argument value
   */
  withArgument(name: string, value: any): this {
    if (this.optionsBuilder.config.dynamicSource?.parameters) {
      this.optionsBuilder.config.dynamicSource.parameters[name] = value
    }
    return this
  }

  /**
   * Adds multiple arguments to the dynamic function
   * @param args Arguments to add
   */
  withArguments(args: Record<string, any>): this {
    if (this.optionsBuilder.config.dynamicSource?.parameters) {
      for (const [name, value] of Object.entries(args)) {
        this.optionsBuilder.config.dynamicSource.parameters[name] = value
      }
    }
    return this
  }

  /**
   * Adds a field reference as an argument
   * @param argName Argument name
   * @param fieldId Field ID to reference
   */
  withFieldReference(argName: string, fieldId: string): this {
    if (this.optionsBuilder.config.dynamicSource?.parameters) {
      this.optionsBuilder.config.dynamicSource.parameters[argName] =
        `\${${fieldId}}`
    }
    return this
  }

  /**
   * Finalizes and returns the options configuration
   */
  build(): OptionsConfig {
    return this.optionsBuilder.build()
  }
}
