import {
  APIKeyBuilder,
  BasicAuthBuilder,
  JWTBuilder,
  OAuth2Builder,
  SAMLBuilder,
} from "./auth-builder";
import { FieldBuilder } from "./field-builder";
import { FormSchemaImpl } from "./form-schema";
import {
  APIFieldBuilder,
  AnyOfFieldBuilder,
  ArrayFieldBuilder,
  AuthFieldBuilder,
  BranchFieldBuilder,
  CustomFieldBuilder,
  GroupFieldBuilder,
  OneOfFieldBuilder,
} from "./specialized-field-builder";
import { type AuthStrategy, type Field, FormType } from "./types";

/**
 * FormBuilder provides a fluent API for creating form schemas
 */
export class FormBuilder {
  private schema: FormSchemaImpl;

  /**
   * Create a new form builder
   * @param id Unique form identifier
   * @param title Form display title
   */
  constructor(id: string, title: string) {
    this.schema = new FormSchemaImpl(id, title);
  }

  /**
   * Creates a new authentication form builder
   * @param id Unique form identifier
   * @param title Form display title
   * @param authType Authentication strategy
   * @returns New form builder instance
   */
  static createAuthForm(
    id: string,
    title: string,
    authType: AuthStrategy,
  ): FormBuilder {
    const builder = new FormBuilder(id, title);
    builder.schema.type = FormType.Auth;
    builder.schema.authType = authType;
    return builder;
  }

  /**
   * Sets the form description
   * @param description Form description text
   */
  description(description: string): this {
    this.schema.description = description;
    return this;
  }

  /**
   * Sets the form type
   * @param formType Form type
   */
  formType(formType: FormType): this {
    this.schema.type = formType;
    return this;
  }

  /**
   * Sets the authentication type for auth forms
   * @param authType Authentication strategy
   */
  authType(authType: AuthStrategy): this {
    if (this.schema.type === FormType.Auth) {
      this.schema.authType = authType;
    }
    return this;
  }

  /**
   * Sets a custom property on the form
   * @param key Property key
   * @param value Property value
   */
  property(key: string, value: any): this {
    this.schema.properties[key] = value;
    return this;
  }

  /**
   * Adds a field to the form
   * @param field Field to add
   */
  addField(field: Field): this {
    this.schema.addField(field);
    return this;
  }

  /**
   * Adds multiple fields to the form
   * @param fields Fields to add
   */
  addFields(...fields: Field[]): this {
    this.schema.addFields(...fields);
    return this;
  }

  /**
   * Adds a text field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  textField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "text", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a textarea field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  textareaField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "textarea", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a number field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  numberField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "number", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds an email field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  emailField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "email", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a password field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  passwordField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "password", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a select field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  selectField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "select", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a multi-select field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  multiSelectField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "multiselect", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a checkbox field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  checkboxField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "checkbox", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a radio button field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  radioField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "radio", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a date field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  dateField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "date", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a time field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  timeField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "time", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a datetime field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  dateTimeField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "datetime", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a file upload field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  fileField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "file", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds an image upload field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  imageField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "image", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a switch field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  switchField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "switch", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a slider field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  sliderField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "slider", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a rating field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  ratingField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "rating", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a color picker field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  colorField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "color", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a hidden field to the form
   * @param id Field identifier
   * @param value Field value
   */
  hiddenField(id: string, value: any): FieldBuilder {
    const builder = new FieldBuilder(id, "hidden", "");
    builder.defaultValue(value);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a rich text editor field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  richTextField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "richtext", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a section separator to the form
   * @param id Field identifier
   * @param label Field display label
   */
  sectionField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, "section", label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a group field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  groupField(id: string, label: string): GroupFieldBuilder {
    const builder = new GroupFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds an array field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  arrayField(id: string, label: string): ArrayFieldBuilder {
    const builder = new ArrayFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a oneOf field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  oneOfField(id: string, label: string): OneOfFieldBuilder {
    const builder = new OneOfFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds an anyOf field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  anyOfField(id: string, label: string): AnyOfFieldBuilder {
    const builder = new AnyOfFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds an API integration field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  apiField(id: string, label: string): APIFieldBuilder {
    const builder = new APIFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds an authentication field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  authField(id: string, label: string): AuthFieldBuilder {
    const builder = new AuthFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds an OAuth authentication field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  oAuthField(id: string, label: string): OAuth2Builder {
    const builder = new OAuth2Builder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a basic authentication field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  basicAuthField(id: string, label: string): BasicAuthBuilder {
    const builder = new BasicAuthBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds an API key authentication field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  apiKeyField(id: string, label: string): APIKeyBuilder {
    const builder = new APIKeyBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a JWT authentication field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  jwtField(id: string, label: string): JWTBuilder {
    const builder = new JWTBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a SAML authentication field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  samlField(id: string, label: string): SAMLBuilder {
    const builder = new SAMLBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a workflow branch field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  branchField(id: string, label: string): BranchFieldBuilder {
    const builder = new BranchFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Adds a custom field to the form
   * @param id Field identifier
   * @param label Field display label
   */
  customField(id: string, label: string): CustomFieldBuilder {
    const builder = new CustomFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Finalizes and returns the form schema
   * @returns The completed form schema
   */
  build(): FormSchemaImpl {
    // Sort fields by order before returning
    this.schema.sortFields();
    return this.schema;
  }
}
