import { Condition, FieldType } from "../../types";
import { FieldBuilder } from "../field-builder";

/**
 * Branch field builder for creating workflow branch fields
 */
export class BranchFieldBuilder extends FieldBuilder {
  constructor(id: string, label: string) {
    super(id, FieldType.BRANCH, label);
  }

  /**
   * Set the branch condition
   */
  public condition(condition: Condition): BranchFieldBuilder {
    this.property("condition", condition);
    return this;
  }

  /**
   * Set the form to show when condition is true
   */
  public trueBranch(formId: string): BranchFieldBuilder {
    this.property("trueBranch", formId);
    return this;
  }

  /**
   * Set the form to show when condition is false
   */
  public falseBranch(formId: string): BranchFieldBuilder {
    this.property("falseBranch", formId);
    return this;
  }
}
