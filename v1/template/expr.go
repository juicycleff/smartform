package template

import (
	"fmt"
)

// ForEachExpression creates a forEach loop expression
func ForEachExpression(itemVar string, collection string, body string) string {
	return TemplateVariableExpression(fmt.Sprintf("forEach(%s, %s, %s)", itemVar, collection, body))
}

// ForEachWithIndexExpression creates a forEach loop expression with an index variable
func ForEachWithIndexExpression(itemVar string, indexVar string, collection string, body string) string {
	return TemplateVariableExpression(fmt.Sprintf("forEach(%s, %s, %s, %s)", itemVar, indexVar, collection, body))
}

// TernaryExpression creates a ternary expression (condition ? trueValue : falseValue)
func TernaryExpression(condition, trueValue, falseValue string) string {
	return TemplateVariableExpression(fmt.Sprintf("%s ? %s : %s", condition, trueValue, falseValue))
}

// NullCoalesceExpression creates a null-coalescing expression (value ?? defaultValue)
func NullCoalesceExpression(value, defaultValue string) string {
	return TemplateVariableExpression(fmt.Sprintf("%s ?? %s", value, defaultValue))
}

// ArrayAccessExpression creates an expression to access an array element
func ArrayAccessExpression(array string, index int) string {
	return TemplateVariableExpression(fmt.Sprintf("%s[%d]", array, index))
}
