package smartform

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/juicycleff/smartform/v1/template"
)

// FormRenderer converts form schemas to JSON representations for the frontend
type FormRenderer struct {
	schema         *FormSchema
	templateEngine *template.TemplateEngine
}

// NewFormRenderer creates a new form renderer
func NewFormRenderer(schema *FormSchema) *FormRenderer {
	return &FormRenderer{
		schema:         schema,
		templateEngine: template.NewTemplateEngine(),
	}
}

// RenderJSON converts the form schema to a JSON string
func (fr *FormRenderer) RenderJSON() (string, error) {
	data, err := json.MarshalIndent(fr.schema, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// RenderJSONWithContext renders the form with context-specific modifications
func (fr *FormRenderer) RenderJSONWithContext(context map[string]interface{}) (string, error) {
	// Create a copy of the schema to modify
	schemaCopy := fr.copySchemaWithContext(context)

	// Convert to JSON
	data, err := json.MarshalIndent(schemaCopy, "", "  ")
	if err != nil {
		return "", err
	}
	return string(data), nil
}

// copyFieldWithContext creates a context-aware copy of a field
func (fr *FormRenderer) copyFieldWithContext(field *Field, context map[string]interface{}) *Field {
	// Create a new field with the same basic properties
	fieldCopy := &Field{
		ID:              field.ID,
		Type:            field.Type,
		Label:           field.Label,
		Required:        field.Required,
		DefaultValue:    field.DefaultValue,
		Placeholder:     field.Placeholder,
		HelpText:        field.HelpText,
		Order:           field.Order,
		ValidationRules: make([]*ValidationRule, len(field.ValidationRules)),
		Properties:      make(map[string]interface{}),
		Nested:          []*Field{},
	}

	fieldCopy.Label = fr.evaluateTemplateString(field.Label, context)
	fieldCopy.Placeholder = fr.evaluateTemplateString(field.Placeholder, context)
	fieldCopy.HelpText = fr.evaluateTemplateString(field.HelpText, context)

	// Handle DefaultWhen conditions
	if field.DefaultWhen != nil && len(field.DefaultWhen) > 0 {
		validator := NewValidator(fr.schema)
		for _, defaultWhen := range field.DefaultWhen {
			if validator.evaluateCondition(defaultWhen.Condition, context) {
				// Evaluate the default value if it's a template expression
				if strValue, ok := defaultWhen.Value.(string); ok && fr.containsTemplateExpression(strValue) {
					evaluatedValue, err := fr.templateEngine.EvaluateExpression(strValue, context)
					if err == nil {
						fieldCopy.DefaultValue = evaluatedValue
					} else {
						fieldCopy.DefaultValue = defaultWhen.Value
					}
				} else {
					fieldCopy.DefaultValue = defaultWhen.Value
				}
				break
			}
		}
	} else if field.DefaultValue != nil {
		// Evaluate the default value if it's a template expression
		if strValue, ok := field.DefaultValue.(string); ok && fr.containsTemplateExpression(strValue) {
			evaluatedValue, err := fr.templateEngine.EvaluateExpression(strValue, context)
			if err == nil {
				fieldCopy.DefaultValue = evaluatedValue
			}
		}
	}

	// Handle requiredIf condition
	if field.RequiredIf != nil {
		fieldCopy.RequiredIf = fr.copyCondition(field.RequiredIf)
	}

	// Copy validation rules
	for i, rule := range field.ValidationRules {
		fieldCopy.ValidationRules[i] = &ValidationRule{
			Type:       rule.Type,
			Message:    rule.Message,
			Parameters: rule.Parameters,
		}
	}

	// Copy properties
	for k, v := range field.Properties {
		fieldCopy.Properties[k] = v
	}

	// Handle visibility condition
	if field.Visible != nil {
		fieldCopy.Visible = fr.copyCondition(field.Visible)
	}

	// Handle enablement condition
	if field.Enabled != nil {
		fieldCopy.Enabled = fr.copyCondition(field.Enabled)

		// Evaluate if field should be disabled in this context
		validator := NewValidator(fr.schema)
		if !validator.evaluateCondition(field.Enabled, context) {
			fieldCopy.Properties["disabled"] = true
		}
	}

	// Handle options for select-type fields
	if field.Options != nil {
		fieldCopy.Options = fr.copyOptionsWithContext(field.Options, context)
	}

	// Handle nested fields
	if field.Nested != nil {
		for _, nestedField := range field.Nested {
			// Skip nested fields that aren't visible in this context
			if nestedField.Visible != nil {
				validator := NewValidator(fr.schema)
				if !validator.evaluateCondition(nestedField.Visible, context) {
					continue
				}
			}

			nestedCopy := fr.copyFieldWithContext(nestedField, context)
			fieldCopy.Nested = append(fieldCopy.Nested, nestedCopy)
		}
	}

	return fieldCopy
}

// copySchemaWithContext creates a context-aware copy of the schema
func (fr *FormRenderer) copySchemaWithContext(context map[string]interface{}) *FormSchema {
	// Create a new schema with the same basic properties
	schemaCopy := &FormSchema{
		ID:          fr.schema.ID,
		Title:       fr.schema.Title,
		Description: fr.schema.Description,
		Fields:      []*Field{},
		Properties:  make(map[string]interface{}),
	}

	// Copy over properties
	for k, v := range fr.schema.Properties {
		schemaCopy.Properties[k] = v
	}

	// Process fields based on context
	for _, field := range fr.schema.Fields {
		// Skip fields that should not be visible in this context
		if field.Visible != nil {
			// Create a validator to evaluate the condition
			validator := NewValidator(fr.schema)
			if !validator.evaluateCondition(field.Visible, context) {
				continue
			}
		}

		// Include the field with possible context-specific modifications
		fieldCopy := fr.copyFieldWithContext(field, context)
		schemaCopy.Fields = append(schemaCopy.Fields, fieldCopy)
	}

	// Sort fields by order
	schemaCopy.SortFields()

	return schemaCopy
}

// copyCondition creates a copy of a condition
func (fr *FormRenderer) copyCondition(condition *Condition) *Condition {
	if condition == nil {
		return nil
	}

	conditionCopy := &Condition{
		Type:       condition.Type,
		Field:      condition.Field,
		Value:      condition.Value,
		Operator:   condition.Operator,
		Expression: condition.Expression,
	}

	// Copy nested conditions
	if condition.Conditions != nil {
		conditionCopy.Conditions = make([]*Condition, len(condition.Conditions))
		for i, subCondition := range condition.Conditions {
			conditionCopy.Conditions[i] = fr.copyCondition(subCondition)
		}
	}

	return conditionCopy
}

// copyOptionsWithContext creates a context-aware copy of field options
func (fr *FormRenderer) copyOptionsWithContext(options *OptionsConfig, context map[string]interface{}) *OptionsConfig {
	if options == nil {
		return nil
	}

	optionsCopy := &OptionsConfig{
		Type: options.Type,
	}

	// Copy static options
	if options.Static != nil {
		optionsCopy.Static = make([]*Option, len(options.Static))
		for i, option := range options.Static {
			optionsCopy.Static[i] = &Option{
				Value: option.Value,
				Label: option.Label,
				Icon:  option.Icon,
			}
		}
	}

	// Handle dynamic options source
	if options.DynamicSource != nil {
		optionsCopy.DynamicSource = &DynamicSource{
			Type:      options.DynamicSource.Type,
			Endpoint:  options.DynamicSource.Endpoint,
			Method:    options.DynamicSource.Method,
			ValuePath: options.DynamicSource.ValuePath,
			LabelPath: options.DynamicSource.LabelPath,
			RefreshOn: make([]string, len(options.DynamicSource.RefreshOn)),
		}

		// Copy refresh triggers
		copy(optionsCopy.DynamicSource.RefreshOn, options.DynamicSource.RefreshOn)

		// Copy headers
		if options.DynamicSource.Headers != nil {
			optionsCopy.DynamicSource.Headers = make(map[string]string)
			for k, v := range options.DynamicSource.Headers {
				optionsCopy.DynamicSource.Headers[k] = v
			}
		}

		// Copy parameters
		if options.DynamicSource.Parameters != nil {
			optionsCopy.DynamicSource.Parameters = make(map[string]interface{})
			for k, v := range options.DynamicSource.Parameters {
				optionsCopy.DynamicSource.Parameters[k] = v
			}
		}
	}

	// Handle dependent options
	if options.Dependency != nil {
		// Process dependent options based on context
		dependentField := options.Dependency.Field
		dependentValue := fr.getValueFromContext(context, dependentField)

		optionsCopy.Dependency = &OptionsDependency{
			Field: dependentField,
		}

		// Copy value map
		if options.Dependency.ValueMap != nil {
			optionsCopy.Dependency.ValueMap = make(map[string][]*Option)
			for k, v := range options.Dependency.ValueMap {
				optsCopy := make([]*Option, len(v))
				for i, opt := range v {
					optsCopy[i] = &Option{
						Value: opt.Value,
						Label: opt.Label,
						Icon:  opt.Icon,
					}
				}
				optionsCopy.Dependency.ValueMap[k] = optsCopy
			}

			// Filter options based on dependent field value
			if dependentValue != nil {
				valueStr := fmt.Sprintf("%v", dependentValue)
				if filteredOptions, ok := options.Dependency.ValueMap[valueStr]; ok {
					optionsCopy.Static = make([]*Option, len(filteredOptions))
					for i, opt := range filteredOptions {
						optionsCopy.Static[i] = &Option{
							Value: opt.Value,
							Label: opt.Label,
							Icon:  opt.Icon,
						}
					}
				}
			}
		}
	}

	return optionsCopy
}

// getValueFromContext gets a value from the context using dot notation
func (fr *FormRenderer) getValueFromContext(context map[string]interface{}, path string) interface{} {
	validator := NewValidator(fr.schema)
	return validator.getValueByPath(context, path)
}

// evaluateTemplateString evaluates a string that may contain template expressions
func (fr *FormRenderer) evaluateTemplateString(input string, context map[string]interface{}) string {
	if input == "" || !fr.containsTemplateExpression(input) {
		return input
	}

	result, err := fr.templateEngine.EvaluateExpressionAsString(input, context)
	if err != nil {
		return input
	}
	return result
}

// containsTemplateExpression checks if a string contains template expressions
func (fr *FormRenderer) containsTemplateExpression(input string) bool {
	return strings.Contains(input, "${")
}
