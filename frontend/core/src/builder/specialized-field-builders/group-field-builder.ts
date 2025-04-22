import { Field, FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";

/**
 * Group field builder for creating group fields with nested fields
 */
export class GroupFieldBuilder extends FieldBuilder {
  constructor(id: string, label: string) {
    super(id, FieldType.GROUP, label);
    // Initialize nested field array
    this.buildTarget.nested = [];
  }

  /**
   * Add a nested field to the group
   */
  public addField(field: Field): GroupFieldBuilder {
    if (!this.buildTarget.nested) {
      this.buildTarget.nested = [];
    }
    this.buildTarget.nested.push(field);
    return this;
  }

  /**
   * Add a text field to the group
   */
  public textField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.TEXT, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a textarea field to the group
   */
  public textareaField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.TEXTAREA, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a number field to the group
   */
  public numberField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.NUMBER, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add an email field to the group
   */
  public emailField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.EMAIL, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a select field to the group
   */
  public selectField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.SELECT, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a checkbox field to the group
   */
  public checkboxField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.CHECKBOX, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a radio button field to the group
   */
  public radioField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.RADIO, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a multi-select field to the group
   */
  public multiSelectField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.MULTI_SELECT, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a password field to the group
   */
  public passwordField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.PASSWORD, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a file field to the group
   */
  public fileField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.FILE, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a nested group field to the group
   */
  public objectField(id: string, label: string): GroupFieldBuilder {
    const field = new GroupFieldBuilder(id, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a date field to the group
   */
  public dateField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.DATE, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a time field to the group
   */
  public timeField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.TIME, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a datetime field to the group
   */
  public dateTimeField(id: string, label: string): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.DATETIME, label);
    this.addField(field.build());
    return field;
  }

  /**
   * Add a hidden field to the group
   */
  public hiddenField(id: string, value: any): FieldBuilder {
    const field = new FieldBuilder(id, FieldType.HIDDEN, "");
    field.defaultValue(value);
    this.addField(field.build());
    return field;
  }
}
