package smartform

import (
	"fmt"
	"reflect"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/juicycleff/smartform/v1/template"
)

// ConditionEvaluator provides methods to evaluate conditions against field data
type ConditionEvaluator struct {
	// TemplateEngine for resolving template expressions in condition fields
	TemplateEngine *template.TemplateEngine
	// CustomFunctions allows registration of custom functions for expressions
	CustomFunctions map[string]func(args ...interface{}) (interface{}, error)
	// CaseSensitive determines if string comparisons are case sensitive
	CaseSensitive bool
	// EnableTemplateFields determines if fields should be evaluated as templates
	EnableTemplateFields bool
}

// NewConditionEvaluator creates a new condition evaluator with default settings
func NewConditionEvaluator() *ConditionEvaluator {
	return &ConditionEvaluator{
		CustomFunctions:      make(map[string]func(args ...interface{}) (interface{}, error)),
		CaseSensitive:        true,
		EnableTemplateFields: true,
		TemplateEngine:       template.NewTemplateEngine(),
	}
}

// SetTemplateEngine sets the template engine for variable resolution
func (ce *ConditionEvaluator) SetTemplateEngine(engine *template.TemplateEngine) {
	ce.TemplateEngine = engine
}

// EvaluationContext holds the data and metadata for condition evaluation
// Enhanced to work with template engine
type EvaluationContext struct {
	Fields map[string]interface{} // Field values to evaluate against
	Meta   map[string]interface{} // Additional metadata (user roles, timestamps, etc.)
	// TemplateContext is passed directly to template engine for variable resolution
	TemplateContext map[string]interface{}
}

// NewEvaluationContext creates a new evaluation context
func NewEvaluationContext() *EvaluationContext {
	return &EvaluationContext{
		Fields:          make(map[string]interface{}),
		Meta:            make(map[string]interface{}),
		TemplateContext: make(map[string]interface{}),
	}
}

// AddField adds a field to the context
func (ctx *EvaluationContext) AddField(name string, value interface{}) {
	ctx.Fields[name] = value
	if ctx.TemplateContext == nil {
		ctx.TemplateContext = make(map[string]interface{})
	}
	ctx.TemplateContext[name] = value
}

// AddMeta adds metadata to the context
func (ctx *EvaluationContext) AddMeta(name string, value interface{}) {
	ctx.Meta[name] = value
	if ctx.TemplateContext == nil {
		ctx.TemplateContext = make(map[string]interface{})
	}
	ctx.TemplateContext["_meta_"+name] = value
}

// MergeFields merges multiple fields into the context
func (ctx *EvaluationContext) MergeFields(fields map[string]interface{}) {
	for name, value := range fields {
		ctx.AddField(name, value)
	}
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
		ctx = NewEvaluationContext()
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

// evaluateSimple handles simple field comparisons with template support
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

	// Resolve field value using template engine if available and field contains template syntax
	fieldValue, exists, err := ce.resolveFieldValue(condition.Field, ctx)
	if err != nil {
		return false, &EvaluationError{
			Message:   fmt.Sprintf("error resolving field value: %v", err),
			Field:     condition.Field,
			Condition: condition,
			Cause:     err,
		}
	}

	if !exists {
		// Handle missing fields based on operator
		switch condition.Operator {
		case "exists", "neq", "not_eq", "!=":
			return condition.Operator != "exists", nil
		default:
			return false, nil
		}
	}

	// Resolve comparison value if it's a template expression
	compareValue := condition.Value
	if ce.EnableTemplateFields && ce.TemplateEngine != nil {
		if strValue, ok := condition.Value.(string); ok && ce.isTemplateExpression(strValue) {
			resolvedValue, err := ce.TemplateEngine.EvaluateExpression(strValue, ctx.TemplateContext)
			if err != nil {
				return false, &EvaluationError{
					Message:   fmt.Sprintf("error resolving comparison value template '%s': %v", strValue, err),
					Field:     condition.Field,
					Condition: condition,
					Cause:     err,
				}
			}
			compareValue = resolvedValue
		}
	}

	return ce.compareValues(fieldValue, compareValue, condition.Operator, condition.Field)
}

// resolveFieldValue resolves a field value, supporting both direct lookup and template expressions
func (ce *ConditionEvaluator) resolveFieldValue(field string, ctx *EvaluationContext) (interface{}, bool, error) {
	// If template engine is available and field contains template syntax, use template resolution
	if ce.EnableTemplateFields && ce.TemplateEngine != nil && ce.isTemplateExpression(field) {
		value, err := ce.TemplateEngine.EvaluateExpression(field, ctx.TemplateContext)
		if err != nil {
			return nil, false, err
		}
		return value, value != nil, nil
	}

	// Direct field lookup
	if value, exists := ctx.Fields[field]; exists {
		return value, true, nil
	}

	// Try template engine for variable resolution if field is a simple variable reference
	if ce.TemplateEngine != nil {
		// Convert simple field reference to template syntax and try again
		templateExpr := "${" + field + "}"
		value, err := ce.TemplateEngine.EvaluateExpression(templateExpr, ctx.TemplateContext)
		if err == nil && value != nil {
			return value, true, nil
		}
	}

	return nil, false, nil
}

// isTemplateExpression checks if a string contains template syntax
func (ce *ConditionEvaluator) isTemplateExpression(str string) bool {
	return strings.Contains(str, "${") && strings.Contains(str, "}")
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

	fieldValue, exists, err := ce.resolveFieldValue(condition.Field, ctx)
	if err != nil {
		return false, &EvaluationError{
			Message:   fmt.Sprintf("error resolving field value: %v", err),
			Field:     condition.Field,
			Condition: condition,
			Cause:     err,
		}
	}

	if !exists {
		return false, nil
	}

	return !ce.isEmpty(fieldValue), nil
}

// evaluateExpression handles custom expressions using template engine
func (ce *ConditionEvaluator) evaluateExpression(condition *Condition, ctx *EvaluationContext) (bool, error) {
	if condition.Expression == "" {
		return false, &EvaluationError{
			Message:   "expression is required for expression conditions",
			Condition: condition,
		}
	}

	// Use template engine if available
	if ce.TemplateEngine != nil {
		// Ensure expression is wrapped in template syntax if not already
		expression := condition.Expression
		if !ce.isTemplateExpression(expression) {
			expression = "${" + expression + "}"
		}

		result, err := ce.TemplateEngine.EvaluateExpression(expression, ctx.TemplateContext)
		if err != nil {
			return false, &EvaluationError{
				Message:   fmt.Sprintf("error evaluating template expression '%s': %v", expression, err),
				Condition: condition,
				Cause:     err,
			}
		}

		// Convert result to boolean
		return ce.toBool(result), nil
	}

	// Fallback to simple expression evaluator
	return ce.evaluateSimpleExpression(condition.Expression, ctx)
}

// toBool converts various types to boolean following JavaScript-like truthiness rules
func (ce *ConditionEvaluator) toBool(value interface{}) bool {
	if value == nil {
		return false
	}

	switch v := value.(type) {
	case bool:
		return v
	case int:
		return v != 0
	case int32:
		return v != 0
	case int64:
		return v != 0
	case float32:
		return v != 0
	case float64:
		return v != 0
	case string:
		return v != ""
	case []interface{}:
		return len(v) > 0
	case map[string]interface{}:
		return len(v) > 0
	default:
		// For other types, use reflection
		rv := reflect.ValueOf(value)
		switch rv.Kind() {
		case reflect.Slice, reflect.Array, reflect.Map, reflect.Chan:
			return rv.Len() > 0
		case reflect.Ptr, reflect.Interface:
			return !rv.IsNil()
		default:
			return true // Non-nil values are generally truthy
		}
	}
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

// Type conversion and comparison methods (same as before)

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

// Simple expression evaluator fallback (when template engine is not available)
func (ce *ConditionEvaluator) evaluateSimpleExpression(expr string, ctx *EvaluationContext) (bool, error) {
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

// TemplateConditionBuilder helps build conditions with template expressions
type TemplateConditionBuilder struct {
	evaluator *ConditionEvaluator
}

// NewTemplateConditionBuilder creates a new builder for template-enhanced conditions
func NewTemplateConditionBuilder(evaluator *ConditionEvaluator) *TemplateConditionBuilder {
	return &TemplateConditionBuilder{
		evaluator: evaluator,
	}
}

// SimpleCondition creates a simple condition with template field support
func (tcb *TemplateConditionBuilder) SimpleCondition(field, operator string, value interface{}) *Condition {
	return &Condition{
		Type:     ConditionTypeSimple,
		Field:    field,
		Operator: operator,
		Value:    value,
	}
}

// TemplateCondition creates a condition where the field is a template expression
func (tcb *TemplateConditionBuilder) TemplateCondition(fieldTemplate, operator string, value interface{}) *Condition {
	// Ensure field template has proper syntax
	if !strings.Contains(fieldTemplate, "${") {
		fieldTemplate = "${" + fieldTemplate + "}"
	}

	return &Condition{
		Type:     ConditionTypeSimple,
		Field:    fieldTemplate,
		Operator: operator,
		Value:    value,
	}
}

// ExpressionCondition creates a condition using a template expression
func (tcb *TemplateConditionBuilder) ExpressionCondition(expression string) *Condition {
	return &Condition{
		Type:       ConditionTypeExpression,
		Expression: expression,
	}
}

// And creates an AND condition
func (tcb *TemplateConditionBuilder) And(conditions ...*Condition) *Condition {
	return &Condition{
		Type:       ConditionTypeAnd,
		Conditions: conditions,
	}
}

// Or creates an OR condition
func (tcb *TemplateConditionBuilder) Or(conditions ...*Condition) *Condition {
	return &Condition{
		Type:       ConditionTypeOr,
		Conditions: conditions,
	}
}

// Not creates a NOT condition
func (tcb *TemplateConditionBuilder) Not(condition *Condition) *Condition {
	return &Condition{
		Type:       ConditionTypeNot,
		Conditions: []*Condition{condition},
	}
}

// Exists creates an EXISTS condition
func (tcb *TemplateConditionBuilder) Exists(field string) *Condition {
	return &Condition{
		Type:  ConditionTypeExists,
		Field: field,
	}
}
