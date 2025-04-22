import { Field, FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";
import { GroupFieldBuilder } from "./group-field-builder";

/**
 * Array field builder for creating repeatable field groups
 */
export class ArrayFieldBuilder extends FieldBuilder {
  constructor(id: string, label: string) {
    super(id, FieldType.ARRAY, label);
    // Initialize nested field array
    this.buildTarget.nested = [];
  }

  /**
   * Set the template for array items
   */
  public itemTemplate(field: Field): ArrayFieldBuilder {
    if (!this.buildTarget.nested) {
      this.buildTarget.nested = [];
    }
    this.buildTarget.nested.push(field);
    return this;
  }

  /**
   * Add a text field template to the array
   */
  public textField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.TEXT, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a textarea field template to the array
   */
  public textareaField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.TEXTAREA, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a number field template to the array
   */
  public numberField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.NUMBER, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add an email field template to the array
   */
  public emailField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.EMAIL, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a select field template to the array
   */
  public selectField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.SELECT, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a checkbox field template to the array
   */
  public checkboxField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.CHECKBOX, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a radio field template to the array
   */
  public radioField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.RADIO, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a multi-select field template to the array
   */
  public multiSelectField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.MULTI_SELECT, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a password field template to the array
   */
  public passwordField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.PASSWORD, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a file field template to the array
   */
  public fileField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.FILE, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add a date field template to the array
   */
  public dateField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.DATE, label);
    this.itemTemplate(field.build());
    return field;
  }

  /**
   * Add an object field template to the array
   */
  public objectTemplate(id: string, label: string): GroupFieldBuilder {
    const group = new GroupFieldBuilder(id, label);
    this.itemTemplate(group.build());
    return group;
  }

  /**
   * Add an object field template with predefined fields to the array
   */
  public objectTemplateWithFields(
    id: string,
    label: string,
    fields: Field[],
  ): GroupFieldBuilder {
    const group = new GroupFieldBuilder(id, label);
    fields.forEach((field) => group.addField(field));
    this.itemTemplate(group.build());
    return group;
  }

  /**
   * Set the minimum number of items in the array
   */
  public minItems(min: number): ArrayFieldBuilder {
    this.property("minItems", min);
    return this;
  }

  /**
   * Set the maximum number of items in the array
   */
  public maxItems(max: number): ArrayFieldBuilder {
    this.property("maxItems", max);
    return this;
  }
}
