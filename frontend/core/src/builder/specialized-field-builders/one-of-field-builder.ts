import { Field, FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";
import { GroupFieldBuilder } from "./group-field-builder";

/**
 * OneOf field builder for creating fields with mutual exclusivity
 */
export class OneOfFieldBuilder extends FieldBuilder {
  constructor(id: string, label: string) {
    super(id, FieldType.ONE_OF, label);
    // Initialize nested field array
    this.buildTarget.nested = [];
  }

  /**
   * Add an option to the oneOf field
   */
  public addOption(field: Field): OneOfFieldBuilder {
    if (!this.buildTarget.nested) {
      this.buildTarget.nested = [];
    }
    this.buildTarget.nested.push(field);
    return this;
  }

  /**
   * Add a group option to the oneOf field
   */
  public groupOption(id: string, label: string): GroupFieldBuilder {
    const group = new GroupFieldBuilder(id, label);
    this.addOption(group.build());
    return group;
  }
}
