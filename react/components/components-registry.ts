import type React from "react";
import { FieldType } from "../core";

import CheckboxFieldComponent from "./fields/checkbox-field";
import CustomFieldComponent from "./fields/custom-field";
import DateFieldComponent from "./fields/date-field";
import NumberFieldComponent from "./fields/number-field";
import SelectFieldComponent from "./fields/select-field";
import TextFieldComponent from "./fields/text-field";

export class ComponentRegistry {
  private components: Map<string, React.ComponentType<any>>;

  constructor() {
    this.components = new Map();

    this.registerDefaults();
  }

  private registerDefaults() {
    this.register(FieldType.Text, TextFieldComponent);
    this.register(FieldType.Textarea, TextFieldComponent);
    this.register(FieldType.Email, TextFieldComponent);
    this.register(FieldType.Password, TextFieldComponent);
    this.register(FieldType.Number, NumberFieldComponent);
    this.register(FieldType.Select, SelectFieldComponent);
    this.register(FieldType.MultiSelect, SelectFieldComponent);
    this.register(FieldType.Checkbox, CheckboxFieldComponent);
    this.register(FieldType.Radio, CheckboxFieldComponent);
    this.register(FieldType.Date, DateFieldComponent);
    this.register(FieldType.Custom, CustomFieldComponent);
  }

  register(type: string, component: React.ComponentType<any>): void {
    this.components.set(type, component);
  }

  get(type: string): React.ComponentType<any> | undefined {
    return this.components.get(type);
  }
}
