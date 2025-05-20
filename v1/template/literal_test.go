package template

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLiteralHandling(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry

	// Register a test variable
	registry.RegisterVariable("name", "John")

	tests := []struct {
		template string
		expected string
	}{
		// String literals
		{"Hello, ${name} - ${' world'}!", "Hello, John -  world!"},
		{"${'Single quoted'} and ${\"Double quoted\"}", "Single quoted and Double quoted"},

		// Numeric literals
		{"Number: ${42}", "Number: 42"},
		{"Decimal: ${3.14}", "Decimal: 3.14"},

		// Boolean and null literals
		{"Boolean: ${true}", "Boolean: true"},
		{"Null: ${null ?? 'N/A'}", "Null: N/A"},
	}

	for _, test := range tests {
		result, err := engine.EvaluateExpressionAsString(test.template, nil)
		assert.NoError(t, err)
		assert.Equal(t, test.expected, result)
	}
}

func TestArrayAccess(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry

	// Register a test variable with an array
	registry.RegisterVariable("items", []interface{}{
		"first",
		"second",
		map[string]interface{}{
			"name": "nested",
		},
	})

	tests := []struct {
		template string
		expected string
	}{
		{"First: ${items[0]}", "First: first"},
		{"Nested: ${items[2].name}", "Nested: nested"},
	}

	for _, test := range tests {
		result, err := engine.EvaluateExpressionAsString(test.template, nil)
		assert.NoError(t, err)
		assert.Equal(t, test.expected, result)
	}
}

func TestLogicalFunctions(t *testing.T) {
	engine := NewTemplateEngine()
	registry := engine.variableRegistry
	registry.RegisterStandardFunctions()

	tests := []struct {
		template string
		expected string
	}{
		{"${and(true, true)}", "true"},
		{"${and(true, false)}", "false"},
		{"${or(false, true)}", "true"},
		{"${or(false, false)}", "false"},
	}

	for _, test := range tests {
		result, err := engine.EvaluateExpressionAsString(test.template, nil)
		assert.NoError(t, err)
		assert.Equal(t, test.expected, result)
	}
}
