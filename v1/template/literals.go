package template

import (
	"strconv"
	"strings"
)

// LiteralPart represents a literal value in a template
type LiteralPart struct {
	Value interface{}
}

// Evaluate returns the literal value
func (lp *LiteralPart) Evaluate(registry *VariableRegistry, context map[string]interface{}) (interface{}, error) {
	return lp.Value, nil
}

// parseStringLiteral parses a string literal (e.g., 'text' or "text")
func parseStringLiteral(text string) (string, bool) {
	// Check for single quotes
	if strings.HasPrefix(text, "'") && strings.HasSuffix(text, "'") && len(text) >= 2 {
		return text[1 : len(text)-1], true
	}

	// Check for double quotes
	if strings.HasPrefix(text, "\"") && strings.HasSuffix(text, "\"") && len(text) >= 2 {
		return text[1 : len(text)-1], true
	}

	return "", false
}

// parseNumericLiteral attempts to parse text as a numeric literal
func parseNumericLiteral(text string) (interface{}, bool) {
	// Try to parse as integer, then convert to float64 for consistency
	if i, err := strconv.ParseInt(text, 10, 64); err == nil {
		return float64(i), true // Convert to float64
	}

	// Try to parse as float
	if f, err := strconv.ParseFloat(text, 64); err == nil {
		return f, true
	}

	// Check for boolean literals
	if text == "true" {
		return true, true
	}
	if text == "false" {
		return false, true
	}

	// Check for null literal
	if text == "null" {
		return nil, true
	}

	return nil, false
}
