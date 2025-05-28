package smartform

import (
	"testing"
	"time"
)

func TestConditionEvaluator_SimpleConditions(t *testing.T) {
	evaluator := NewConditionEvaluator()

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
		wantError bool
	}{
		{
			name: "simple equality - true",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "name",
				Operator: "eq",
				Value:    "John",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"name": "John",
				},
			},
			expected: true,
		},
		{
			name: "simple equality - false",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "name",
				Operator: "eq",
				Value:    "Jane",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"name": "John",
				},
			},
			expected: false,
		},
		{
			name: "numeric comparison - greater than",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "age",
				Operator: "gt",
				Value:    18,
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"age": 25,
				},
			},
			expected: true,
		},
		{
			name: "string contains",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "email",
				Operator: "contains",
				Value:    "@example.com",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"email": "user@example.com",
				},
			},
			expected: true,
		},
		{
			name: "field in array",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "role",
				Operator: "in",
				Value:    []string{"admin", "user", "moderator"},
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"role": "admin",
				},
			},
			expected: true,
		},
		{
			name: "missing field with neq operator",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "missing_field",
				Operator: "neq",
				Value:    "some_value",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{},
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := evaluator.Evaluate(tt.condition, tt.context)
			if (err != nil) != tt.wantError {
				t.Errorf("Evaluate() error = %v, wantError %v", err, tt.wantError)
				return
			}
			if result != tt.expected {
				t.Errorf("Evaluate() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestConditionEvaluator_LogicalConditions(t *testing.T) {
	evaluator := NewConditionEvaluator()

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
	}{
		{
			name: "AND condition - all true",
			condition: &Condition{
				Type: ConditionTypeAnd,
				Conditions: []*Condition{
					{
						Type:     ConditionTypeSimple,
						Field:    "age",
						Operator: "gte",
						Value:    18,
					},
					{
						Type:     ConditionTypeSimple,
						Field:    "role",
						Operator: "eq",
						Value:    "admin",
					},
				},
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"age":  25,
					"role": "admin",
				},
			},
			expected: true,
		},
		{
			name: "AND condition - one false",
			condition: &Condition{
				Type: ConditionTypeAnd,
				Conditions: []*Condition{
					{
						Type:     ConditionTypeSimple,
						Field:    "age",
						Operator: "gte",
						Value:    18,
					},
					{
						Type:     ConditionTypeSimple,
						Field:    "role",
						Operator: "eq",
						Value:    "admin",
					},
				},
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"age":  25,
					"role": "user",
				},
			},
			expected: false,
		},
		{
			name: "OR condition - one true",
			condition: &Condition{
				Type: ConditionTypeOr,
				Conditions: []*Condition{
					{
						Type:     ConditionTypeSimple,
						Field:    "role",
						Operator: "eq",
						Value:    "admin",
					},
					{
						Type:     ConditionTypeSimple,
						Field:    "role",
						Operator: "eq",
						Value:    "moderator",
					},
				},
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"role": "admin",
				},
			},
			expected: true,
		},
		{
			name: "NOT condition",
			condition: &Condition{
				Type: ConditionTypeNot,
				Conditions: []*Condition{
					{
						Type:     ConditionTypeSimple,
						Field:    "banned",
						Operator: "eq",
						Value:    true,
					},
				},
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"banned": false,
				},
			},
			expected: true,
		},
		{
			name: "nested conditions",
			condition: &Condition{
				Type: ConditionTypeAnd,
				Conditions: []*Condition{
					{
						Type:     ConditionTypeSimple,
						Field:    "active",
						Operator: "eq",
						Value:    true,
					},
					{
						Type: ConditionTypeOr,
						Conditions: []*Condition{
							{
								Type:     ConditionTypeSimple,
								Field:    "role",
								Operator: "eq",
								Value:    "admin",
							},
							{
								Type:     ConditionTypeSimple,
								Field:    "permissions",
								Operator: "contains",
								Value:    "write",
							},
						},
					},
				},
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"active":      true,
					"role":        "user",
					"permissions": "read,write,delete",
				},
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := evaluator.Evaluate(tt.condition, tt.context)
			if err != nil {
				t.Errorf("Evaluate() error = %v", err)
				return
			}
			if result != tt.expected {
				t.Errorf("Evaluate() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestConditionEvaluator_ExistsConditions(t *testing.T) {
	evaluator := NewConditionEvaluator()

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
	}{
		{
			name: "field exists and not empty",
			condition: &Condition{
				Type:  ConditionTypeExists,
				Field: "name",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"name": "John",
				},
			},
			expected: true,
		},
		{
			name: "field exists but empty string",
			condition: &Condition{
				Type:  ConditionTypeExists,
				Field: "name",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"name": "",
				},
			},
			expected: false,
		},
		{
			name: "field does not exist",
			condition: &Condition{
				Type:  ConditionTypeExists,
				Field: "name",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{},
			},
			expected: false,
		},
		{
			name: "field exists but nil",
			condition: &Condition{
				Type:  ConditionTypeExists,
				Field: "name",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"name": nil,
				},
			},
			expected: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := evaluator.Evaluate(tt.condition, tt.context)
			if err != nil {
				t.Errorf("Evaluate() error = %v", err)
				return
			}
			if result != tt.expected {
				t.Errorf("Evaluate() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestConditionEvaluator_TimeComparisons(t *testing.T) {
	evaluator := NewConditionEvaluator()

	now := time.Now()
	yesterday := now.AddDate(0, 0, -1)
	tomorrow := now.AddDate(0, 0, 1)

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
	}{
		{
			name: "time greater than",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "created_at",
				Operator: "gt",
				Value:    yesterday,
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"created_at": now,
				},
			},
			expected: true,
		},
		{
			name: "time less than",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "expires_at",
				Operator: "lt",
				Value:    tomorrow,
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"expires_at": now,
				},
			},
			expected: true,
		},
		{
			name: "time string comparison",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "date",
				Operator: "eq",
				Value:    "2024-01-01",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"date": "2024-01-01",
				},
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := evaluator.Evaluate(tt.condition, tt.context)
			if err != nil {
				t.Errorf("Evaluate() error = %v", err)
				return
			}
			if result != tt.expected {
				t.Errorf("Evaluate() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestConditionEvaluator_RegexConditions(t *testing.T) {
	evaluator := NewConditionEvaluator()

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
		wantError bool
	}{
		{
			name: "valid email regex",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "email",
				Operator: "regex",
				Value:    `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"email": "user@example.com",
				},
			},
			expected: true,
		},
		{
			name: "invalid email regex",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "email",
				Operator: "regex",
				Value:    `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"email": "invalid-email",
				},
			},
			expected: false,
		},
		{
			name: "invalid regex pattern",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "text",
				Operator: "regex",
				Value:    `[unclosed`,
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"text": "test",
				},
			},
			expected:  false,
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := evaluator.Evaluate(tt.condition, tt.context)
			if (err != nil) != tt.wantError {
				t.Errorf("Evaluate() error = %v, wantError %v", err, tt.wantError)
				return
			}
			if !tt.wantError && result != tt.expected {
				t.Errorf("Evaluate() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestConditionEvaluator_ExpressionConditions(t *testing.T) {
	evaluator := NewConditionEvaluator()

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
	}{
		{
			name: "simple true expression",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "true",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{},
			},
			expected: true,
		},
		{
			name: "simple false expression",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "false",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{},
			},
			expected: false,
		},
		{
			name: "field reference expression",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "${active}",
			},
			context: &EvaluationContext{
				Fields: map[string]interface{}{
					"active": "true",
				},
			},
			expected: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := evaluator.Evaluate(tt.condition, tt.context)
			if err != nil {
				t.Errorf("Evaluate() error = %v", err)
				return
			}
			if result != tt.expected {
				t.Errorf("Evaluate() = %v, expected %v", result, tt.expected)
			}
		})
	}
}

func TestConditionEvaluator_CaseSensitive(t *testing.T) {
	caseSensitive := NewConditionEvaluator()
	caseSensitive.CaseSensitive = true

	caseInsensitive := NewConditionEvaluator()
	caseInsensitive.CaseSensitive = false

	condition := &Condition{
		Type:     ConditionTypeSimple,
		Field:    "name",
		Operator: "eq",
		Value:    "JOHN",
	}

	context := &EvaluationContext{
		Fields: map[string]interface{}{
			"name": "john",
		},
	}

	// Case sensitive should return false
	result, err := caseSensitive.Evaluate(condition, context)
	if err != nil {
		t.Errorf("Case sensitive evaluation error: %v", err)
	}
	if result {
		t.Error("Case sensitive evaluation should return false for 'john' vs 'JOHN'")
	}

	// Case insensitive should return true
	result, err = caseInsensitive.Evaluate(condition, context)
	if err != nil {
		t.Errorf("Case insensitive evaluation error: %v", err)
	}
	if !result {
		t.Error("Case insensitive evaluation should return true for 'john' vs 'JOHN'")
	}
}

func TestConditionEvaluator_Validation(t *testing.T) {
	evaluator := NewConditionEvaluator()

	tests := []struct {
		name      string
		condition *Condition
		wantError bool
	}{
		{
			name: "valid simple condition",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "name",
				Operator: "eq",
				Value:    "John",
			},
			wantError: false,
		},
		{
			name: "simple condition missing field",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Operator: "eq",
				Value:    "John",
			},
			wantError: true,
		},
		{
			name: "simple condition missing operator",
			condition: &Condition{
				Type:  ConditionTypeSimple,
				Field: "name",
				Value: "John",
			},
			wantError: true,
		},
		{
			name: "AND condition with no sub-conditions",
			condition: &Condition{
				Type:       ConditionTypeAnd,
				Conditions: []*Condition{},
			},
			wantError: true,
		},
		{
			name: "NOT condition with multiple sub-conditions",
			condition: &Condition{
				Type: ConditionTypeNot,
				Conditions: []*Condition{
					{Type: ConditionTypeSimple, Field: "a", Operator: "eq", Value: "1"},
					{Type: ConditionTypeSimple, Field: "b", Operator: "eq", Value: "2"},
				},
			},
			wantError: true,
		},
		{
			name: "exists condition missing field",
			condition: &Condition{
				Type: ConditionTypeExists,
			},
			wantError: true,
		},
		{
			name: "expression condition missing expression",
			condition: &Condition{
				Type: ConditionTypeExpression,
			},
			wantError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := evaluator.Validate(tt.condition)
			if (err != nil) != tt.wantError {
				t.Errorf("Validate() error = %v, wantError %v", err, tt.wantError)
			}
		})
	}
}

// Benchmark tests
func BenchmarkConditionEvaluator_SimpleCondition(b *testing.B) {
	evaluator := NewConditionEvaluator()
	condition := &Condition{
		Type:     ConditionTypeSimple,
		Field:    "age",
		Operator: "gt",
		Value:    18,
	}
	context := &EvaluationContext{
		Fields: map[string]interface{}{
			"age": 25,
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = evaluator.Evaluate(condition, context)
	}
}

func BenchmarkConditionEvaluator_ComplexCondition(b *testing.B) {
	evaluator := NewConditionEvaluator()
	condition := &Condition{
		Type: ConditionTypeAnd,
		Conditions: []*Condition{
			{Type: ConditionTypeSimple, Field: "age", Operator: "gte", Value: 18},
			{
				Type: ConditionTypeOr,
				Conditions: []*Condition{
					{Type: ConditionTypeSimple, Field: "role", Operator: "eq", Value: "admin"},
					{Type: ConditionTypeSimple, Field: "permissions", Operator: "contains", Value: "write"},
				},
			},
			{Type: ConditionTypeExists, Field: "email"},
		},
	}
	context := &EvaluationContext{
		Fields: map[string]interface{}{
			"age":         25,
			"role":        "user",
			"permissions": "read,write,delete",
			"email":       "user@example.com",
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = evaluator.Evaluate(condition, context)
	}
}

// Example usage
func ExampleConditionEvaluator() {
	evaluator := NewConditionEvaluator()

	// Create a complex condition: user must be an adult admin or have write permissions
	condition := &Condition{
		Type: ConditionTypeAnd,
		Conditions: []*Condition{
			{
				Type:     ConditionTypeSimple,
				Field:    "age",
				Operator: "gte",
				Value:    18,
			},
			{
				Type: ConditionTypeOr,
				Conditions: []*Condition{
					{
						Type:     ConditionTypeSimple,
						Field:    "role",
						Operator: "eq",
						Value:    "admin",
					},
					{
						Type:     ConditionTypeSimple,
						Field:    "permissions",
						Operator: "contains",
						Value:    "write",
					},
				},
			},
		},
	}

	// Test with user data
	context := &EvaluationContext{
		Fields: map[string]interface{}{
			"age":         25,
			"role":        "user",
			"permissions": "read,write",
		},
	}

	result, err := evaluator.Evaluate(condition, context)
	if err != nil {
		panic(err)
	}

	if result {
		println("User meets the conditions!")
	} else {
		println("User does not meet the conditions.")
	}
}
