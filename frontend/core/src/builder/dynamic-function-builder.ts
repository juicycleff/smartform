import { DynamicFieldConfig } from "../types";
import { FieldBuilder } from "./field-builder";

/**
 * Builder for configuring dynamic functions
 */
export class DynamicFunctionBuilder {
  private fieldBuilder: FieldBuilder;
  private config: DynamicFieldConfig;

  constructor(fieldBuilder: FieldBuilder, config: DynamicFieldConfig) {
    this.fieldBuilder = fieldBuilder;
    this.config = config;
  }

  /**
   * Add an argument to the dynamic function
   */
  public withArgument(name: string, value: any): DynamicFunctionBuilder {
    this.config.arguments = this.config.arguments || {};
    this.config.arguments[name] = value;
    return this;
  }

  /**
   * Add multiple arguments to the dynamic function
   */
  public withArguments(args: Record<string, any>): DynamicFunctionBuilder {
    this.config.arguments = this.config.arguments || {};
    for (const [name, value] of Object.entries(args)) {
      this.config.arguments[name] = value;
    }
    return this;
  }

  /**
   * Add a field reference as an argument
   */
  public withFieldReference(
    argName: string,
    fieldId: string,
  ): DynamicFunctionBuilder {
    this.config.arguments = this.config.arguments || {};
    this.config.arguments[argName] = `\${${fieldId}}`;
    return this;
  }

  /**
   * Add a data transformer to the dynamic function
   */
  public withTransformer(transformerName: string): DynamicFunctionBuilder {
    this.config.transformerName = transformerName;
    this.config.transformerParams = {};
    return this;
  }

  /**
   * Add a parameter to the transformer
   */
  public withTransformerParam(
    name: string,
    value: any,
  ): DynamicFunctionBuilder {
    this.config.transformerParams = this.config.transformerParams || {};
    this.config.transformerParams[name] = value;
    return this;
  }

  /**
   * Return to the field builder
   */
  public end(): FieldBuilder {
    return this.fieldBuilder;
  }
}
