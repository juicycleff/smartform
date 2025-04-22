import { FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";
import { DynamicFunctionBuilder } from "../dynamic-function-builder";

/**
 * API field builder for creating API integration fields
 */
export class APIFieldBuilder extends FieldBuilder {
  constructor(id: string, label: string) {
    super(id, FieldType.API, label);
  }

  /**
   * Set the API endpoint
   */
  public endpoint(endpoint: string): APIFieldBuilder {
    this.property("endpoint", endpoint);
    return this;
  }

  /**
   * Set the HTTP method
   */
  public method(method: string): APIFieldBuilder {
    this.property("method", method);
    return this;
  }

  /**
   * Add an HTTP header
   */
  public header(key: string, value: string): APIFieldBuilder {
    const headers = this.buildTarget.properties.headers || {};
    headers[key] = value;
    this.property("headers", headers);
    return this;
  }

  /**
   * Add a request parameter
   */
  public parameter(key: string, value: any): APIFieldBuilder {
    const params = this.buildTarget.properties.parameters || {};
    params[key] = value;
    this.property("parameters", params);
    return this;
  }

  /**
   * Set a mapping from API response to form fields
   */
  public responseMapping(mapping: Record<string, string>): APIFieldBuilder {
    this.property("responseMapping", mapping);
    return this;
  }

  /**
   * Add dynamic request functionality
   */
  public withDynamicRequest(functionName: string): DynamicFunctionBuilder {
    this.property("dynamicRequest", true);

    // Create dynamic field config
    const config = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.property("requestFunction", config);

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }

  /**
   * Add dynamic response handling
   */
  public withDynamicResponse(functionName: string): DynamicFunctionBuilder {
    this.property("dynamicResponse", true);

    // Create dynamic field config
    const config = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.property("responseFunction", config);

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }
}
