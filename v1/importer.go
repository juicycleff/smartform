package smartform

import (
	"encoding/json"
	"fmt"
)

func FormSchemaFromJSON(jsonStr string) (*FormSchema, error) {
	return NewJSONImporter().ImportJSON(jsonStr)
}

func FormSchemaFromMap(rawSchema map[string]interface{}) (*FormSchema, error) {
	return NewJSONImporter().convertToFormSchema(rawSchema)
}

// JSONImporter provides functionality to import JSON into form schemas
type JSONImporter struct{}

// NewJSONImporter creates a new JSON importer
func NewJSONImporter() *JSONImporter {
	return &JSONImporter{}
}

// ImportJSON imports a JSON string into a FormSchema
func (ji *JSONImporter) ImportJSON(jsonStr string) (*FormSchema, error) {
	var rawSchema map[string]interface{}

	// Parse the JSON string
	if err := json.Unmarshal([]byte(jsonStr), &rawSchema); err != nil {
		return nil, fmt.Errorf("failed to parse JSON: %w", err)
	}

	// Convert the raw map to FormSchema
	schema, err := ji.convertToFormSchema(rawSchema)
	if err != nil {
		return nil, err
	}

	return schema, nil
}

// convertToFormSchema converts a raw JSON map to a FormSchema
func (ji *JSONImporter) convertToFormSchema(rawSchema map[string]interface{}) (*FormSchema, error) {
	// Extract required properties
	id, ok := rawSchema["id"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'id' field")
	}

	title, ok := rawSchema["title"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'title' field")
	}

	// Create a new FormSchema
	schema := NewFormSchema(id, title)

	// Extract optional properties
	if description, ok := rawSchema["description"].(string); ok {
		schema.Description = description
	}

	// Extract form type
	if formTypeStr, ok := rawSchema["type"].(string); ok {
		schema.Type = FormType(formTypeStr)
	}

	// Extract auth type for auth forms
	if authTypeStr, ok := rawSchema["authType"].(string); ok {
		schema.AuthType = AuthStrategy(authTypeStr)
	}

	// Extract properties
	if props, ok := rawSchema["properties"].(map[string]interface{}); ok {
		schema.Properties = props
	}

	// Extract fields
	if fieldsRaw, ok := rawSchema["fields"].([]interface{}); ok {
		for _, fieldRaw := range fieldsRaw {
			if fieldMap, ok := fieldRaw.(map[string]interface{}); ok {
				field, err := ji.convertToField(fieldMap)
				if err != nil {
					return nil, err
				}
				schema.Fields = append(schema.Fields, field)
			}
		}
	}

	// Ensure fields have proper order
	schema.SortFields()

	return schema, nil
}

// convertToField converts a raw JSON map to a Field
func (ji *JSONImporter) convertToField(rawField map[string]interface{}) (*Field, error) {
	// Extract required properties
	id, ok := rawField["id"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'id' field in field definition")
	}

	typeStr, ok := rawField["type"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'type' field in field definition")
	}

	// Extract label (can be empty for some fields like hidden)
	label := ""
	if labelVal, ok := rawField["label"].(string); ok {
		label = labelVal
	}

	// Create a new field
	field := &Field{
		ID:         id,
		Type:       FieldType(typeStr),
		Label:      label,
		Properties: make(map[string]interface{}),
	}

	// Extract optional properties
	if requiredVal, ok := rawField["required"].(bool); ok {
		field.Required = requiredVal
	}

	if placeholder, ok := rawField["placeholder"].(string); ok {
		field.Placeholder = placeholder
	}

	if helpText, ok := rawField["helpText"].(string); ok {
		field.HelpText = helpText
	}

	if order, ok := rawField["order"].(float64); ok {
		field.Order = int(order)
	}

	// Extract default value
	if defaultValue, exists := rawField["defaultValue"]; exists {
		field.DefaultValue = defaultValue
	}

	// Extract properties
	if props, ok := rawField["properties"].(map[string]interface{}); ok {
		for k, v := range props {
			field.Properties[k] = v
		}
	}

	// Extract visibility condition
	if visibleRaw, ok := rawField["visible"].(map[string]interface{}); ok {
		condition, err := ji.convertToCondition(visibleRaw)
		if err != nil {
			return nil, err
		}
		field.Visible = condition
	}

	// Extract enabled condition
	if enabledRaw, ok := rawField["enabled"].(map[string]interface{}); ok {
		condition, err := ji.convertToCondition(enabledRaw)
		if err != nil {
			return nil, err
		}
		field.Enabled = condition
	}

	// Extract validation rules
	if rulesRaw, ok := rawField["validationRules"].([]interface{}); ok {
		for _, ruleRaw := range rulesRaw {
			if ruleMap, ok := ruleRaw.(map[string]interface{}); ok {
				rule, err := ji.convertToValidationRule(ruleMap)
				if err != nil {
					return nil, err
				}
				field.ValidationRules = append(field.ValidationRules, rule)
			}
		}
	}

	// Extract options
	if optionsRaw, ok := rawField["options"].(map[string]interface{}); ok {
		options, err := ji.convertToOptionsConfig(optionsRaw)
		if err != nil {
			return nil, err
		}
		field.Options = options
	}

	// Extract nested fields
	if nestedRaw, ok := rawField["nested"].([]interface{}); ok {
		for _, nestedFieldRaw := range nestedRaw {
			if nestedFieldMap, ok := nestedFieldRaw.(map[string]interface{}); ok {
				nestedField, err := ji.convertToField(nestedFieldMap)
				if err != nil {
					return nil, err
				}
				field.Nested = append(field.Nested, nestedField)
			}
		}
	}

	return field, nil
}

// convertToCondition converts a raw JSON map to a Condition
func (ji *JSONImporter) convertToCondition(rawCond map[string]interface{}) (*Condition, error) {
	// Extract condition type
	typeStr, ok := rawCond["type"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'type' field in condition")
	}

	condition := &Condition{
		Type: ConditionType(typeStr),
	}

	// Extract field
	if field, ok := rawCond["field"].(string); ok {
		condition.Field = field
	}

	// Extract operator
	if operator, ok := rawCond["operator"].(string); ok {
		condition.Operator = operator
	}

	// Extract value
	if value, exists := rawCond["value"]; exists {
		condition.Value = value
	}

	// Extract expression
	if expression, ok := rawCond["expression"].(string); ok {
		condition.Expression = expression
	}

	// Extract nested conditions
	if conditionsRaw, ok := rawCond["conditions"].([]interface{}); ok {
		for _, condRaw := range conditionsRaw {
			if condMap, ok := condRaw.(map[string]interface{}); ok {
				nestedCond, err := ji.convertToCondition(condMap)
				if err != nil {
					return nil, err
				}
				condition.Conditions = append(condition.Conditions, nestedCond)
			}
		}
	}

	return condition, nil
}

// convertToValidationRule converts a raw JSON map to a ValidationRule
func (ji *JSONImporter) convertToValidationRule(rawRule map[string]interface{}) (*ValidationRule, error) {
	// Extract rule type
	typeStr, ok := rawRule["type"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'type' field in validation rule")
	}

	// Extract message
	message, ok := rawRule["message"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'message' field in validation rule")
	}

	rule := &ValidationRule{
		Type:    ValidationType(typeStr),
		Message: message,
	}

	// Extract parameters
	if params, exists := rawRule["parameters"]; exists {
		rule.Parameters = params
	}

	return rule, nil
}

// convertToOptionsConfig converts a raw JSON map to an OptionsConfig
func (ji *JSONImporter) convertToOptionsConfig(rawOptions map[string]interface{}) (*OptionsConfig, error) {
	// Extract options type
	typeStr, ok := rawOptions["type"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'type' field in options config")
	}

	options := &OptionsConfig{
		Type: OptionsType(typeStr),
	}

	// Extract static options
	if staticRaw, ok := rawOptions["static"].([]interface{}); ok {
		for _, optRaw := range staticRaw {
			if optMap, ok := optRaw.(map[string]interface{}); ok {
				option, err := ji.convertToOption(optMap)
				if err != nil {
					return nil, err
				}
				options.Static = append(options.Static, option)
			}
		}
	}

	// Extract dynamic source
	if sourceRaw, ok := rawOptions["dynamicSource"].(map[string]interface{}); ok {
		source, err := ji.convertToDynamicSource(sourceRaw)
		if err != nil {
			return nil, err
		}
		options.DynamicSource = source
	}

	// Extract dependency
	if depRaw, ok := rawOptions["dependency"].(map[string]interface{}); ok {
		dependency, err := ji.convertToOptionsDependency(depRaw)
		if err != nil {
			return nil, err
		}
		options.Dependency = dependency
	}

	return options, nil
}

// convertToOption converts a raw JSON map to an Option
func (ji *JSONImporter) convertToOption(rawOpt map[string]interface{}) (*Option, error) {
	// Extract required properties
	if _, exists := rawOpt["value"]; !exists {
		return nil, fmt.Errorf("missing required 'value' field in option")
	}

	label, ok := rawOpt["label"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'label' field in option")
	}

	option := &Option{
		Value: rawOpt["value"],
		Label: label,
	}

	// Extract icon
	if icon, ok := rawOpt["icon"].(string); ok {
		option.Icon = icon
	}

	return option, nil
}

// convertToDynamicSource converts a raw JSON map to a DynamicSource
func (ji *JSONImporter) convertToDynamicSource(rawSource map[string]interface{}) (*DynamicSource, error) {
	// Extract source type
	typeStr, ok := rawSource["type"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'type' field in dynamic source")
	}

	source := &DynamicSource{
		Type: typeStr,
	}

	// Extract endpoint
	if endpoint, ok := rawSource["endpoint"].(string); ok {
		source.Endpoint = endpoint
	}

	// Extract method
	if method, ok := rawSource["method"].(string); ok {
		source.Method = method
	}

	// Extract value path
	if valuePath, ok := rawSource["valuePath"].(string); ok {
		source.ValuePath = valuePath
	}

	// Extract label path
	if labelPath, ok := rawSource["labelPath"].(string); ok {
		source.LabelPath = labelPath
	}

	// Extract headers
	if headersRaw, ok := rawSource["headers"].(map[string]interface{}); ok {
		source.Headers = make(map[string]string)
		for k, v := range headersRaw {
			if strVal, ok := v.(string); ok {
				source.Headers[k] = strVal
			}
		}
	}

	// Extract parameters
	if paramsRaw, ok := rawSource["parameters"].(map[string]interface{}); ok {
		source.Parameters = paramsRaw
	}

	// Extract refresh triggers
	if refreshRaw, ok := rawSource["refreshOn"].([]interface{}); ok {
		for _, fieldID := range refreshRaw {
			if strID, ok := fieldID.(string); ok {
				source.RefreshOn = append(source.RefreshOn, strID)
			}
		}
	}

	return source, nil
}

// convertToOptionsDependency converts a raw JSON map to an OptionsDependency
func (ji *JSONImporter) convertToOptionsDependency(rawDep map[string]interface{}) (*OptionsDependency, error) {
	// Extract field
	field, ok := rawDep["field"].(string)
	if !ok {
		return nil, fmt.Errorf("missing required 'field' field in options dependency")
	}

	dependency := &OptionsDependency{
		Field:    field,
		ValueMap: make(map[string][]*Option),
	}

	// Extract expression
	if expression, ok := rawDep["expression"].(string); ok {
		dependency.Expression = expression
	}

	// Extract value map
	if mapRaw, ok := rawDep["valueMap"].(map[string]interface{}); ok {
		for key, valuesRaw := range mapRaw {
			if optsArray, ok := valuesRaw.([]interface{}); ok {
				var options []*Option
				for _, optRaw := range optsArray {
					if optMap, ok := optRaw.(map[string]interface{}); ok {
						option, err := ji.convertToOption(optMap)
						if err != nil {
							return nil, err
						}
						options = append(options, option)
					}
				}
				dependency.ValueMap[key] = options
			}
		}
	}

	return dependency, nil
}
