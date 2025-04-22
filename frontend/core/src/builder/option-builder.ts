import { Option, OptionsConfig, OptionsType, DynamicSource } from "../types";

/**
 * Options builder for creating field options
 */
export class OptionsBuilder {
  private config: OptionsConfig;

  constructor() {
    this.config = {
      type: OptionsType.STATIC,
    };
  }

  /**
   * Create a static options configuration
   */
  public static(): StaticOptionsBuilder {
    this.config.type = OptionsType.STATIC;
    this.config.static = [];
    return new StaticOptionsBuilder(this);
  }

  /**
   * Create a dynamic options configuration
   */
  public dynamic(): DynamicOptionsBuilder {
    this.config.type = OptionsType.DYNAMIC;
    this.config.dynamicSource = {
      type: "api",
    };
    return new DynamicOptionsBuilder(this);
  }

  /**
   * Create a dependent options configuration
   */
  public dependent(field: string): DependentOptionsBuilder {
    this.config.type = OptionsType.DEPENDENT;
    this.config.dependency = {
      field,
      valueMap: {},
    };
    return new DependentOptionsBuilder(this);
  }

  /**
   * Extract the dynamic source from the options config
   */
  public getDynamicSource(): DynamicSource | undefined {
    if (this.config.type === OptionsType.DYNAMIC) {
      return this.config.dynamicSource;
    }
    return undefined;
  }

  /**
   * Build and return the options configuration
   */
  public build(): OptionsConfig {
    return this.config;
  }
}

/**
 * Builder for static options
 */
export class StaticOptionsBuilder {
  private optionsBuilder: OptionsBuilder;

  constructor(optionsBuilder: OptionsBuilder) {
    this.optionsBuilder = optionsBuilder;
  }

  /**
   * Add an option to the static options list
   */
  public addOption(value: any, label: string): StaticOptionsBuilder {
    const option: Option = {
      value,
      label,
    };

    const config = this.optionsBuilder.build();
    if (!config.static) {
      config.static = [];
    }
    config.static.push(option);

    return this;
  }

  /**
   * Add an option with an icon to the static options list
   */
  public addOptionWithIcon(
    value: any,
    label: string,
    icon: string,
  ): StaticOptionsBuilder {
    const option: Option = {
      value,
      label,
      icon,
    };

    const config = this.optionsBuilder.build();
    if (!config.static) {
      config.static = [];
    }
    config.static.push(option);

    return this;
  }

  /**
   * Add multiple options to the static options list
   */
  public addOptions(options: Option[]): StaticOptionsBuilder {
    const config = this.optionsBuilder.build();
    if (!config.static) {
      config.static = [];
    }
    config.static.push(...options);

    return this;
  }

  /**
   * Build and return the options configuration
   */
  public build(): OptionsConfig {
    return this.optionsBuilder.build();
  }
}

/**
 * Builder for dynamic options
 */
export class DynamicOptionsBuilder {
  private optionsBuilder: OptionsBuilder;

  constructor(optionsBuilder: OptionsBuilder) {
    this.optionsBuilder = optionsBuilder;
  }

  /**
   * Configure options to be fetched from an API endpoint
   */
  public fromAPI(endpoint: string, method: string): DynamicOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dynamicSource) {
      config.dynamicSource.type = "api";
      config.dynamicSource.endpoint = endpoint;
      config.dynamicSource.method = method;
    }

    return this;
  }

  /**
   * Configure options to be fetched from an API endpoint with path mapping
   */
  public fromAPIWithPath(
    endpoint: string,
    method: string,
    valuePath: string,
    labelPath: string,
  ): DynamicOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dynamicSource) {
      config.dynamicSource.type = "api";
      config.dynamicSource.endpoint = endpoint;
      config.dynamicSource.method = method;
      config.dynamicSource.valuePath = valuePath;
      config.dynamicSource.labelPath = labelPath;
    }

    return this;
  }

  /**
   * Add an HTTP header to the API request
   */
  public withHeader(key: string, value: string): DynamicOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dynamicSource) {
      if (!config.dynamicSource.headers) {
        config.dynamicSource.headers = {};
      }
      config.dynamicSource.headers[key] = value;
    }

    return this;
  }

  /**
   * Add a parameter to the API request
   */
  public withParameter(key: string, value: any): DynamicOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dynamicSource) {
      if (!config.dynamicSource.parameters) {
        config.dynamicSource.parameters = {};
      }
      config.dynamicSource.parameters[key] = value;
    }

    return this;
  }

  /**
   * Set the JSON path to the value in the response
   */
  public withValuePath(path: string): DynamicOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dynamicSource) {
      config.dynamicSource.valuePath = path;
    }

    return this;
  }

  /**
   * Set the JSON path to the label in the response
   */
  public withLabelPath(path: string): DynamicOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dynamicSource) {
      config.dynamicSource.labelPath = path;
    }

    return this;
  }

  /**
   * Set fields that trigger options refresh
   */
  public refreshOn(fieldIDs: string[]): DynamicOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dynamicSource) {
      config.dynamicSource.refreshOn = fieldIDs;
    }

    return this;
  }

  /**
   * Configure options to be generated by a custom function
   */
  public fromFunction(functionName: string): DynamicOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dynamicSource) {
      config.dynamicSource.type = "function";

      // Store function name in parameters
      if (!config.dynamicSource.parameters) {
        config.dynamicSource.parameters = {};
      }
      config.dynamicSource.parameters.functionName = functionName;
    }

    return this;
  }

  /**
   * Build and return the options configuration
   */
  public build(): OptionsConfig {
    return this.optionsBuilder.build();
  }
}

/**
 * Builder for dependent options
 */
export class DependentOptionsBuilder {
  private optionsBuilder: OptionsBuilder;

  constructor(optionsBuilder: OptionsBuilder) {
    this.optionsBuilder = optionsBuilder;
  }

  /**
   * Add options for a specific value of the dependent field
   */
  public whenEquals(value: string): DependentValueOptionsBuilder {
    return new DependentValueOptionsBuilder(this, value);
  }

  /**
   * Set a custom expression for option filtering
   */
  public withExpression(expression: string): DependentOptionsBuilder {
    const config = this.optionsBuilder.build();

    if (config.dependency) {
      config.dependency.expression = expression;
    }

    return this;
  }

  /**
   * Build and return the options configuration
   */
  public build(): OptionsConfig {
    return this.optionsBuilder.build();
  }
}

/**
 * Builder for dependent options for a specific value
 */
export class DependentValueOptionsBuilder {
  private dependentOptionsBuilder: DependentOptionsBuilder;
  private value: string;

  constructor(dependentOptionsBuilder: DependentOptionsBuilder, value: string) {
    this.dependentOptionsBuilder = dependentOptionsBuilder;
    this.value = value;
  }

  /**
   * Add an option for the current value
   */
  public addOption(value: any, label: string): DependentValueOptionsBuilder {
    const option: Option = {
      value,
      label,
    };

    const config = this.dependentOptionsBuilder.build();

    if (config.dependency && config.dependency.valueMap) {
      if (!config.dependency.valueMap[this.value]) {
        config.dependency.valueMap[this.value] = [];
      }

      config.dependency.valueMap[this.value].push(option);
    }

    return this;
  }

  /**
   * Add an option with an icon for the current value
   */
  public addOptionWithIcon(
    value: any,
    label: string,
    icon: string,
  ): DependentValueOptionsBuilder {
    const option: Option = {
      value,
      label,
      icon,
    };

    const config = this.dependentOptionsBuilder.build();

    if (config.dependency && config.dependency.valueMap) {
      if (!config.dependency.valueMap[this.value]) {
        config.dependency.valueMap[this.value] = [];
      }

      config.dependency.valueMap[this.value].push(option);
    }

    return this;
  }

  /**
   * Add multiple options for the current value
   */
  public addOptions(options: Option[]): DependentValueOptionsBuilder {
    const config = this.dependentOptionsBuilder.build();

    if (config.dependency && config.dependency.valueMap) {
      if (!config.dependency.valueMap[this.value]) {
        config.dependency.valueMap[this.value] = [];
      }

      config.dependency.valueMap[this.value].push(...options);
    }

    return this;
  }

  /**
   * Return to the parent dependent options builder
   */
  public end(): DependentOptionsBuilder {
    return this.dependentOptionsBuilder;
  }
}

/**
 * Create a new options builder
 */
export function createOptionsBuilder(): OptionsBuilder {
  return new OptionsBuilder();
}

/**
 * Create a new option
 */
export function createOption(value: any, label: string, icon?: string): Option {
  return { value, label, icon };
}
