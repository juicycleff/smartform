import { Field, FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";
import { GroupFieldBuilder } from "./group-field-builder";

/**
 * AnyOf field builder for creating fields with multiple optional selections
 */
export class AnyOfFieldBuilder extends FieldBuilder {
  constructor(id: string, label: string) {
    super(id, FieldType.ANY_OF, label);
    // Initialize nested field array
    this.buildTarget.nested = [];
  }

  /**
   * Add an option to the anyOf field
   */
  public addOption(field: Field): AnyOfFieldBuilder {
    if (!this.buildTarget.nested) {
      this.buildTarget.nested = [];
    }
    this.buildTarget.nested.push(field);
    return this;
  }

  /**
   * Add a group option to the anyOf field
   */
  public groupOption(id: string, label: string): GroupFieldBuilder {
    const group = new GroupFieldBuilder(id, label);
    this.addOption(group.build());
    return group;
  }
}
