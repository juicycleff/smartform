package template

import (
	"strings"
)

// TemplateVariableExpression creates a template expression string
func TemplateVariableExpression(expression string) string {
	return "${" + expression + "}"
}

// VariableRef creates a reference to a variable
func VariableRef(path string) string {
	return TemplateVariableExpression(path)
}

// FunctionCall creates a function call expression
func FunctionCall(name string, args ...string) string {
	argsStr := strings.Join(args, ", ")
	return TemplateVariableExpression(name + "(" + argsStr + ")")
}

// ConditionalValue creates a conditional value using if function
func ConditionalValue(condition, trueValue, falseValue string) string {
	return FunctionCall("if", condition, trueValue, falseValue)
}

// FormatValue creates a formatted value using the format function
func FormatValue(format string, args ...string) string {
	allArgs := make([]string, 0, len(args)+1)
	allArgs = append(allArgs, "\""+format+"\"")
	allArgs = append(allArgs, args...)
	return FunctionCall("format", allArgs...)
}
