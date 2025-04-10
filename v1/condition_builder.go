package smartform

// ConditionBuilder provides a fluent API for creating conditions
type ConditionBuilder struct {
	condition *Condition
}

// When creates a simple condition
func When(field string) *ConditionBuilder {
	return &ConditionBuilder{
		condition: &Condition{
			Type:  ConditionTypeSimple,
			Field: field,
		},
	}
}

// Equals sets the condition to check equality
func (cb *ConditionBuilder) Equals(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "eq"
	cb.condition.Value = value
	return cb
}

// NotEquals sets the condition to check inequality
func (cb *ConditionBuilder) NotEquals(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "neq"
	cb.condition.Value = value
	return cb
}

// GreaterThan sets the condition to check if value is greater than
func (cb *ConditionBuilder) GreaterThan(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "gt"
	cb.condition.Value = value
	return cb
}

// GreaterThanOrEquals sets the condition to check if value is greater than or equal
func (cb *ConditionBuilder) GreaterThanOrEquals(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "gte"
	cb.condition.Value = value
	return cb
}

// LessThan sets the condition to check if value is less than
func (cb *ConditionBuilder) LessThan(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "lt"
	cb.condition.Value = value
	return cb
}

// LessThanOrEquals sets the condition to check if value is less than or equal
func (cb *ConditionBuilder) LessThanOrEquals(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "lte"
	cb.condition.Value = value
	return cb
}

// Contains sets the condition to check if value contains substring
func (cb *ConditionBuilder) Contains(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "contains"
	cb.condition.Value = value
	return cb
}

// StartsWith sets the condition to check if value starts with substring
func (cb *ConditionBuilder) StartsWith(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "startsWith"
	cb.condition.Value = value
	return cb
}

// EndsWith sets the condition to check if value ends with substring
func (cb *ConditionBuilder) EndsWith(value interface{}) *ConditionBuilder {
	cb.condition.Operator = "endsWith"
	cb.condition.Value = value
	return cb
}

// Exists creates a condition that checks if field exists and is not empty
func Exists(field string) *ConditionBuilder {
	return &ConditionBuilder{
		condition: &Condition{
			Type:  ConditionTypeExists,
			Field: field,
		},
	}
}

// And creates a condition that requires all sub-conditions to be true
func And(conditions ...*Condition) *ConditionBuilder {
	return &ConditionBuilder{
		condition: &Condition{
			Type:       ConditionTypeAnd,
			Conditions: conditions,
		},
	}
}

// Or creates a condition that requires any sub-condition to be true
func Or(conditions ...*Condition) *ConditionBuilder {
	return &ConditionBuilder{
		condition: &Condition{
			Type:       ConditionTypeOr,
			Conditions: conditions,
		},
	}
}

// Not creates a condition that negates another condition
func Not(condition *Condition) *ConditionBuilder {
	return &ConditionBuilder{
		condition: &Condition{
			Type:       ConditionTypeNot,
			Conditions: []*Condition{condition},
		},
	}
}

// WithExpression creates a condition based on a custom expression
func WithExpression(expression string) *ConditionBuilder {
	return &ConditionBuilder{
		condition: &Condition{
			Type:       ConditionTypeExpression,
			Expression: expression,
		},
	}
}

// AddCondition adds a sub-condition to an AND or OR condition
func (cb *ConditionBuilder) AddCondition(condition *Condition) *ConditionBuilder {
	if cb.condition.Type == ConditionTypeAnd || cb.condition.Type == ConditionTypeOr {
		cb.condition.Conditions = append(cb.condition.Conditions, condition)
	}
	return cb
}

// Build finalizes and returns the condition
func (cb *ConditionBuilder) Build() *Condition {
	return cb.condition
}
