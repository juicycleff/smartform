package smartform

import (
	"fmt"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// ConditionEvaluator provides methods to evaluate conditions against field data
type ConditionEvaluator struct {
	// CustomFunctions allows registration of custom functions for expressions
	CustomFunctions map[string]func(args ...interface{}) (interface{}, error)
	// CaseSensitive determines if string comparisons are case sensitive
	CaseSensitive bool
}

// NewConditionEvaluator creates a new condition evaluator with default settings
func NewConditionEvaluator() *ConditionEvaluator {
	return &ConditionEvaluator{
		CustomFunctions: make(map[string]func(args ...interface{}) (interface{}, error)),
		CaseSensitive:   true,
	}
}

// EvaluationContext holds the data and metadata for condition evaluation
type EvaluationContext struct {
	Fields map[string]interface{} // Field values to evaluate against
	Meta   map[string]interface{} // Additional metadata (user roles, timestamps, etc.)
}

// EvaluationError represents an error during condition evaluation
type EvaluationError struct {
	Message   string
	Field     string
	Condition *Condition
	Cause     error
}

func (e *EvaluationError) Error() string {
	if e.Field != "" {
		return fmt.Sprintf("condition evaluation error for field '%s': %s", e.Field, e.Message)
	}
	return fmt.Sprintf("condition evaluation error: %s", e.Message)
}

func (e *EvaluationError) Unwrap() error {
	return e.Cause
}

// Evaluate evaluates a condition against the provided context
func (ce *ConditionEvaluator) Evaluate(condition *Condition, ctx *EvaluationContext) (bool, error) {
	if condition == nil {
		return true, nil
	}

	if ctx == nil {
		ctx = &EvaluationContext{
			Fields: make(map[string]interface{}),
			Meta:   make(map[string]interface{}),
		}
	}

	switch condition.Type {
	case ConditionTypeSimple:
		return ce.evaluateSimple(condition, ctx)
	case ConditionTypeAnd:
		return ce.evaluateAnd(condition, ctx)
	case ConditionTypeOr:
		return ce.evaluateOr(condition, ctx)
	case ConditionTypeNot:
		return ce.evaluateNot(condition, ctx)
	case ConditionTypeExists:
		return ce.evaluateExists(condition, ctx)
	case ConditionTypeExpression:
		return ce.evaluateExpression(condition, ctx)
	default:
		return false, &EvaluationError{
			Message:   fmt.Sprintf("unsupported condition type: %s", condition.Type),
			Condition: condition,
		}
	}
}

// evaluateSimple handles simple field comparisons
func (ce *ConditionEvaluator) evaluateSimple(condition *Condition, ctx *EvaluationContext) (bool, error) {
	if condition.Field == "" {
		return false, &EvaluationError{
			Message:   "field name is required for simple conditions",
			Condition: condition,
		}
	}

	if condition.Operator == "" {
		return false, &EvaluationError{
			Message:   "operator is required for simple conditions",
			Field:     condition.Field,
			Condition: condition,
		}
	}

	fieldValue, exists := ctx.Fields[condition.Field]
	if !exists {
		// Handle missing fields based on operator
		switch condition.Operator {
		case "exists", "neq", "not_eq":
			return condition.Operator != "exists", nil
		default:
			return false, nil
		}
	}

	return ce.compareValues(fieldValue, condition.Value, condition.Operator, condition.Field)
}

// evaluateAnd handles logical AND conditions
func (ce *ConditionEvaluator) evaluateAnd(condition *Condition, ctx *EvaluationContext) (bool, error) {
	if len(condition.Conditions) == 0 {
		return true, nil // Empty AND is true
	}

	for i, subCondition := range condition.Conditions {
		result, err := ce.Evaluate(subCondition, ctx)
		if err != nil {
			return false, &EvaluationError{
				Message:   fmt.Sprintf("error in AND condition at index %d", i),
				Condition: condition,
				Cause:     err,
			}
		}
		if !result {
			return false, nil // Short-circuit on first false
		}
	}
	return true, nil
}

// evaluateOr handles logical OR conditions
func (ce *ConditionEvaluator) evaluateOr(condition *Condition, ctx *EvaluationContext) (bool, error) {
	if len(condition.Conditions) == 0 {
		return false, nil // Empty OR is false
	}

	var lastError error
	for i, subCondition := range condition.Conditions {
		result, err := ce.Evaluate(subCondition, ctx)
		if err != nil {
			lastError = &EvaluationError{
				Message:   fmt.Sprintf("error in OR condition at index %d", i),
				Condition: condition,
				Cause:     err,
			}
			continue // Continue to next condition on error
		}
		if result {
			return true, nil // Short-circuit on first true
		}
	}

	// If we got here and have an error, all conditions failed
	if lastError != nil {
		return false, lastError
	}
	return false, nil
}

// evaluateNot handles logical NOT conditions
func (ce *ConditionEvaluator) evaluateNot(condition *Condition, ctx *EvaluationContext) (bool, error) {
	if len(condition.Conditions) != 1 {
		return false, &EvaluationError{
			Message:   "NOT condition must have exactly one sub-condition",
			Condition: condition,
		}
	}

	result, err := ce.Evaluate(condition.Conditions[0], ctx)
	if err != nil {
		return false, &EvaluationError{
			Message:   "error in NOT condition",
			Condition: condition,
			Cause:     err,
		}
	}
	return !result, nil
}

// evaluateExists checks if a field exists and is not empty
func (ce *ConditionEvaluator) evaluateExists(condition *Condition, ctx *EvaluationContext) (bool, error) {
	if condition.Field == "" {
		return false, &EvaluationError{
			Message:   "field name is required for exists conditions",
			Condition: condition,
		}
	}

	fieldValue, exists := ctx.Fields[condition.Field]
	if !exists {
		return false, nil
	}

	return !ce.isEmpty(fieldValue), nil
}

// evaluateExpression handles custom expressions (basic implementation)
func (ce *ConditionEvaluator) evaluateExpression(condition *Condition, ctx *EvaluationContext) (bool, error) {
	if condition.Expression == "" {
		return false, &EvaluationError{
			Message:   "expression is required for expression conditions",
			Condition: condition,
		}
	}

	// Simple expression evaluator - can be extended with a proper parser
	return ce.evaluateSimpleExpression(condition.Expression, ctx)
}

// compareValues compares two values using the specified operator
func (ce *ConditionEvaluator) compareValues(fieldValue, compareValue interface{}, operator, fieldName string) (bool, error) {
	switch operator {
	case "eq", "equals", "==":
		return ce.isEqual(fieldValue, compareValue), nil
	case "neq", "not_equals", "!=":
		return !ce.isEqual(fieldValue, compareValue), nil
	case "gt", ">":
		return ce.isGreater(fieldValue, compareValue)
	case "gte", ">=":
		return ce.isGreaterOrEqual(fieldValue, compareValue)
	case "lt", "<":
		return ce.isLess(fieldValue, compareValue)
	case "lte", "<=":
		return ce.isLessOrEqual(fieldValue, compareValue)
	case "contains":
		return ce.contains(fieldValue, compareValue)
	case "starts_with":
		return ce.startsWith(fieldValue, compareValue)
	case "ends_with":
		return ce.endsWith(fieldValue, compareValue)
	case "regex", "matches":
		return ce.matchesRegex(fieldValue, compareValue)
	case "in":
		return ce.isIn(fieldValue, compareValue)
	case "not_in":
		o, err := ce.isIn(fieldValue, compareValue)
		if err != nil {
			return false, err
		}
		return !o, nil
	case "empty":
		return ce.isEmpty(fieldValue), nil
	case "not_empty":
		return !ce.isEmpty(fieldValue), nil
	case "exists":
		return fieldValue != nil, nil
	default:
		return false, &EvaluationError{
			Message: fmt.Sprintf("unsupported operator: %s", operator),
			Field:   fieldName,
		}
	}
}

// Type conversion and comparison methods

func (ce *ConditionEvaluator) isEqual(a, b interface{}) bool {
	if a == nil && b == nil {
		return true
	}
	if a == nil || b == nil {
		return false
	}

	// Handle string comparisons
	if strA, okA := a.(string); okA {
		if strB, okB := b.(string); okB {
			if ce.CaseSensitive {
				return strA == strB
			}
			return strings.EqualFold(strA, strB)
		}
	}

	// Use reflection for deep comparison
	return reflect.DeepEqual(a, b)
}

func (ce *ConditionEvaluator) isGreater(a, b interface{}) (bool, error) {
	return ce.compareNumeric(a, b, func(x, y float64) bool { return x > y })
}

func (ce *ConditionEvaluator) isGreaterOrEqual(a, b interface{}) (bool, error) {
	return ce.compareNumeric(a, b, func(x, y float64) bool { return x >= y })
}

func (ce *ConditionEvaluator) isLess(a, b interface{}) (bool, error) {
	return ce.compareNumeric(a, b, func(x, y float64) bool { return x < y })
}

func (ce *ConditionEvaluator) isLessOrEqual(a, b interface{}) (bool, error) {
	return ce.compareNumeric(a, b, func(x, y float64) bool { return x <= y })
}

func (ce *ConditionEvaluator) compareNumeric(a, b interface{}, compareFn func(float64, float64) bool) (bool, error) {
	numA, errA := ce.toFloat64(a)
	numB, errB := ce.toFloat64(b)

	if errA != nil || errB != nil {
		// Try time comparison
		if timeA, errTimeA := ce.toTime(a); errTimeA == nil {
			if timeB, errTimeB := ce.toTime(b); errTimeB == nil {
				return compareFn(float64(timeA.Unix()), float64(timeB.Unix())), nil
			}
		}
		return false, fmt.Errorf("cannot compare non-numeric values")
	}

	return compareFn(numA, numB), nil
}

func (ce *ConditionEvaluator) contains(haystack, needle interface{}) (bool, error) {
	strHaystack, okHaystack := haystack.(string)
	strNeedle, okNeedle := needle.(string)

	if !okHaystack || !okNeedle {
		return false, fmt.Errorf("contains operator requires string values")
	}

	if ce.CaseSensitive {
		return strings.Contains(strHaystack, strNeedle), nil
	}
	return strings.Contains(strings.ToLower(strHaystack), strings.ToLower(strNeedle)), nil
}

func (ce *ConditionEvaluator) startsWith(value, prefix interface{}) (bool, error) {
	strValue, okValue := value.(string)
	strPrefix, okPrefix := prefix.(string)

	if !okValue || !okPrefix {
		return false, fmt.Errorf("starts_with operator requires string values")
	}

	if ce.CaseSensitive {
		return strings.HasPrefix(strValue, strPrefix), nil
	}
	return strings.HasPrefix(strings.ToLower(strValue), strings.ToLower(strPrefix)), nil
}

func (ce *ConditionEvaluator) endsWith(value, suffix interface{}) (bool, error) {
	strValue, okValue := value.(string)
	strSuffix, okSuffix := suffix.(string)

	if !okValue || !okSuffix {
		return false, fmt.Errorf("ends_with operator requires string values")
	}

	if ce.CaseSensitive {
		return strings.HasSuffix(strValue, strSuffix), nil
	}
	return strings.HasSuffix(strings.ToLower(strValue), strings.ToLower(strSuffix)), nil
}

func (ce *ConditionEvaluator) matchesRegex(value, pattern interface{}) (bool, error) {
	strValue, okValue := value.(string)
	strPattern, okPattern := pattern.(string)

	if !okValue || !okPattern {
		return false, fmt.Errorf("regex operator requires string values")
	}

	regex, err := regexp.Compile(strPattern)
	if err != nil {
		return false, fmt.Errorf("invalid regex pattern: %v", err)
	}

	return regex.MatchString(strValue), nil
}

func (ce *ConditionEvaluator) isIn(value, list interface{}) (bool, error) {
	// Handle slice/array
	listValue := reflect.ValueOf(list)
	if listValue.Kind() == reflect.Slice || listValue.Kind() == reflect.Array {
		for i := 0; i < listValue.Len(); i++ {
			if ce.isEqual(value, listValue.Index(i).Interface()) {
				return true, nil
			}
		}
		return false, nil
	}

	return false, fmt.Errorf("in operator requires a slice or array")
}

func (ce *ConditionEvaluator) isEmpty(value interface{}) bool {
	if value == nil {
		return true
	}

	v := reflect.ValueOf(value)
	switch v.Kind() {
	case reflect.String:
		return v.Len() == 0
	case reflect.Slice, reflect.Array, reflect.Map:
		return v.Len() == 0
	case reflect.Ptr, reflect.Interface:
		return v.IsNil()
	default:
		return false
	}
}

// Helper methods for type conversion

func (ce *ConditionEvaluator) toFloat64(value interface{}) (float64, error) {
	switch v := value.(type) {
	case float64:
		return v, nil
	case float32:
		return float64(v), nil
	case int:
		return float64(v), nil
	case int32:
		return float64(v), nil
	case int64:
		return float64(v), nil
	case uint:
		return float64(v), nil
	case uint32:
		return float64(v), nil
	case uint64:
		return float64(v), nil
	case string:
		return strconv.ParseFloat(v, 64)
	default:
		return 0, fmt.Errorf("cannot convert %T to float64", value)
	}
}

func (ce *ConditionEvaluator) toTime(value interface{}) (time.Time, error) {
	switch v := value.(type) {
	case time.Time:
		return v, nil
	case string:
		// Try common time formats
		formats := []string{
			time.RFC3339,
			time.RFC3339Nano,
			"2006-01-02",
			"2006-01-02 15:04:05",
			"01/02/2006",
			"01/02/2006 15:04:05",
		}
		for _, format := range formats {
			if t, err := time.Parse(format, v); err == nil {
				return t, nil
			}
		}
		return time.Time{}, fmt.Errorf("cannot parse time: %s", v)
	case int64:
		return time.Unix(v, 0), nil
	default:
		return time.Time{}, fmt.Errorf("cannot convert %T to time", value)
	}
}

// Simple expression evaluator (can be extended)
func (ce *ConditionEvaluator) evaluateSimpleExpression(expr string, ctx *EvaluationContext) (bool, error) {
	// Basic implementation - supports field references and simple comparisons
	// This can be extended with a proper expression parser like govaluate

	expr = strings.TrimSpace(expr)

	// Handle field references like ${field_name}
	fieldRegex := regexp.MustCompile(`\$\{([^}]+)\}`)
	expr = fieldRegex.ReplaceAllStringFunc(expr, func(match string) string {
		fieldName := match[2 : len(match)-1] // Remove ${ and }
		if value, exists := ctx.Fields[fieldName]; exists {
			return fmt.Sprintf("%v", value)
		}
		return "null"
	})

	// Simple boolean evaluation
	switch strings.ToLower(expr) {
	case "true", "1", "yes":
		return true, nil
	case "false", "0", "no", "null":
		return false, nil
	default:
		return false, &EvaluationError{
			Message: fmt.Sprintf("unsupported expression: %s", expr),
		}
	}
}

// RegisterCustomFunction allows registration of custom functions for expressions
func (ce *ConditionEvaluator) RegisterCustomFunction(name string, fn func(args ...interface{}) (interface{}, error)) {
	ce.CustomFunctions[name] = fn
}

// Validate checks if a condition is well-formed
func (ce *ConditionEvaluator) Validate(condition *Condition) error {
	if condition == nil {
		return nil
	}

	if !condition.Type.IsValid() {
		return &EvaluationError{
			Message:   fmt.Sprintf("invalid condition type: %s", condition.Type),
			Condition: condition,
		}
	}

	switch condition.Type {
	case ConditionTypeSimple:
		if condition.Field == "" {
			return &EvaluationError{
				Message:   "field is required for simple conditions",
				Condition: condition,
			}
		}
		if condition.Operator == "" {
			return &EvaluationError{
				Message:   "operator is required for simple conditions",
				Condition: condition,
			}
		}
	case ConditionTypeAnd, ConditionTypeOr:
		if len(condition.Conditions) == 0 {
			return &EvaluationError{
				Message:   "at least one sub-condition is required for AND/OR conditions",
				Condition: condition,
			}
		}
		for i, subCondition := range condition.Conditions {
			if err := ce.Validate(subCondition); err != nil {
				return &EvaluationError{
					Message:   fmt.Sprintf("invalid sub-condition at index %d", i),
					Condition: condition,
					Cause:     err,
				}
			}
		}
	case ConditionTypeNot:
		if len(condition.Conditions) != 1 {
			return &EvaluationError{
				Message:   "NOT condition must have exactly one sub-condition",
				Condition: condition,
			}
		}
		if err := ce.Validate(condition.Conditions[0]); err != nil {
			return &EvaluationError{
				Message:   "invalid sub-condition in NOT condition",
				Condition: condition,
				Cause:     err,
			}
		}
	case ConditionTypeExists:
		if condition.Field == "" {
			return &EvaluationError{
				Message:   "field is required for exists conditions",
				Condition: condition,
			}
		}
	case ConditionTypeExpression:
		if condition.Expression == "" {
			return &EvaluationError{
				Message:   "expression is required for expression conditions",
				Condition: condition,
			}
		}
	}

	return nil
}
