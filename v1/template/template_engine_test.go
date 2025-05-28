package template

import (
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTemplateEngine_BasicFunctionality(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry

	// Register some test variables
	registry.RegisterVariable("name", "John")
	registry.RegisterVariable("age", 30)
	registry.RegisterVariable("isActive", true)

	tests := []struct {
		name     string
		template string
		expected string
		context  map[string]interface{}
	}{
		{
			name:     "Simple text without variables",
			template: "Hello world",
			expected: "Hello world",
			context:  map[string]interface{}{},
		},
		{
			name:     "Simple variable substitution",
			template: "Hello, ${name}!",
			expected: "Hello, John!",
			context:  map[string]interface{}{},
		},
		{
			name:     "Multiple variables",
			template: "${name} is ${age} years old",
			expected: "John is 30 years old",
			context:  map[string]interface{}{},
		},
		{
			name:     "Context variable overrides registry variable",
			template: "Hello, ${name}!",
			expected: "Hello, Alice!",
			context:  map[string]interface{}{"name": "Alice"},
		},
		{
			name:     "Mixed text and variables",
			template: "User ${name} (${age}) is ${isActive ? 'active' : 'inactive'}",
			expected: "User John (30) is active",
			context:  map[string]interface{}{},
		},
		{
			name:     "Nonexistent variable",
			template: "Hello, ${unknown}!",
			expected: "", // Should return error
			context:  map[string]interface{}{},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result, err := engine.EvaluateExpressionAsString(test.template, test.context)

			if test.name == "Nonexistent variable" {
				assert.Error(t, err, "Expected error for nonexistent variable")
			} else {
				assert.NoError(t, err)
				assert.Equal(t, test.expected, result)
			}
		})
	}
}

func TestTemplateEngine_VariableAccess(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry

	// Register test variables with nested properties
	registry.RegisterVariable("user", map[string]interface{}{
		"name": "John",
		"contact": map[string]interface{}{
			"email": "john@example.com",
			"phone": "123-456-7890",
		},
		"addresses": []interface{}{
			map[string]interface{}{
				"street": "123 Main St",
				"city":   "Anytown",
				"zip":    "12345",
			},
			map[string]interface{}{
				"street": "456 Oak Ave",
				"city":   "Somewhere",
				"zip":    "67890",
			},
		},
	})

	tests := []struct {
		name     string
		template string
		expected string
	}{
		{
			name:     "Access nested property",
			template: "Email: ${user.contact.email}",
			expected: "Email: john@example.com",
		},
		{
			name:     "Access array element",
			template: "Primary address: ${user.addresses[0].street}",
			expected: "Primary address: 123 Main St",
		},
		{
			name:     "Access array element with nested property",
			template: "City: ${user.addresses[0].city}, ZIP: ${user.addresses[0].zip}",
			expected: "City: Anytown, ZIP: 12345",
		},
		{
			name:     "Access second array element",
			template: "Secondary address: ${user.addresses[1].street}, ${user.addresses[1].city}",
			expected: "Secondary address: 456 Oak Ave, Somewhere",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result, err := engine.EvaluateExpressionAsString(test.template, map[string]interface{}{})
			assert.NoError(t, err)
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestTemplateEngine_Functions(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry

	// Register standard functions
	registry.RegisterStandardFunctions()

	// Register test variables
	registry.RegisterVariable("num1", 10)
	registry.RegisterVariable("num2", 5)
	registry.RegisterVariable("text", "Hello World")
	registry.RegisterVariable("items", []interface{}{1, 2, 3, 4, 5})

	tests := []struct {
		name     string
		template string
		expected string
	}{
		// Math functions
		{
			name:     "Function: add",
			template: "${add(num1, num2)}",
			expected: "15",
		},
		{
			name:     "Function: subtract",
			template: "${subtract(num1, num2)}",
			expected: "5",
		},
		{
			name:     "Function: multiply",
			template: "${multiply(num1, num2)}",
			expected: "50",
		},
		{
			name:     "Function: divide",
			template: "${divide(num1, num2)}",
			expected: "2",
		},
		{
			name:     "Function: mod",
			template: "${mod(num1, 3)}",
			expected: "1",
		},
		{
			name:     "Function: round",
			template: "${round(3.14159, 2)}",
			expected: "3.14",
		},

		// String functions
		{
			name:     "Function: concat",
			template: "${concat('Hello, ', text)}",
			expected: "Hello, Hello World",
		},
		{
			name:     "Function: length",
			template: "${length(text)}",
			expected: "11",
		},
		{
			name:     "Function: substring",
			template: "${substring(text, 0, 5)}",
			expected: "Hello",
		},
		{
			name:     "Function: toLower",
			template: "${toLower(text)}",
			expected: "hello world",
		},
		{
			name:     "Function: toUpper",
			template: "${toUpper(text)}",
			expected: "HELLO WORLD",
		},
		{
			name:     "Function: trim",
			template: "${trim('  trimmed  ')}",
			expected: "trimmed",
		},

		// Array functions
		{
			name:     "Function: first",
			template: "${first(items)}",
			expected: "1",
		},
		{
			name:     "Function: last",
			template: "${last(items)}",
			expected: "5",
		},
		{
			name:     "Function: count",
			template: "${count(items)}",
			expected: "5",
		},
		{
			name:     "Function: join",
			template: "${join(items, '-')}",
			expected: "1-2-3-4-5",
		},

		// Null handling
		{
			name:     "Function: default",
			template: "${default(null, 'Default Value')}",
			expected: "Default Value",
		},
		{
			name:     "Function: coalesce",
			template: "${coalesce(null, '', 'First Value', 'Second Value')}",
			expected: "First Value",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result, err := engine.EvaluateExpressionAsString(test.template, map[string]interface{}{})
			assert.NoError(t, err)
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestTemplateEngine_ComplexExpressions(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry

	registry.RegisterStandardFunctions()

	registry.RegisterVariable("user", map[string]interface{}{
		"name":    "John",
		"age":     25,
		"premium": true,
		"points":  150,
	})

	tests := []struct {
		name     string
		template string
		expected string
	}{
		// Ternary operator
		{
			name:     "Ternary operator with true condition",
			template: "${user.premium ? 'Premium User' : 'Regular User'}",
			expected: "Premium User",
		},
		{
			name:     "Ternary operator with false condition",
			template: "${eq(user.age, 30) ? 'Thirty' : 'Not Thirty'}",
			expected: "Not Thirty",
		},
		{
			name:     "Nested ternary operators",
			template: "${user.age > 18 ? (user.premium ? 'Adult Premium' : 'Adult Basic') : 'Minor'}",
			expected: "Adult Premium",
		},

		// Null coalescing
		{
			name:     "Null coalescing operator with null first value",
			template: "${null ?? 'Default'}",
			expected: "Default",
		},
		{
			name:     "Null coalescing operator with non-null first value",
			template: "${user.name ?? 'Unknown'}",
			expected: "John",
		},
		{
			name:     "Chained null coalescing",
			template: "${user.middleName ?? user.nickname ?? 'N/A'}",
			expected: "N/A",
		},

		// Combined expressions
		{
			name:     "If function with equality check",
			template: "${if(eq(user.age, 25), 'Twenty-five', 'Other age')}",
			expected: "Twenty-five",
		},
		{
			name:     "Complex condition",
			template: "${if(and(user.premium, gt(user.points, 100)), 'VIP', 'Standard')}",
			expected: "VIP",
		},
		{
			name:     "Math in template",
			template: "Total: ${add(user.points, 50)} points",
			expected: "Total: 200 points",
		},
		{
			name:     "String formatting with variables",
			template: "${format('%s: %d points, %s status', user.name, user.points, if(user.premium, 'premium', 'basic'))}",
			expected: "John: 150 points, premium status",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result, err := engine.EvaluateExpressionAsString(test.template, map[string]interface{}{})
			assert.NoError(t, err, "Failed on expression: %s", test.template)
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestTemplateEngine_LoopFunctionality(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry

	registry.RegisterStandardFunctions()

	registry.RegisterVariable("items", []interface{}{
		map[string]interface{}{"id": 1, "name": "Item 1"},
		map[string]interface{}{"id": 2, "name": "Item 2"},
		map[string]interface{}{"id": 3, "name": "Item 3"},
	})

	registry.RegisterVariable("emptyList", []interface{}{})

	registry.RegisterVariable("users", map[string]interface{}{
		"john":  map[string]interface{}{"age": 30, "role": "admin"},
		"alice": map[string]interface{}{"age": 25, "role": "user"},
	})

	tests := []struct {
		name     string
		template string
		expected string
	}{
		{
			name:     "Simple forEach loop",
			template: "${forEach(item, items, concat(item.name, ', '))}",
			expected: "Item 1, Item 2, Item 3, ",
		},

		// {
		// 	name:     "forEach with index",
		// 	template: "${forEach(item, index, items, concat(index, ': ', item.name, '\n'))}",
		// 	expected: "0: Item 1\n1: Item 2\n2: Item 3\n",
		// },
		{
			name:     "forEach with conditional",
			template: "${forEach(item, items, if(eq(item.id, 2), item.name, ''))}",
			expected: "Item 2",
		},
		{
			name:     "forEach with empty list",
			template: "${forEach(item, emptyList, item.name)}",
			expected: "",
		},
		{
			name:     "forEach with map",
			template: "${forEach(entry, users, concat(entry.key, ': ', entry.value.role, ', '))}",
			expected: "john: admin, alice: user, ",
		},
		{
			name:     "Nested forEach loops",
			template: "${forEach(outer, items, concat(outer.name, ': ', forEach(inner, items, if(gt(inner.id, outer.id), inner.name, '')), '; '))}",
			expected: "Item 1: Item 2Item 3; Item 2: Item 3; Item 3: ; ",
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result, err := engine.EvaluateExpressionAsString(test.template, map[string]interface{}{})
			assert.NoError(t, err)
			assert.Equal(t, test.expected, result)
		})
	}
}

func TestVariableSuggestions(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry

	// Register complex test variables
	registry.RegisterVariable("customer", map[string]interface{}{
		"name": "John Smith",
		"age":  32,
		"address": map[string]interface{}{
			"street":  "123 Main St",
			"city":    "Anytown",
			"zipCode": "12345",
		},
		"orders": []interface{}{
			map[string]interface{}{
				"id":     "ORD-001",
				"amount": 129.99,
				"items": []interface{}{
					map[string]interface{}{
						"product":  "Widget Pro",
						"quantity": 2,
					},
				},
			},
		},
	})

	registry.RegisterVariable("company", map[string]interface{}{
		"name":  "ACME Corp",
		"taxId": "TX-12345",
	})

	registry.RegisterStandardFunctions()

	// Test generating all suggestions
	t.Run("Generate all suggestions", func(t *testing.T) {
		suggestions := registry.GenerateVariableSuggestions()

		// Check that we have suggestions for both root variables
		assert.NotEmpty(t, suggestions)

		// Find customer suggestion
		var customerSuggestion *VariableSuggestion
		for _, s := range suggestions {
			if s.Expr == "customer" {
				customerSuggestion = s
				break
			}
		}

		assert.NotNil(t, customerSuggestion)
		assert.Equal(t, "object", customerSuggestion.Type)
		assert.NotEmpty(t, customerSuggestion.Children)

		// Check that nested properties are included
		var found bool
		for _, s := range suggestions {
			if s.Expr == "customer.address.city" {
				found = true
				assert.Equal(t, "string", s.Type)
				assert.Equal(t, "Anytown", s.Value)
				break
			}
		}
		assert.True(t, found, "Should find nested property suggestion")

		// Check array access
		found = false
		for _, s := range suggestions {
			if s.Expr == "customer.orders[0]" {
				found = true
				assert.Equal(t, "object", s.Type)
				break
			}
		}
		assert.True(t, found, "Should find array element suggestion")

		// Check array element property access
		found = false
		for _, s := range suggestions {
			if s.Expr == "customer.orders[0].id" {
				found = true
				assert.Equal(t, "string", s.Type)
				assert.Equal(t, "ORD-001", s.Value)
				break
			}
		}
		assert.True(t, found, "Should find array element property suggestion")

		// Check function suggestions
		found = false
		for _, s := range suggestions {
			if s.Expr == "format" && s.IsFunction {
				found = true
				assert.Contains(t, s.Signature, "format(")
				break
			}
		}
		assert.True(t, found, "Should find function suggestions")
	})

	// Test GetExpressionSuggestions for specific contexts
	t.Run("Test context-specific suggestions", func(t *testing.T) {
		// Empty expression
		emptySuggestions := engine.GetExpressionSuggestions("")
		assert.NotEmpty(t, emptySuggestions)

		// Expression with prefix
		customerSuggestions := engine.GetExpressionSuggestions("customer.")
		assert.NotEmpty(t, customerSuggestions)

		// All suggestions should start with "customer."
		for _, s := range customerSuggestions {
			assert.True(t, strings.HasPrefix(s.Expr, "customer."))
		}

		// Check array access suggestions
		ordersSuggestions := engine.GetExpressionSuggestions("customer.orders[0].")
		assert.NotEmpty(t, ordersSuggestions)

		// Function parameter suggestions
		formatSuggestions := engine.GetExpressionSuggestions("format(")
		assert.NotEmpty(t, formatSuggestions)
	})
}

func TestTemplateUtils(t *testing.T) {
	t.Run("TemplateVariableExpression", func(t *testing.T) {
		result := TemplateVariableExpression("customer.name")
		assert.Equal(t, "${customer.name}", result)
	})

	t.Run("VariableRef", func(t *testing.T) {
		result := VariableRef("customer.name")
		assert.Equal(t, "${customer.name}", result)
	})

	t.Run("FunctionCall", func(t *testing.T) {
		result := FunctionCall("format", "%s %d", "customer.name", "customer.age")
		assert.Equal(t, "${format(%s %d, customer.name, customer.age)}", result)
	})

	t.Run("ConditionalValue", func(t *testing.T) {
		result := ConditionalValue("customer.premium", "'Premium'", "'Regular'")
		assert.Equal(t, "${if(customer.premium, 'Premium', 'Regular')}", result)
	})

	t.Run("FormatValue", func(t *testing.T) {
		result := FormatValue("Hello, %s!", "name")
		assert.Equal(t, "${format(\"Hello, %s!\", name)}", result)
	})
}
