import { FormSchema, Field, FormType, FieldType, AuthStrategy } from "../types";
import { BaseBuilder } from "./base-builder";
import { FieldBuilder } from "./field-builder";
import { GroupFieldBuilder } from "./specialized-field-builders/group-field-builder";
import { ArrayFieldBuilder } from "./specialized-field-builders/array-field-builder";
import { OneOfFieldBuilder } from "./specialized-field-builders/one-of-field-builder";
import { AnyOfFieldBuilder } from "./specialized-field-builders/any-of-field-builder";
import { APIFieldBuilder } from "./specialized-field-builders/api-field-builder";
import { AuthFieldBuilder } from "./specialized-field-builders/auth-field-builder";
import { BranchFieldBuilder } from "./specialized-field-builders/branch-field-builder";
import { CustomFieldBuilder } from "./specialized-field-builders/custom-field-builder";
import {
  OAuth2Builder,
  BasicAuthBuilder,
  APIKeyBuilder,
  JWTBuilder,
  SAMLBuilder,
} from "./specialized-field-builders/auth-builders";
import * as utils from "../utils";

/**
 * Form schema builder
 */
export class FormBuilder extends BaseBuilder<FormSchema> {
  constructor(id: string, title: string) {
    super({
      id,
      title,
      fields: [],
      properties: {},
    });
  }

  /**
   * Set the form description
   */
  public description(description: string): FormBuilder {
    this.buildTarget.description = description;
    return this;
  }

  /**
   * Set the form type
   */
  public formType(type: FormType): FormBuilder {
    this.buildTarget.type = type;
    return this;
  }

  /**
   * Set the authentication type for auth forms
   */
  public authType(authType: AuthStrategy): FormBuilder {
    if (this.buildTarget.type === FormType.AUTH) {
      this.buildTarget.authType = authType;
    }
    return this;
  }

  /**
   * Set a custom property on the form
   */
  public property(key: string, value: any): FormBuilder {
    this.buildTarget.properties[key] = value;
    return this;
  }

  /**
   * Add a field to the form
   */
  public addField(field: Field): FormBuilder {
    this.buildTarget.fields.push(field);
    return this;
  }

  /**
   * Add multiple fields to the form
   */
  public addFields(fields: Field[]): FormBuilder {
    this.buildTarget.fields.push(...fields);
    return this;
  }

  // Factory methods for specific field types
  /**
   * Add a text field to the form
   */
  public textField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.TEXT, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a textarea field to the form
   */
  public textareaField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.TEXTAREA, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a number field to the form
   */
  public numberField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.NUMBER, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add an email field to the form
   */
  public emailField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.EMAIL, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a password field to the form
   */
  public passwordField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.PASSWORD, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a select field to the form
   */
  public selectField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.SELECT, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a multi-select field to the form
   */
  public multiSelectField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.MULTI_SELECT, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a checkbox field to the form
   */
  public checkboxField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.CHECKBOX, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a radio button field to the form
   */
  public radioField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.RADIO, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a date field to the form
   */
  public dateField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.DATE, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a time field to the form
   */
  public timeField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.TIME, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a datetime field to the form
   */
  public dateTimeField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.DATETIME, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a file upload field to the form
   */
  public fileField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.FILE, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add an image upload field to the form
   */
  public imageField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.IMAGE, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a switch field to the form
   */
  public switchField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.SWITCH, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a slider field to the form
   */
  public sliderField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.SLIDER, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a rating field to the form
   */
  public ratingField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.RATING, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a color picker field to the form
   */
  public colorField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.COLOR, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a hidden field to the form
   */
  public hiddenField(id: string, value: any): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.HIDDEN, "");
    builder.defaultValue(value);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a rich text editor field to the form
   */
  public richTextField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.RICH_TEXT, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a section separator to the form
   */
  public sectionField(id: string, label: string): FieldBuilder {
    const builder = new FieldBuilder(id, FieldType.SECTION, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a group field to the form
   */
  public groupField(id: string, label: string): GroupFieldBuilder {
    const builder = new GroupFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add an array field to the form
   */
  public arrayField(id: string, label: string): ArrayFieldBuilder {
    const builder = new ArrayFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a oneOf field to the form
   */
  public oneOfField(id: string, label: string): OneOfFieldBuilder {
    const builder = new OneOfFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add an anyOf field to the form
   */
  public anyOfField(id: string, label: string): AnyOfFieldBuilder {
    const builder = new AnyOfFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add an API integration field to the form
   */
  public apiField(id: string, label: string): APIFieldBuilder {
    const builder = new APIFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add an authentication field to the form
   */
  public authField(id: string, label: string): AuthFieldBuilder {
    const builder = new AuthFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add an OAuth authentication field to the form
   */
  public oauthField(id: string, label: string): OAuth2Builder {
    const builder = new OAuth2Builder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a basic authentication field to the form
   */
  public basicAuthField(id: string, label: string): BasicAuthBuilder {
    const builder = new BasicAuthBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add an API key authentication field to the form
   */
  public apiKeyField(id: string, label: string): APIKeyBuilder {
    const builder = new APIKeyBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a JWT authentication field to the form
   */
  public jwtField(id: string, label: string): JWTBuilder {
    const builder = new JWTBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a SAML authentication field to the form
   */
  public samlField(id: string, label: string): SAMLBuilder {
    const builder = new SAMLBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a workflow branch field to the form
   */
  public branchField(id: string, label: string): BranchFieldBuilder {
    const builder = new BranchFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Add a custom field to the form
   */
  public customField(id: string, label: string): CustomFieldBuilder {
    const builder = new CustomFieldBuilder(id, label);
    this.addField(builder.build());
    return builder;
  }

  /**
   * Sort all fields in the form by their order property
   */
  public sortFields(): FormBuilder {
    if (this.buildTarget.fields && this.buildTarget.fields.length > 0) {
      this.buildTarget.fields.sort((a: any, b: any) => {
        if (a.order === b.order) return 0;
        return a.order > b.order ? 1 : -1;
      });
    }
    return this;
  }

  /**
   * Find a field in the form by its ID
   */
  public findFieldById(id: string): Field | undefined {
    return utils.findFieldById(this.buildTarget.fields, id);
  }

  /**
   * Find a field in nested fields by its ID
   */
  private findNestedFieldById(fields: Field[], id: string): Field | undefined {
    return utils.findFieldById(this.buildTarget.fields, id);
  }

  /**
   * Validate the form structure
   * This performs basic validation of the form structure, not form data
   */
  public validate(): string[] {
    return utils.validate(this.buildTarget);
  }

  /**
   * Create a deep clone of the form schema
   */
  public clone(): FormBuilder {
    const clone = new FormBuilder(this.buildTarget.id, this.buildTarget.title);

    // Copy simple properties
    clone.buildTarget.description = this.buildTarget.description;
    clone.buildTarget.type = this.buildTarget.type;
    clone.buildTarget.authType = this.buildTarget.authType;

    // Deep copy properties
    if (this.buildTarget.properties) {
      clone.buildTarget.properties = JSON.parse(
        JSON.stringify(this.buildTarget.properties),
      );
    }

    // Deep copy fields
    if (this.buildTarget.fields) {
      clone.buildTarget.fields = JSON.parse(
        JSON.stringify(this.buildTarget.fields),
      );
    }

    return clone;
  }

  /**
   * Merge another form schema into this one
   */
  public merge(otherForm: FormSchema): FormBuilder {
    // Add fields from other form
    if (otherForm.fields) {
      this.addFields(otherForm.fields);
    }

    // Merge properties
    if (otherForm.properties) {
      this.buildTarget.properties = {
        ...this.buildTarget.properties,
        ...otherForm.properties,
      };
    }

    return this;
  }
}

// /**
//  * Create a new regular form
//  */
// export function createForm(id: string, title: string): FormBuilder {
//   return new FormBuilder(id, title).formType(FormType.REGULAR);
// }
//
// /**
//  * Create a new authentication form
//  */
// export function createAuthForm(
//   id: string,
//   title: string,
//   authType: AuthStrategy,
// ): FormBuilder {
//   return new FormBuilder(id, title).formType(FormType.AUTH).authType(authType);
// }
