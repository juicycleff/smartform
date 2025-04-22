import { FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";

/**
 * Custom field builder for creating custom component fields
 */
export class CustomFieldBuilder extends FieldBuilder {
  constructor(id: string, label: string) {
    super(id, FieldType.CUSTOM, label);
  }

  /**
   * Set the custom component name
   */
  public componentName(name: string): CustomFieldBuilder {
    this.property("componentName", name);
    return this;
  }

  /**
   * Set the custom component props
   */
  public componentProps(props: Record<string, any>): CustomFieldBuilder {
    this.property("componentProps", props);
    return this;
  }
}
