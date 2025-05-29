package smartform

import (
	"testing"
	"time"

	"github.com/juicycleff/smartform/v1/template"
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

func TestConditionEvaluator_TemplateIntegration(t *testing.T) {
	evaluator := NewConditionEvaluator()
	templateEngine := template.NewTemplateEngine()
	evaluator.SetTemplateEngine(templateEngine)

	// Register some variables in the template engine
	templateEngine.GetVariableRegistry().RegisterVariable("user", map[string]interface{}{
		"name":    "John",
		"age":     25,
		"premium": true,
		"balance": 150.50,
	})

	templateEngine.GetVariableRegistry().RegisterVariable("config", map[string]interface{}{
		"minAge":       18,
		"premiumBonus": 10.0,
	})

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
		wantError bool
	}{
		{
			name: "Simple template field reference",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "${user.name}",
				Operator: "eq",
				Value:    "John",
			},
			context:  NewEvaluationContext(),
			expected: true,
		},
		{
			name: "Template field with template value",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "${user.age}",
				Operator: "gte",
				Value:    "${config.minAge}",
			},
			context:  NewEvaluationContext(),
			expected: true,
		},
		{
			name: "Complex template expression condition",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "${user.premium}",
			},
			context:  NewEvaluationContext(),
			expected: true,
		},
		{
			name: "Template field with context override",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "${user.name}",
				Operator: "eq",
				Value:    "Alice",
			},
			context: func() *EvaluationContext {
				ctx := NewEvaluationContext()
				ctx.AddField("user", map[string]interface{}{
					"name": "Alice",
				})
				return ctx
			}(),
			expected: true,
		},
		{
			name: "Non-template field lookup",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "simple_field",
				Operator: "eq",
				Value:    "test_value",
			},
			context: func() *EvaluationContext {
				ctx := NewEvaluationContext()
				ctx.AddField("simple_field", "test_value")
				return ctx
			}(),
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

func TestTemplateConditionBuilder(t *testing.T) {
	evaluator := NewConditionEvaluator()
	templateEngine := template.NewTemplateEngine()
	evaluator.SetTemplateEngine(templateEngine)

	builder := NewTemplateConditionBuilder(evaluator)

	// Register test data
	templateEngine.GetVariableRegistry().RegisterVariable("user", map[string]interface{}{
		"age":     30,
		"role":    "admin",
		"active":  true,
		"balance": 100.0,
	})

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
	}{
		{
			name:      "Simple condition via builder",
			condition: builder.SimpleCondition("${user.age}", "gt", 18),
			context:   NewEvaluationContext(),
			expected:  true,
		},
		{
			name:      "Template condition via builder",
			condition: builder.TemplateCondition("user.role", "eq", "admin"),
			context:   NewEvaluationContext(),
			expected:  true,
		},
		{
			name:      "Expression condition via builder",
			condition: builder.ExpressionCondition("${user.active}"),
			context:   NewEvaluationContext(),
			expected:  true,
		},
		{
			name: "Complex AND condition",
			condition: builder.And(
				builder.SimpleCondition("${user.age}", "gte", 18),
				builder.SimpleCondition("${user.role}", "eq", "admin"),
				builder.ExpressionCondition("${user.active}"),
			),
			context:  NewEvaluationContext(),
			expected: true,
		},
		{
			name: "Complex OR condition",
			condition: builder.Or(
				builder.SimpleCondition("${user.role}", "eq", "admin"),
				builder.SimpleCondition("${user.balance}", "gt", 1000),
			),
			context:  NewEvaluationContext(),
			expected: true,
		},
		{
			name: "NOT condition",
			condition: builder.Not(
				builder.SimpleCondition("${user.role}", "eq", "guest"),
			),
			context:  NewEvaluationContext(),
			expected: true,
		},
		{
			name:      "EXISTS condition",
			condition: builder.Exists("${user.age}"),
			context:   NewEvaluationContext(),
			expected:  true,
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

func TestConditionEvaluator_WithoutTemplateEngine(t *testing.T) {
	evaluator := NewConditionEvaluator()
	// Don't set template engine - should fall back to direct field lookup

	tests := []struct {
		name      string
		condition *Condition
		context   *EvaluationContext
		expected  bool
		wantError bool
	}{
		{
			name: "Direct field lookup without template engine",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "name",
				Operator: "eq",
				Value:    "John",
			},
			context: func() *EvaluationContext {
				ctx := NewEvaluationContext()
				ctx.AddField("name", "John")
				return ctx
			}(),
			expected: true,
		},
		{
			name: "Simple expression without template engine",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "true",
			},
			context:  NewEvaluationContext(),
			expected: true,
		},
		{
			name: "Template syntax fails gracefully without engine",
			condition: &Condition{
				Type:     ConditionTypeSimple,
				Field:    "${user.name}",
				Operator: "eq",
				Value:    "John",
			},
			context:   NewEvaluationContext(),
			expected:  false,
			wantError: false, // Should not error, just return false for missing field
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

func TestEvaluationContext_Methods(t *testing.T) {
	ctx := NewEvaluationContext()

	// Test AddField
	ctx.AddField("name", "John")
	ctx.AddField("age", 30)

	if ctx.Fields["name"] != "John" {
		t.Errorf("Expected name to be 'John', got %v", ctx.Fields["name"])
	}

	if ctx.TemplateContext["name"] != "John" {
		t.Errorf("Expected template context name to be 'John', got %v", ctx.TemplateContext["name"])
	}

	// Test AddMeta
	ctx.AddMeta("timestamp", time.Now())
	ctx.AddMeta("user_id", 123)

	if ctx.Meta["timestamp"] == nil {
		t.Error("Expected timestamp in meta")
	}

	if ctx.TemplateContext["_meta_user_id"] != 123 {
		t.Errorf("Expected meta user_id to be 123, got %v", ctx.TemplateContext["_meta_user_id"])
	}

	// Test MergeFields
	additionalFields := map[string]interface{}{
		"email":   "john@example.com",
		"premium": true,
	}
	ctx.MergeFields(additionalFields)

	if ctx.Fields["email"] != "john@example.com" {
		t.Errorf("Expected email to be 'john@example.com', got %v", ctx.Fields["email"])
	}

	if ctx.TemplateContext["premium"] != true {
		t.Errorf("Expected premium to be true, got %v", ctx.TemplateContext["premium"])
	}
}

func TestConditionEvaluator_CaseSensitivity(t *testing.T) {
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

	ctx := NewEvaluationContext()
	ctx.AddField("name", "john")

	// Case sensitive should return false
	result, err := caseSensitive.Evaluate(condition, ctx)
	if err != nil {
		t.Errorf("Case sensitive evaluation error: %v", err)
	}
	if result {
		t.Error("Case sensitive evaluation should return false for 'john' vs 'JOHN'")
	}

	// Case insensitive should return true
	result, err = caseInsensitive.Evaluate(condition, ctx)
	if err != nil {
		t.Errorf("Case insensitive evaluation error: %v", err)
	}
	if !result {
		t.Error("Case insensitive evaluation should return true for 'john' vs 'JOHN'")
	}
}

func TestConditionEvaluator_ToBool(t *testing.T) {
	evaluator := NewConditionEvaluator()

	tests := []struct {
		input    interface{}
		expected bool
	}{
		{nil, false},
		{true, true},
		{false, false},
		{0, false},
		{1, true},
		{-1, true},
		{0.0, false},
		{1.5, true},
		{"", false},
		{"test", true},
		{[]interface{}{}, false},
		{[]interface{}{1, 2}, true},
		{map[string]interface{}{}, false},
		{map[string]interface{}{"key": "value"}, true},
	}

	for _, test := range tests {
		result := evaluator.toBool(test.input)
		if result != test.expected {
			t.Errorf("toBool(%v) = %v, expected %v", test.input, result, test.expected)
		}
	}
}

// Integration test demonstrating real-world usage
func TestConditionEvaluator_RealWorldScenario(t *testing.T) {
	evaluator := NewConditionEvaluator()
	templateEngine := template.NewTemplateEngine()
	evaluator.SetTemplateEngine(templateEngine)
	builder := NewTemplateConditionBuilder(evaluator)

	// Setup application state in template engine
	templateEngine.GetVariableRegistry().RegisterVariable("user", map[string]interface{}{
		"id":        123,
		"email":     "admin@example.com",
		"role":      "admin",
		"age":       28,
		"premium":   true,
		"balance":   250.75,
		"lastLogin": time.Now().AddDate(0, 0, -1), // Yesterday
	})

	templateEngine.GetVariableRegistry().RegisterVariable("config", map[string]interface{}{
		"minAge":           18,
		"premiumThreshold": 100.0,
		"adminRoles":       []string{"admin", "moderator", "superuser"},
	})

	// Test complex business rules
	tests := []struct {
		name        string
		description string
		condition   *Condition
		expected    bool
	}{
		{
			name:        "Admin Access Rule",
			description: "User must be admin and over 18",
			condition: builder.And(
				builder.SimpleCondition("${user.role}", "eq", "admin"),
				builder.SimpleCondition("${user.age}", "gte", "${config.minAge}"),
			),
			expected: true,
		},
		{
			name:        "Premium Feature Access",
			description: "User must be premium OR have high balance",
			condition: builder.Or(
				builder.ExpressionCondition("${user.premium}"),
				builder.SimpleCondition("${user.balance}", "gt", "${config.premiumThreshold}"),
			),
			expected: true,
		},
		{
			name:        "Account Security Check",
			description: "User must be active (not guest) and have recent login",
			condition: builder.And(
				builder.Not(builder.SimpleCondition("${user.role}", "eq", "guest")),
				builder.Exists("${user.lastLogin}"),
			),
			expected: true,
		},
		{
			name:        "Email Validation",
			description: "User email must contain @ and be from allowed domain",
			condition: builder.And(
				builder.SimpleCondition("${user.email}", "contains", "@"),
				builder.SimpleCondition("${user.email}", "ends_with", ".com"),
			),
			expected: true,
		},
	}

	ctx := NewEvaluationContext()

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result, err := evaluator.Evaluate(test.condition, ctx)
			if err != nil {
				t.Errorf("Evaluate() error = %v", err)
				return
			}
			if result != test.expected {
				t.Errorf("%s failed: got %v, expected %v", test.description, result, test.expected)
			}
		})
	}
}

func BenchmarkConditionEvaluator_TemplateIntegration(b *testing.B) {
	evaluator := NewConditionEvaluator()
	templateEngine := template.NewTemplateEngine()
	evaluator.SetTemplateEngine(templateEngine)

	templateEngine.GetVariableRegistry().RegisterVariable("user", map[string]interface{}{
		"age":  25,
		"role": "admin",
	})

	condition := &Condition{
		Type: ConditionTypeAnd,
		Conditions: []*Condition{
			{Type: ConditionTypeSimple, Field: "${user.age}", Operator: "gte", Value: 18},
			{Type: ConditionTypeSimple, Field: "${user.role}", Operator: "eq", Value: "admin"},
		},
	}

	ctx := NewEvaluationContext()

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = evaluator.Evaluate(condition, ctx)
	}
}
