package smartform

import (
	"fmt"
	"github.com/google/cel-go/cel"
	"reflect"
	"regexp"
	"strings"
)

// Validator handles form validation
type Validator struct {
	schema *FormSchema
}

// NewValidator creates a new validator for the given schema
func NewValidator(schema *FormSchema) *Validator {
	return &Validator{schema: schema}
}

// ValidateForm validates a form data map against the schema
func (v *Validator) ValidateForm(data map[string]interface{}) *ValidationResult {
	result := &ValidationResult{
		Valid:  true,
		Errors: []*ValidationError{},
	}

	// Validate each field
	for _, field := range v.schema.Fields {
		v.validateField(field, data, "", result)
	}

	result.Valid = len(result.Errors) == 0
	return result
}

// validateField validates a single field and its nested fields if applicable
func (v *Validator) validateField(field *Field, data map[string]interface{}, prefix string, result *ValidationResult) {
	fieldPath := field.ID
	if prefix != "" {
		fieldPath = prefix + "." + field.ID
	}

	// Skip validation if field is not visible
	if field.Visible != nil && !v.evaluateCondition(field.Visible, data) {
		return
	}

	// Get field value (support nested path like "address.street")
	value := v.getValueByPath(data, fieldPath)

	// Check required fields
	if field.Required {
		isEmpty := v.isEmpty(value)
		if isEmpty {
			result.Errors = append(result.Errors, &ValidationError{
				FieldID:  fieldPath,
				Message:  fmt.Sprintf("%s is required", field.Label),
				RuleType: string(ValidationTypeRequired),
			})
		}
	}

	// Check conditional required (requiredIf)
	if field.RequiredIf != nil && v.evaluateCondition(field.RequiredIf, data) {
		isEmpty := v.isEmpty(value)
		if isEmpty {
			result.Errors = append(result.Errors, &ValidationError{
				FieldID:  fieldPath,
				Message:  fmt.Sprintf("%s is required based on other field values", field.Label),
				RuleType: string(ValidationTypeRequiredIf),
			})
		}
	}
	// Skip other validations if value is empty and not required
	if v.isEmpty(value) {
		return
	}

	// Apply field-specific validations
	for _, rule := range field.ValidationRules {
		valid, message := v.applyValidationRule(rule, value, field, data)
		if !valid {
			result.Errors = append(result.Errors, &ValidationError{
				FieldID:  fieldPath,
				Message:  message,
				RuleType: string(rule.Type),
			})
		}
	}

	// Handle nested fields (for group, object types)
	if field.Type == FieldTypeGroup || field.Type == FieldTypeObject {
		nestedData := map[string]interface{}{}
		if mapValue, ok := value.(map[string]interface{}); ok {
			nestedData = mapValue
		}
		for _, nestedField := range field.Nested {
			v.validateField(nestedField, nestedData, fieldPath, result)
		}
	}

	// Handle array fields
	if field.Type == FieldTypeArray {
		if arrayValue, ok := value.([]interface{}); ok {
			for i, item := range arrayValue {
				if itemMap, ok := item.(map[string]interface{}); ok {
					for _, nestedField := range field.Nested {
						v.validateField(nestedField, itemMap, fmt.Sprintf("%s[%d]", fieldPath, i), result)
					}
				}
			}
		}
	}

	// Handle oneOf fields (exactly one nested field must be valid)
	if field.Type == FieldTypeOneOf {
		// Implementation would check that exactly one option is selected
	}

	// Handle anyOf fields (at least one nested field must be valid)
	if field.Type == FieldTypeAnyOf {
		// Implementation would check that at least one option is selected
	}
}

// applyValidationRule applies a specific validation rule to a value
func (v *Validator) applyValidationRule(rule *ValidationRule, value interface{}, field *Field, data map[string]interface{}) (bool, string) {
	switch rule.Type {
	case ValidationTypeRequired:
		return !v.isEmpty(value), rule.Message

	case ValidationTypeRequiredIf:
		// The parameters should be a Condition
		if condition, ok := rule.Parameters.(*Condition); ok {
			if v.evaluateCondition(condition, data) {
				return !v.isEmpty(value), rule.Message
			}
		}
		return true, ""

	case ValidationTypeMinLength:
		if str, ok := value.(string); ok {
			minLength, _ := rule.Parameters.(float64)
			return float64(len(str)) >= minLength, rule.Message
		}
		return false, rule.Message

	case ValidationTypeMaxLength:
		if str, ok := value.(string); ok {
			maxLength, _ := rule.Parameters.(float64)
			return float64(len(str)) <= maxLength, rule.Message
		}
		return false, rule.Message

	case ValidationTypePattern:
		if str, ok := value.(string); ok {
			pattern, _ := rule.Parameters.(string)
			re, err := regexp.Compile(pattern)
			if err != nil {
				return false, "Invalid pattern"
			}
			return re.MatchString(str), rule.Message
		}
		return false, rule.Message

	case ValidationTypeMin:
		if num, ok := value.(float64); ok {
			min, _ := rule.Parameters.(float64)
			return num >= min, rule.Message
		}
		if num, ok := value.(int); ok {
			min, _ := rule.Parameters.(float64)
			return float64(num) >= min, rule.Message
		}
		return false, rule.Message

	case ValidationTypeMax:
		if num, ok := value.(float64); ok {
			max, _ := rule.Parameters.(float64)
			return num <= max, rule.Message
		}
		if num, ok := value.(int); ok {
			max, _ := rule.Parameters.(float64)
			return float64(num) <= max, rule.Message
		}
		return false, rule.Message

	case ValidationTypeEmail:
		if str, ok := value.(string); ok {
			// Simple email regex - a production system would use a more comprehensive one
			re := regexp.MustCompile(`^[^@]+@[^@]+\.[^@]+$`)
			return re.MatchString(str), rule.Message
		}
		return false, rule.Message

	case ValidationTypeURL:
		if str, ok := value.(string); ok {
			// Simple URL regex - a production system would use a more comprehensive one
			re := regexp.MustCompile(`^(http|https)://[^\s/$.?#].[^\s]*$`)
			return re.MatchString(str), rule.Message
		}
		return false, rule.Message

	case ValidationTypeFileType:
		// Implementation would check file extension or MIME type
		return true, ""

	case ValidationTypeFileSize:
		// Implementation would check file size
		return true, ""

	case ValidationTypeImageDimensions:
		// Implementation would check image dimensions
		return true, ""

	case ValidationTypeDependency:
		// Implementation would check dependencies between fields
		return v.validateDependency(rule, field, data), rule.Message

	case ValidationTypeUnique:
		// Would typically require access to a data store to verify uniqueness
		return true, ""

	case ValidationTypeCustom:
		// Custom validation would be implemented by the application
		return true, ""

	default:
		return true, ""
	}
}

// validateDependency checks if a field's value satisfies a dependency rule
func (v *Validator) validateDependency(rule *ValidationRule, field *Field, data map[string]interface{}) bool {
	if params, ok := rule.Parameters.(map[string]interface{}); ok {
		dependsOn, _ := params["field"].(string)
		operator, _ := params["operator"].(string)
		expectedValue := params["value"]

		dependentValue := v.getValueByPath(data, dependsOn)

		switch operator {
		case "eq":
			return reflect.DeepEqual(dependentValue, expectedValue)
		case "neq":
			return !reflect.DeepEqual(dependentValue, expectedValue)
		case "gt":
			// Implementation for greater than
			return true
		case "lt":
			// Implementation for less than
			return true
		default:
			return false
		}
	}
	return false
}

// evaluateCondition evaluates a condition against form data
func (v *Validator) evaluateCondition(condition *Condition, data map[string]interface{}) bool {
	switch condition.Type {
	case ConditionTypeSimple:
		fieldValue := v.getValueByPath(data, condition.Field)
		switch condition.Operator {
		case "eq":
			return reflect.DeepEqual(fieldValue, condition.Value)
		case "neq":
			return !reflect.DeepEqual(fieldValue, condition.Value)
		case "contains":
			if str, ok := fieldValue.(string); ok {
				if valueStr, ok := condition.Value.(string); ok {
					return strings.Contains(str, valueStr)
				}
			}
			return false
		case "startsWith":
			if str, ok := fieldValue.(string); ok {
				if valueStr, ok := condition.Value.(string); ok {
					return strings.HasPrefix(str, valueStr)
				}
			}
			return false
		case "endsWith":
			if str, ok := fieldValue.(string); ok {
				if valueStr, ok := condition.Value.(string); ok {
					return strings.HasSuffix(str, valueStr)
				}
			}
			return false
		case "gt":
			if num, ok := fieldValue.(float64); ok {
				if valueNum, ok := condition.Value.(float64); ok {
					return num > valueNum
				}
			}
			return false
		case "gte":
			if num, ok := fieldValue.(float64); ok {
				if valueNum, ok := condition.Value.(float64); ok {
					return num >= valueNum
				}
			}
			return false
		case "lt":
			if num, ok := fieldValue.(float64); ok {
				if valueNum, ok := condition.Value.(float64); ok {
					return num < valueNum
				}
			}
			return false
		case "lte":
			if num, ok := fieldValue.(float64); ok {
				if valueNum, ok := condition.Value.(float64); ok {
					return num <= valueNum
				}
			}
			return false
		default:
			return false
		}

	case ConditionTypeAnd:
		for _, subCondition := range condition.Conditions {
			if !v.evaluateCondition(subCondition, data) {
				return false
			}
		}
		return true

	case ConditionTypeOr:
		for _, subCondition := range condition.Conditions {
			if v.evaluateCondition(subCondition, data) {
				return true
			}
		}
		return false

	case ConditionTypeNot:
		if len(condition.Conditions) > 0 {
			return !v.evaluateCondition(condition.Conditions[0], data)
		}
		return false

	case ConditionTypeExists:
		value := v.getValueByPath(data, condition.Field)
		return !v.isEmpty(value)

	case ConditionTypeExpression:
		// For expression evaluation, we would use a lightweight expression engine
		// This is simplified for demonstration
		return evaluateExpression(condition.Expression, data)

	default:
		return false
	}
}

// evaluateExpression evaluates a custom expression against form data
// This would typically use a specialized expression evaluation library
func evaluateExpression(expression string, data map[string]interface{}) bool {
	// Create environment
	env, _ := cel.NewEnv(
		cel.Variable("data", cel.MapType(cel.StringType, cel.DynType)),
	)

	// Parse and check expression
	parsed, issues := env.Parse(expression)
	if issues != nil && issues.Err() != nil {
		return false
	}

	checked, issues := env.Check(parsed)
	if issues != nil && issues.Err() != nil {
		return false
	}

	// Compile program
	program, err := env.Program(checked)
	if err != nil {
		return false
	}

	// Evaluate with data
	result, _, err := program.Eval(map[string]interface{}{
		"data": data,
	})

	if err != nil {
		return false
	}

	// Convert result to boolean
	boolResult, ok := result.Value().(bool)
	if !ok {
		return false
	}

	return boolResult
}

// isEmpty checks if a value is empty
func (v *Validator) isEmpty(value interface{}) bool {
	if value == nil {
		return true
	}

	reflectValue := reflect.ValueOf(value)

	// Check zero value based on type
	switch reflectValue.Kind() {
	case reflect.String:
		return reflectValue.String() == ""
	case reflect.Array, reflect.Slice, reflect.Map:
		return reflectValue.Len() == 0
	case reflect.Bool:
		return !reflectValue.Bool()
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return reflectValue.Int() == 0
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return reflectValue.Uint() == 0
	case reflect.Float32, reflect.Float64:
		return reflectValue.Float() == 0
	case reflect.Ptr, reflect.Interface:
		if reflectValue.IsNil() {
			return true
		}
		return v.isEmpty(reflectValue.Elem().Interface())
	default:
		return false
	}
}

// getValueByPath retrieves a value from nested maps using a dot notation path
func (v *Validator) getValueByPath(data map[string]interface{}, path string) interface{} {
	parts := strings.Split(path, ".")

	// Handle array indexing
	arrayRegex := regexp.MustCompile(`(.*)\[(\d+)\]$`)

	current := data
	for i, part := range parts {
		// Check if this part contains an array index
		matches := arrayRegex.FindStringSubmatch(part)
		if len(matches) > 0 {
			// It's an array access
			fieldName := matches[1]
			indexStr := matches[2]

			// Get the array
			var arr []interface{}
			if value, ok := current[fieldName]; ok {
				if typedArr, ok := value.([]interface{}); ok {
					arr = typedArr
				} else {
					return nil
				}
			} else {
				return nil
			}

			// Get the index
			var index int
			_, _ = fmt.Sscanf(indexStr, "%d", &index)

			// Check if the index is valid
			if index < 0 || index >= len(arr) {
				return nil
			}

			// If this is the last part, return the array element
			if i == len(parts)-1 {
				return arr[index]
			}

			// Otherwise, ensure the element is a map and continue
			if mapValue, ok := arr[index].(map[string]interface{}); ok {
				current = mapValue
			} else {
				return nil
			}
		} else {
			// Regular field access
			if i == len(parts)-1 {
				return current[part]
			}

			if next, ok := current[part]; ok {
				if nextMap, ok := next.(map[string]interface{}); ok {
					current = nextMap
				} else {
					return nil
				}
			} else {
				return nil
			}
		}
	}

	return nil
}
