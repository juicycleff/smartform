import { type Condition, ConditionType } from "./types";

/**
 * ConditionBuilder provides a fluent API for creating conditions
 */
export class ConditionBuilder {
  condition: Condition;

  /**
   * Creates a new condition builder with an existing condition
   * @param condition Initial condition
   */
  constructor(condition: Condition) {
    this.condition = condition;
  }

  /**
   * Creates a simple condition that checks a field
   * @param field Field to check
   */
  static when(field: string): ConditionBuilder {
    return new ConditionBuilder({
      type: ConditionType.Simple,
      field,
    });
  }

  /**
   * Sets the condition to check equality
   * @param value Value to compare with
   */
  equals(value: any): ConditionBuilder {
    this.condition.operator = "eq";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check inequality
   * @param value Value to compare with
   */
  notEquals(value: any): ConditionBuilder {
    this.condition.operator = "neq";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value is greater than
   * @param value Value to compare with
   */
  greaterThan(value: any): ConditionBuilder {
    this.condition.operator = "gt";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value is greater than or equal
   * @param value Value to compare with
   */
  greaterThanOrEquals(value: any): ConditionBuilder {
    this.condition.operator = "gte";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value is less than
   * @param value Value to compare with
   */
  lessThan(value: any): ConditionBuilder {
    this.condition.operator = "lt";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value is less than or equal
   * @param value Value to compare with
   */
  lessThanOrEquals(value: any): ConditionBuilder {
    this.condition.operator = "lte";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value contains substring
   * @param value Substring to search for
   */
  contains(value: string): ConditionBuilder {
    this.condition.operator = "contains";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value starts with substring
   * @param value Substring to search for
   */
  startsWith(value: string): ConditionBuilder {
    this.condition.operator = "startsWith";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value ends with substring
   * @param value Substring to search for
   */
  endsWith(value: string): ConditionBuilder {
    this.condition.operator = "endsWith";
    this.condition.value = value;
    return this;
  }

  /**
   * Creates a condition that checks if field exists and is not empty
   * @param field Field to check
   */
  static exists(field: string): ConditionBuilder {
    return new ConditionBuilder({
      type: ConditionType.Exists,
      field,
    });
  }

  /**
   * Creates a condition that requires all sub-conditions to be true
   * @param conditions Sub-conditions
   */
  static and(...conditions: Condition[]): ConditionBuilder {
    return new ConditionBuilder({
      type: ConditionType.And,
      conditions,
    });
  }

  /**
   * Creates a condition that requires any sub-condition to be true
   * @param conditions Sub-conditions
   */
  static or(...conditions: Condition[]): ConditionBuilder {
    return new ConditionBuilder({
      type: ConditionType.Or,
      conditions,
    });
  }

  /**
   * Creates a condition that negates another condition
   * @param condition Condition to negate
   */
  static not(condition: Condition): ConditionBuilder {
    return new ConditionBuilder({
      type: ConditionType.Not,
      conditions: [condition],
    });
  }

  /**
   * Creates a condition based on a custom expression
   * @param expression Custom expression
   */
  static withExpression(expression: string): ConditionBuilder {
    return new ConditionBuilder({
      type: ConditionType.Expression,
      expression,
    });
  }

  /**
   * Adds a sub-condition to an AND or OR condition
   * @param condition Condition to add
   */
  addCondition(condition: Condition): ConditionBuilder {
    if (
      this.condition.type === ConditionType.And ||
      this.condition.type === ConditionType.Or
    ) {
      if (!this.condition.conditions) {
        this.condition.conditions = [];
      }
      this.condition.conditions.push(condition);
    }
    return this;
  }

  /**
   * Finalizes and returns the condition
   */
  build(): Condition {
    return this.condition;
  }
}
