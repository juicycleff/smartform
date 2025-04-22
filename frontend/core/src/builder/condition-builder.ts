import { Condition, ConditionType } from "../types";

/**
 * Creates a simple condition that checks equality
 */
export function when(field: string): ConditionBuilder {
  return new ConditionBuilder({
    type: ConditionType.SIMPLE,
    field,
  });
}

/**
 * Creates a condition that checks if a field exists
 */
export function exists(field: string): Condition {
  return {
    type: ConditionType.EXISTS,
    field,
  };
}

/**
 * Creates a condition that requires all sub-conditions to be true
 */
export function and(conditions: Condition[]): Condition {
  return {
    type: ConditionType.AND,
    conditions,
  };
}

/**
 * Creates a condition that requires any sub-condition to be true
 */
export function or(conditions: Condition[]): Condition {
  return {
    type: ConditionType.OR,
    conditions,
  };
}

/**
 * Creates a condition that negates another condition
 */
export function not(condition: Condition): Condition {
  return {
    type: ConditionType.NOT,
    conditions: [condition],
  };
}

/**
 * Creates a condition based on a custom expression
 */
export function withExpression(expression: string): Condition {
  return {
    type: ConditionType.EXPRESSION,
    expression,
  };
}

/**
 * Builder for creating conditions
 */
export class ConditionBuilder {
  private condition: Condition;

  constructor(condition: Condition) {
    this.condition = condition;
  }

  /**
   * Sets the condition to check equality
   */
  public equals(value: any): ConditionBuilder {
    this.condition.operator = "eq";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check inequality
   */
  public notEquals(value: any): ConditionBuilder {
    this.condition.operator = "neq";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value is greater than
   */
  public greaterThan(value: any): ConditionBuilder {
    this.condition.operator = "gt";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value is greater than or equal
   */
  public greaterThanOrEquals(value: any): ConditionBuilder {
    this.condition.operator = "gte";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value is less than
   */
  public lessThan(value: any): ConditionBuilder {
    this.condition.operator = "lt";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value is less than or equal
   */
  public lessThanOrEquals(value: any): ConditionBuilder {
    this.condition.operator = "lte";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value contains substring
   */
  public contains(value: any): ConditionBuilder {
    this.condition.operator = "contains";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value starts with substring
   */
  public startsWith(value: any): ConditionBuilder {
    this.condition.operator = "startsWith";
    this.condition.value = value;
    return this;
  }

  /**
   * Sets the condition to check if value ends with substring
   */
  public endsWith(value: any): ConditionBuilder {
    this.condition.operator = "endsWith";
    this.condition.value = value;
    return this;
  }

  /**
   * Builds and returns the condition
   */
  public build(): Condition {
    return this.condition;
  }
}
