package smartform_test

import (
	"testing"

	"github.com/juicycleff/smartform/v1/template"
	"github.com/stretchr/testify/assert"
)

// Mock FormSchema for testing
type FormSchema struct {
	engine *template.TemplateEngine
}

func TestFormSchemaIntegration(t *testing.T) {
	// Create a mock form schema
	schema := &FormSchema{
		engine: template.NewTemplateEngine(),
	}

	registry := schema.engine.GetVariableRegistry()
	registry.RegisterStandardFunctions()

	// Register test variables
	registry.RegisterVariable("customer", map[string]interface{}{
		"name":    "John Smith",
		"email":   "john@example.com",
		"premium": true,
	})

	registry.RegisterVariable("order", map[string]interface{}{
		"id":     "ORD-12345",
		"amount": 99.95,
		"items": []interface{}{
			map[string]interface{}{
				"product":  "Widget",
				"quantity": 2,
				"price":    39.95,
			},
			map[string]interface{}{
				"product":  "Gadget",
				"quantity": 1,
				"price":    20.05,
			},
		},
	})

	// Test template evaluation
	t.Run("Evaluate template in form schema", func(t *testing.T) {
		template := "Hello ${customer.name}, your order ${order.id} for $${order.amount} is being processed."
		expected := "Hello John Smith, your order ORD-12345 for $99.95 is being processed."

		result, err := schema.engine.EvaluateExpressionAsString(template, map[string]interface{}{})
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
	})

	// Test complex template with calculations
	t.Run("Template with calculations", func(t *testing.T) {
		template := "${customer.name}'s order includes ${order.items[0].quantity} ${order.items[0].product}(s) " +
			"at $${order.items[0].price} each and ${order.items[1].quantity} ${order.items[1].product}(s) " +
			"at $${order.items[1].price} each for a total of $${order.amount}."

		expected := "John Smith's order includes 2 Widget(s) at $39.95 each and 1 Gadget(s) at $20.05 each for a total of $99.95."

		result, err := schema.engine.EvaluateExpressionAsString(template, map[string]interface{}{})
		assert.NoError(t, err)
		assert.Equal(t, expected, result)
	})

	// Test DefaultWhen condition with template
	t.Run("DefaultWhen with template", func(t *testing.T) {
		// Simulate DefaultWhen logic
		condition := true // Condition is met
		template := "${customer.premium ? 'Premium shipping (free)' : 'Standard shipping ($5.00)'}"
		expected := "Premium shipping (free)"

		if condition {
			result, err := schema.engine.EvaluateExpressionAsString(template, map[string]interface{}{})
			assert.NoError(t, err)
			assert.Equal(t, expected, result)
		}
	})
}
