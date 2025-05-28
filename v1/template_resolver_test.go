package smartform

import (
	"fmt"
	"testing"
)

func TestTemplateResolver_ResolveFormData(t *testing.T) {
	// Create a form schema with variables
	schema := NewFormSchema("test", "Test Form")
	schema.RegisterVariable("user", map[string]interface{}{
		"name": "John Doe",
		"age":  30,
	})
	schema.RegisterVariable("company", "TechCorp")

	resolver := schema.GetTemplateResolver()

	tests := []struct {
		name     string
		input    map[string]interface{}
		expected map[string]interface{}
	}{
		{
			name: "simple variable resolution",
			input: map[string]interface{}{
				"greeting": "${user.name}",
				"company":  "${company}",
			},
			expected: map[string]interface{}{
				"greeting": "John Doe",
				"company":  "TechCorp",
			},
		},
		{
			name: "function resolution",
			input: map[string]interface{}{
				"formatted":  "${format('Hello %s', user.name)}",
				"calculated": "${add(user.age, 10)}",
			},
			expected: map[string]interface{}{
				"formatted":  "Hello John Doe",
				"calculated": float64(40),
			},
		},
		{
			name: "nested object resolution",
			input: map[string]interface{}{
				"nested": map[string]interface{}{
					"field1": "${user.name}",
					"field2": "${company}",
				},
			},
			expected: map[string]interface{}{
				"nested": map[string]interface{}{
					"field1": "John Doe",
					"field2": "TechCorp",
				},
			},
		},
		{
			name: "array resolution",
			input: map[string]interface{}{
				"list": []interface{}{
					"${user.name}",
					"${company}",
					"static value",
				},
			},
			expected: map[string]interface{}{
				"list": []interface{}{
					"John Doe",
					"TechCorp",
					"static value",
				},
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := resolver.ResolveFormData(tt.input)

			// Compare the results
			if !deepEqual(result, tt.expected) {
				t.Errorf("ResolveFormData() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestTemplateResolver_ResolveFieldValue(t *testing.T) {
	schema := NewFormSchema("test", "Test Form")
	schema.RegisterVariable("user", map[string]interface{}{
		"name": "Alice",
		"age":  25,
	})

	resolver := schema.GetTemplateResolver()

	tests := []struct {
		name     string
		fieldID  string
		value    interface{}
		formData map[string]interface{}
		expected interface{}
		hasError bool
	}{
		{
			name:     "simple template",
			fieldID:  "test_field",
			value:    "${user.name}",
			formData: map[string]interface{}{},
			expected: "Alice",
			hasError: false,
		},
		{
			name:     "function call",
			fieldID:  "calc_field",
			value:    "${add(user.age, 5)}",
			formData: map[string]interface{}{},
			expected: float64(30),
			hasError: false,
		},
		{
			name:     "form data reference",
			fieldID:  "ref_field",
			value:    "${concat(user.name, ' - ', other_field)}",
			formData: map[string]interface{}{"other_field": "test"},
			expected: "Alice - test",
			hasError: false,
		},
		{
			name:     "non-template value",
			fieldID:  "static_field",
			value:    "static value",
			formData: map[string]interface{}{},
			expected: "static value",
			hasError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := resolver.ResolveFieldValue(tt.fieldID, tt.value, tt.formData)

			if tt.hasError && result.Error == nil {
				t.Errorf("Expected error but got none")
			}
			if !tt.hasError && result.Error != nil {
				t.Errorf("Unexpected error: %v", result.Error)
			}
			if !tt.hasError && !deepEqual(result.Value, tt.expected) {
				t.Errorf("ResolveFieldValue() = %v, want %v", result.Value, tt.expected)
			}
		})
	}
}

func TestTemplateResolver_ResolveFieldConfiguration(t *testing.T) {
	schema := NewFormSchema("test", "Test Form")
	schema.RegisterVariable("user", map[string]interface{}{
		"name": "Bob",
		"role": "admin",
	})

	resolver := schema.GetTemplateResolver()

	field := &Field{
		ID:           "test_field",
		Type:         FieldTypeText,
		Label:        "${format('Hello %s', user.name)}",
		Placeholder:  "${user.role} placeholder",
		HelpText:     "Help for ${user.name}",
		DefaultValue: "${user.name}@example.com",
	}

	formData := map[string]interface{}{}
	resolvedField := resolver.ResolveFieldConfiguration(field, formData)

	if resolvedField.Label != "Hello Bob" {
		t.Errorf("Expected label 'Hello Bob', got '%s'", resolvedField.Label)
	}
	if resolvedField.Placeholder != "admin placeholder" {
		t.Errorf("Expected placeholder 'admin placeholder', got '%s'", resolvedField.Placeholder)
	}
	if resolvedField.HelpText != "Help for Bob" {
		t.Errorf("Expected help text 'Help for Bob', got '%s'", resolvedField.HelpText)
	}
	if resolvedField.DefaultValue != "Bob@example.com" {
		t.Errorf("Expected default value 'Bob@example.com', got '%v'", resolvedField.DefaultValue)
	}
}

func TestTemplateResolver_ResolveDefaultValues(t *testing.T) {
	schema := NewFormSchema("test", "Test Form")
	schema.RegisterVariable("config", map[string]interface{}{
		"defaultName": "Default User",
		"defaultAge":  18,
	})

	// Add fields with default values
	field1 := &Field{
		ID:           "name",
		Type:         FieldTypeText,
		DefaultValue: "${config.defaultName}",
	}
	field2 := &Field{
		ID:           "age",
		Type:         FieldTypeNumber,
		DefaultValue: "${config.defaultAge}",
	}
	field3 := &Field{
		ID:           "computed",
		Type:         FieldTypeText,
		DefaultValue: "${format('%s is %d years old', config.defaultName, config.defaultAge)}",
	}

	schema.Fields = []*Field{field1, field2, field3}

	resolver := schema.GetTemplateResolver()
	formData := map[string]interface{}{}
	defaults := resolver.ResolveDefaultValues(formData)

	expected := map[string]interface{}{
		"name":     "Default User",
		"age":      float64(18),
		"computed": "Default User is 18 years old",
	}

	if !deepEqual(defaults, expected) {
		t.Errorf("ResolveDefaultValues() = %v, want %v", defaults, expected)
	}
}

func TestTemplateResolver_ResolveConditionalExpression(t *testing.T) {
	schema := NewFormSchema("test", "Test Form")
	schema.RegisterVariable("user", map[string]interface{}{
		"age":    25,
		"isVIP":  true,
		"status": "active",
	})

	resolver := schema.GetTemplateResolver()

	tests := []struct {
		name        string
		condition   *Condition
		formData    map[string]interface{}
		expected    bool
		expectError bool
	}{
		{
			name: "simple comparison",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "${gt(user.age, 18)}",
			},
			formData:    map[string]interface{}{},
			expected:    true,
			expectError: false,
		},
		{
			name: "boolean variable",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "${user.isVIP}",
			},
			formData:    map[string]interface{}{},
			expected:    true,
			expectError: false,
		},
		{
			name: "string comparison",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "${eq(user.status, 'active')}",
			},
			formData:    map[string]interface{}{},
			expected:    true,
			expectError: false,
		},
		{
			name: "complex expression",
			condition: &Condition{
				Type:       ConditionTypeExpression,
				Expression: "${and(gt(user.age, 20), user.isVIP)}",
			},
			formData:    map[string]interface{}{},
			expected:    true,
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := resolver.ResolveConditionalExpression(tt.condition, tt.formData)

			if tt.expectError && err == nil {
				t.Errorf("Expected error but got none")
			}
			if !tt.expectError && err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
			if !tt.expectError && result != tt.expected {
				t.Errorf("ResolveConditionalExpression() = %v, want %v", result, tt.expected)
			}
		})
	}
}

// func TestTemplateResolver_WithOptions(t *testing.T) {
// 	schema := NewFormSchema("test", "Test Form")
// 	schema.RegisterVariable("user", map[string]interface{}{
// 		"name": "Test User",
// 	})
//
// 	resolver := schema.GetTemplateResolver()
//
// 	// Test with strict mode
// 	strictOptions := &ResolutionOptions{
// 		StrictMode:     true,
// 		DefaultOnError: "[ERROR]",
// 	}
//
// 	// Test data with invalid variable
// 	testData := map[string]interface{}{
// 		"valid":   "${user.name}",
// 		"invalid": "${nonexistent.variable}",
// 	}
//
// 	// In strict mode, invalid variables should cause errors or use default
// 	resolved := resolver.ResolveFormData(testData, strictOptions)
//
// 	if resolved["valid"] != "Test User" {
// 		t.Errorf("Expected valid field to resolve to 'Test User', got %v", resolved["valid"])
// 	}
//
// 	// Test with lenient mode
// 	lenientOptions := &ResolutionOptions{
// 		StrictMode:     false,
// 		DefaultOnError: "[DEFAULT]",
// 	}
//
// 	resolvedLenient := resolver.ResolveFormData(testData, lenientOptions)
//
// 	if resolvedLenient["valid"] != "Test User" {
// 		t.Errorf("Expected valid field to resolve to 'Test User', got %v", resolvedLenient["valid"])
// 	}
// }

// Helper function to compare values deeply
func deepEqual(a, b interface{}) bool {
	switch va := a.(type) {
	case map[string]interface{}:
		vb, ok := b.(map[string]interface{})
		if !ok || len(va) != len(vb) {
			return false
		}
		for key, valueA := range va {
			valueB, exists := vb[key]
			if !exists || !deepEqual(valueA, valueB) {
				return false
			}
		}
		return true
	case []interface{}:
		vb, ok := b.([]interface{})
		if !ok || len(va) != len(vb) {
			return false
		}
		for i, valueA := range va {
			if !deepEqual(valueA, vb[i]) {
				return false
			}
		}
		return true
	default:
		return a == b
	}
}

// Benchmark tests
func BenchmarkTemplateResolver_ResolveFormData(b *testing.B) {
	schema := NewFormSchema("test", "Test Form")
	schema.RegisterVariable("user", map[string]interface{}{
		"name": "John Doe",
		"age":  30,
	})

	resolver := schema.GetTemplateResolver()

	testData := map[string]interface{}{
		"field1": "${user.name}",
		"field2": "${format('Hello %s', user.name)}",
		"field3": "${add(user.age, 10)}",
		"nested": map[string]interface{}{
			"subfield1": "${user.name}",
			"subfield2": "${user.age}",
		},
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		resolver.ResolveFormData(testData)
	}
}

func TestDebugOptionsResolution(t *testing.T) {
	schema := NewFormSchema("test", "Test Form")
	schema.RegisterVariable("user", map[string]interface{}{
		"name": "Test User",
	})

	resolver := schema.GetTemplateResolver()

	// Test data with invalid variable
	testData := map[string]interface{}{
		"valid":   "${user.name}",
		"invalid": "${nonexistent.variable}",
	}

	fmt.Printf("=== Debug Options Resolution ===\n")
	fmt.Printf("Test data: %+v\n", testData)
	fmt.Printf("Registered variables: %+v\n", schema.variableRegistry.GetVariables())

	// Test strict mode
	strictOptions := &ResolutionOptions{
		StrictMode:     true,
		DefaultOnError: "[ERROR]",
	}

	fmt.Printf("\n=== Testing individual resolution in strict mode ===\n")

	// Test resolving "valid" field
	validResult := resolver.ResolveFieldValue("valid", "${user.name}", testData, strictOptions)
	fmt.Printf("Field 'valid' -> Value: %v, Resolved: %v, Error: %v\n",
		validResult.Value, validResult.Resolved, validResult.Error)

	// Test resolving "invalid" field
	invalidResult := resolver.ResolveFieldValue("invalid", "${nonexistent.variable}", testData, strictOptions)
	fmt.Printf("Field 'invalid' -> Value: %v, Resolved: %v, Error: %v\n",
		invalidResult.Value, invalidResult.Resolved, invalidResult.Error)

	fmt.Printf("\n=== Testing full form resolution in strict mode ===\n")
	resolved := resolver.ResolveFormData(testData, strictOptions)
	fmt.Printf("Full resolution result: %+v\n", resolved)

	fmt.Printf("\n=== Testing lenient mode ===\n")
	lenientOptions := &ResolutionOptions{
		StrictMode:     false,
		DefaultOnError: "[DEFAULT]",
	}

	resolvedLenient := resolver.ResolveFormData(testData, lenientOptions)
	fmt.Printf("Lenient resolution result: %+v\n", resolvedLenient)
}
