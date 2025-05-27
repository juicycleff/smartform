import { DynamicFunctionBuilder, FieldBuilder } from "../field-builder";
import type { Field } from "../types.ts";

/**
 * GroupFieldBuilder provides a fluent API for creating group fields
 */
export class GroupFieldBuilder extends FieldBuilder {
  /**
   * Creates a new group field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    super(id, "group", label);
    this.field.nested = [];
  }

  /**
   * Adds a nested field to the group
   * @param field Field to add
   */
  addField(field: Field): this {
    if (!this.field.nested) {
      this.field.nested = [];
    }
    this.field.nested.push(field);
    return this;
  }

  /**
   * Adds a text field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  textField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "text", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a textarea field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  textareaField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "textarea", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a number field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  numberField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "number", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds an email field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  emailField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "email", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a select field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  selectField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "select", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a checkbox field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  checkboxField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "checkbox", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a radio button field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  radioField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "radio", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a multi-select field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  multiSelectField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "multiselect", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a password field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  passwordField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "password", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a file upload field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  fileField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "file", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds an object field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  objectField(id: string, label: string): GroupFieldBuilder {
    const field = new GroupFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds an object template to the group
   * @param id Field identifier
   * @param label Field display label
   */
  objectTemplate(id: string, label: string): GroupFieldBuilder {
    const field = new GroupFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds an array field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  arrayField(id: string, label: string): ArrayFieldBuilder {
    const field = new ArrayFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a oneOf field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  oneOfField(id: string, label: string): OneOfFieldBuilder {
    const field = new OneOfFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds an anyOf field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  anyOfField(id: string, label: string): AnyOfFieldBuilder {
    const field = new AnyOfFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds an API integration field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  apiField(id: string, label: string): APIFieldBuilder {
    const field = new APIFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds an authentication field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  authField(id: string, label: string): AuthFieldBuilder {
    const field = new AuthFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a workflow branch field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  branchField(id: string, label: string): BranchFieldBuilder {
    const field = new BranchFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a custom field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  customField(id: string, label: string): CustomFieldBuilder {
    const field = new CustomFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a hidden field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  hiddenField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "hidden", label);
    this.addField(field.build());
    return field;
  }

  /**
   * Adds a date field to the group
   * @param id Field identifier
   * @param label Field display label
   */
  dateField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "date", label);
    this.addField(field.build());
    return field;
  }
}

/**
 * ArrayFieldBuilder provides a fluent API for creating array fields
 */
export class ArrayFieldBuilder extends FieldBuilder {
  /**
   * Creates a new array field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    super(id, "array", label);
    this.field.nested = [];
  }

  /**
   * Sets the template for array items
   * @param field Template field
   */
  itemTemplate(field: Field): this {
    if (!this.field.nested) {
      this.field.nested = [];
    }
    this.field.nested.push(field);
    return this;
  }

  /**
   * Adds a text field template to the array
   * @param id Field identifier
   * @param label Field display label
   */
  textField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "text", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds an object field template to the array
   * @param id Field identifier
   * @param label Field display label
   */
  objectTemplate(id: string, label: string): GroupFieldBuilder {
    const group = new GroupFieldBuilder(id, label);
    this.itemTemplate(group.build());
    return group;
  }

  /**
   * Creates a GroupFieldBuilder with the given fields, sets it as an item template
   * @param id Field identifier
   * @param label Field display label
   * @param fields Fields to add to the group
   */
  objectTemplateWithFields(
    id: string,
    label: string,
    fields: Field[],
  ): GroupFieldBuilder {
    const group = new GroupFieldBuilder(id, label);
    for (const field of fields) {
      group.addField(field);
    }
    this.itemTemplate(group.build());
    return group;
  }

  /**
   * Adds a date field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  dateField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "date", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a number field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  numberField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "number", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds an email field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  emailField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "email", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a select field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  selectField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "select", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a checkbox field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  checkboxField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "checkbox", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a radio field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  radioField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "radio", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a multi-select field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  multiSelectField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "multiselect", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a password field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  passwordField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "password", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a file field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  fileField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "file", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a object field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  objectField(id: string, label: string): GroupFieldBuilder {
    const field = new GroupFieldBuilder(id, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a oneOf field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  oneOfField(id: string, label: string): OneOfFieldBuilder {
    const field = new OneOfFieldBuilder(id, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds an anyOf field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  anyOfField(id: string, label: string): AnyOfFieldBuilder {
    const field = new AnyOfFieldBuilder(id, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds an API field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  apiField(id: string, label: string): APIFieldBuilder {
    const field = new APIFieldBuilder(id, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds an authentication field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  authField(id: string, label: string): AuthFieldBuilder {
    const field = new AuthFieldBuilder(id, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a branch field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  branchField(id: string, label: string): BranchFieldBuilder {
    const field = new BranchFieldBuilder(id, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a custom field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  customField(id: string, label: string): CustomFieldBuilder {
    const field = new CustomFieldBuilder(id, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Adds a hidden field to the array
   * @param id Field identifier
   * @param label Field display label
   */
  hiddenField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, "hidden", label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Sets the minimum number of items in the array
   * @param min Minimum items
   */
  minItems(min: number): this {
    this.property("minItems", min);
    return this;
  }

  /**
   * Sets the maximum number of items in the array
   * @param max Maximum items
   */
  maxItems(max: number): this {
    this.property("maxItems", max);
    return this;
  }
}

/**
 * OneOfFieldBuilder provides a fluent API for creating oneOf fields
 */
export class OneOfFieldBuilder extends FieldBuilder {
  /**
   * Creates a new oneOf field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    super(id, "oneOf", label);
    this.field.nested = [];
  }

  /**
   * Adds an option to the oneOf field
   * @param field Option field
   */
  addOption(field: Field): this {
    if (!this.field.nested) {
      this.field.nested = [];
    }
    this.field.nested.push(field);
    return this;
  }

  /**
   * Adds a group option to the oneOf field
   * @param id Field identifier
   * @param label Field display label
   */
  groupOption(id: string, label: string): GroupFieldBuilder {
    const group = new GroupFieldBuilder(id, label);
    this.addOption(group.build());
    return group;
  }
}

/**
 * AnyOfFieldBuilder provides a fluent API for creating anyOf fields
 */
export class AnyOfFieldBuilder extends FieldBuilder {
  /**
   * Creates a new anyOf field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    super(id, "anyOf", label);
    this.field.nested = [];
  }

  /**
   * Adds an option to the anyOf field
   * @param field Option field
   */
  addOption(field: Field): this {
    if (!this.field.nested) {
      this.field.nested = [];
    }
    this.field.nested.push(field);
    return this;
  }

  /**
   * Adds a group option to the anyOf field
   * @param id Field identifier
   * @param label Field display label
   */
  groupOption(id: string, label: string): GroupFieldBuilder {
    const group = new GroupFieldBuilder(id, label);
    this.addOption(group.build());
    return group;
  }
}

/**
 * APIFieldBuilder provides a fluent API for creating API integration fields
 */
export class APIFieldBuilder extends FieldBuilder {
  /**
   * Creates a new API field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    super(id, "api", label);
  }

  /**
   * Sets the API endpoint
   * @param endpoint API endpoint URL
   */
  endpoint(endpoint: string): this {
    this.property("endpoint", endpoint);
    return this;
  }

  /**
   * Sets the HTTP method
   * @param method HTTP method
   */
  method(method: string): this {
    this.property("method", method);
    return this;
  }

  /**
   * Adds an HTTP header
   * @param key Header key
   * @param value Header value
   */
  header(key: string, value: string): this {
    const headers =
      (this.field.properties?.headers as Record<string, string>) || {};
    headers[key] = value;
    this.property("headers", headers);
    return this;
  }

  /**
   * Adds a request parameter
   * @param key Parameter key
   * @param value Parameter value
   */
  parameter(key: string, value: any): this {
    const params =
      (this.field.properties?.parameters as Record<string, any>) || {};
    params[key] = value;
    this.property("parameters", params);
    return this;
  }

  /**
   * Sets a mapping from API response to form fields
   * @param mapping Response mapping
   */
  responseMapping(mapping: Record<string, string>): this {
    this.property("responseMapping", mapping);
    return this;
  }

  /**
   * Adds dynamic request generation to the API field
   * @param functionName Function name
   */
  withDynamicRequest(functionName: string): DynamicFunctionBuilder {
    this.field.properties!.dynamicRequest = true;

    // Create dynamic field config
    const config = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.field.properties!.requestFunction = config;

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }

  /**
   * Adds dynamic response handling to the API field
   * @param functionName Function name
   */
  withDynamicResponse(functionName: string): DynamicFunctionBuilder {
    this.field.properties!.dynamicResponse = true;

    // Create dynamic field config
    const config = {
      functionName,
      arguments: {},
    };

    // Store the config
    this.field.properties!.responseFunction = config;

    // Return builder for configuring the dynamic function
    return new DynamicFunctionBuilder(this, config);
  }
}

/**
 * AuthFieldBuilder provides a fluent API for creating authentication fields
 */
export class AuthFieldBuilder extends FieldBuilder {
  /**
   * Creates a new authentication field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    super(id, "auth", label);
  }

  /**
   * Sets the authentication type
   * @param authType Authentication type
   */
  authType(authType: string): this {
    this.property("authType", authType);
    return this;
  }

  /**
   * Sets the service ID for authentication
   * @param serviceId Service ID
   */
  serviceId(serviceId: string): this {
    this.property("serviceId", serviceId);
    return this;
  }
}

/**
 * BranchFieldBuilder provides a fluent API for creating workflow branch fields
 */
export class BranchFieldBuilder extends FieldBuilder {
  /**
   * Creates a new branch field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    super(id, "branch", label);
  }

  /**
   * Sets the branch condition
   * @param condition Branching condition
   */
  condition(condition: any): this {
    this.property("condition", condition);
    return this;
  }

  /**
   * Sets the form to show when condition is true
   * @param formId Form ID
   */
  trueBranch(formId: string): this {
    this.property("trueBranch", formId);
    return this;
  }

  /**
   * Sets the form to show when condition is false
   * @param formId Form ID
   */
  falseBranch(formId: string): this {
    this.property("falseBranch", formId);
    return this;
  }
}

/**
 * CustomFieldBuilder provides a fluent API for creating custom component fields
 */
export class CustomFieldBuilder extends FieldBuilder {
  /**
   * Creates a new custom field builder
   * @param id Field identifier
   * @param label Field display label
   */
  constructor(id: string, label: string) {
    super(id, "custom", label);
  }

  /**
   * Sets the custom component name
   * @param name Component name
   */
  componentName(name: string): this {
    this.property("componentName", name);
    return this;
  }

  /**
   * Sets the custom component props
   * @param props Component props
   */
  componentProps(props: Record<string, any>): this {
    this.property("componentProps", props);
    return this;
  }
}
