package smartform

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/juicycleff/smartform/v1/template"
)

func (fs *FormSchema) GetOptionsFromFunction(source *DynamicSource, formState map[string]interface{}) ([]*Option, error) {
	if source.Type != "function" || source.FunctionName == "" {
		return nil, fmt.Errorf("not a valid function source")
	}

	// Build arguments map from parameters and formState
	args := make(map[string]interface{})
	if source.Parameters != nil {
		for k, v := range source.Parameters {
			// Check if value is a field reference
			if strVal, ok := v.(string); ok && strings.HasPrefix(strVal, "${") && strings.HasSuffix(strVal, "}") {
				fieldName := strVal[2 : len(strVal)-1]
				if fieldValue, ok := formState[fieldName]; ok {
					args[k] = fieldValue
				} else {
					args[k] = v
				}
			} else {
				args[k] = v
			}
		}
	}

	// Execute function
	result, err := fs.ExecuteDynamicFunction(source.FunctionName, args, formState)
	if err != nil {
		return nil, err
	}

	// Convert result to options
	return convertResultToOptions(result)
}

func (fs *FormSchema) GetTemplateExpressionSuggestions(partialExpr string) []*template.VariableSuggestion {
	templateEngine := template.NewTemplateEngine()
	templateEngine.SetVariableRegistry(fs.variableRegistry)
	return templateEngine.GetExpressionSuggestions(partialExpr)
}

// GetTemplateExpressionSuggestions Add this method to FormBuilder
func (fb *FormBuilder) GetTemplateExpressionSuggestions(partialExpr string) []*template.VariableSuggestion {
	return fb.schema.GetTemplateExpressionSuggestions(partialExpr)
}

func (fs *FormSchema) GetVariableSuggestions() []*template.VariableSuggestion {
	return fs.variableRegistry.GenerateVariableSuggestions()
}

// GetVariableList returns a list of all registered variables
func (fs *FormSchema) GetVariableList() []string {
	suggestions := fs.GetVariableSuggestions()
	variables := make([]string, 0)

	for _, s := range suggestions {
		if !s.IsFunction && !s.IsNested {
			variables = append(variables, s.Expr)
		}
	}

	return variables
}

// GetFunctionList returns a list of all available functions
func (fs *FormSchema) GetFunctionList() map[string]string {
	suggestions := fs.GetVariableSuggestions()
	functions := make(map[string]string)

	for _, s := range suggestions {
		if s.IsFunction {
			functions[s.Expr] = s.Signature
		}
	}

	return functions
}

// RegisterFunction function to register a function directly on the schema
func (fs *FormSchema) RegisterFunction(name string, fn DynamicFunction) {
	if fs.functions == nil {
		fs.functions = make(map[string]DynamicFunction)
	}
	fs.functions[name] = fn
}

// ExecuteDynamicFunction to check local functions first
func (fs *FormSchema) ExecuteDynamicFunction(functionName string, args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
	// First check if we have this function registered locally
	if fn, ok := fs.functions[functionName]; ok {
		return fn(args, formState)
	}

	// If we have a direct function in the source, use that
	if field := fs.findFieldWithFunctionName(functionName); field != nil {
		if field.Options != nil && field.Options.DynamicSource != nil {
			if field.Options.DynamicSource.DirectFunction != nil {
				return field.Options.DynamicSource.DirectFunction(args, formState)
			}
		}

		// Look for the function in all fields, not just matching name
		for _, f := range fs.Fields {
			if f.Options != nil && f.Options.DynamicSource != nil &&
				f.Options.DynamicSource.FunctionName == functionName &&
				f.Options.DynamicSource.DirectFunction != nil {
				return f.Options.DynamicSource.DirectFunction(args, formState)
			}
		}
	}

	// Fall back to implementation by client application
	return nil, fmt.Errorf("function %s not registered with schema", functionName)
}

// Helper to find a field with a specific function name
func (fs *FormSchema) findFieldWithFunctionName(functionName string) *Field {
	for _, field := range fs.Fields {
		if field.Options != nil && field.Options.DynamicSource != nil {
			if field.Options.DynamicSource.FunctionName == functionName {
				return field
			}
		}

		// Check nested fields
		if result := fs.findFieldWithFunctionNameInNested(field, functionName); result != nil {
			return result
		}
	}
	return nil
}

// Helper to find a function name in nested fields
func (fs *FormSchema) findFieldWithFunctionNameInNested(field *Field, functionName string) *Field {
	if field.Nested == nil {
		return nil
	}

	for _, nestedField := range field.Nested {
		if nestedField.Options != nil && nestedField.Options.DynamicSource != nil {
			if nestedField.Options.DynamicSource.FunctionName == functionName {
				return nestedField
			}
		}

		// Recursively check deeper nesting
		if result := fs.findFieldWithFunctionNameInNested(nestedField, functionName); result != nil {
			return result
		}
	}

	return nil
}

// Helper function to convert function result to options
func convertResultToOptions(result interface{}) ([]*Option, error) {
	// Handle different result types
	switch v := result.(type) {
	case []*Option:
		// Already the correct format
		return v, nil

	case []Option:
		// Convert to pointer slice
		options := make([]*Option, len(v))
		for i, opt := range v {
			option := opt // Create a copy to avoid issues with loop variable
			options[i] = &option
		}
		return options, nil

	case []map[string]interface{}:
		// Convert maps to options
		options := make([]*Option, len(v))
		for i, item := range v {
			value, hasValue := item["value"]
			label, hasLabel := item["label"]
			icon, _ := item["icon"].(string)

			if !hasValue {
				value = item
			}

			if !hasLabel {
				if labelField, ok := item["name"].(string); ok {
					label = labelField
				} else if labelField, ok := item["title"].(string); ok {
					label = labelField
				} else {
					label = fmt.Sprintf("%v", value)
				}
			}

			options[i] = &Option{
				Value: value,
				Label: fmt.Sprintf("%v", label),
				Icon:  icon,
			}
		}
		return options, nil

	case map[string]interface{}:
		// Convert map entries to options
		options := []*Option{}
		for key, value := range v {
			var label string

			switch val := value.(type) {
			case map[string]interface{}:
				if labelVal, ok := val["label"]; ok {
					label = fmt.Sprintf("%v", labelVal)
				} else if nameVal, ok := val["name"]; ok {
					label = fmt.Sprintf("%v", nameVal)
				} else {
					label = key
				}
				options = append(options, &Option{
					Value: key,
					Label: label,
				})
			default:
				options = append(options, &Option{
					Value: key,
					Label: fmt.Sprintf("%v", value),
				})
			}
		}
		return options, nil

	default:
		// Try to marshal and unmarshal as JSON
		jsonData, err := json.Marshal(result)
		if err != nil {
			return nil, fmt.Errorf("unsupported result type: %T", result)
		}

		var optionList []*Option
		if err := json.Unmarshal(jsonData, &optionList); err != nil {
			return nil, fmt.Errorf("failed to convert result to options: %v", err)
		}

		return optionList, nil
	}
}
