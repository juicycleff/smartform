package smartform

// FieldBuilder provides a fluent API for creating form fields
type FieldBuilder struct {
	field *Field
}

// NewFieldBuilder creates a new field builder
func NewFieldBuilder(id string, fieldType FieldType, label string) *FieldBuilder {
	return &FieldBuilder{
		field: &Field{
			ID:         id,
			Type:       fieldType,
			Label:      label,
			Required:   false,
			Properties: make(map[string]interface{}),
		},
	}
}

// Required marks the field as required
func (fb *FieldBuilder) Required(required bool) *FieldBuilder {
	fb.field.Required = required
	return fb
}

// Placeholder sets the field placeholder text
func (fb *FieldBuilder) Placeholder(placeholder string) *FieldBuilder {
	fb.field.Placeholder = placeholder
	return fb
}

// HelpText sets the field help text
func (fb *FieldBuilder) HelpText(helpText string) *FieldBuilder {
	fb.field.HelpText = helpText
	return fb
}

// DefaultValue sets the field default value
func (fb *FieldBuilder) DefaultValue(value interface{}) *FieldBuilder {
	fb.field.DefaultValue = value
	return fb
}

// Order sets the field order
func (fb *FieldBuilder) Order(order int) *FieldBuilder {
	fb.field.Order = order
	return fb
}

// Property sets a custom property on the field
func (fb *FieldBuilder) Property(key string, value interface{}) *FieldBuilder {
	fb.field.Properties[key] = value
	return fb
}

// VisibleWhen sets visibility condition for the field
func (fb *FieldBuilder) VisibleWhen(condition *Condition) *FieldBuilder {
	fb.field.Visible = condition
	return fb
}

// VisibleWhenEquals makes the field visible when another field equals a value
func (fb *FieldBuilder) VisibleWhenEquals(fieldID string, value interface{}) *FieldBuilder {
	fb.field.Visible = &Condition{
		Type:     ConditionTypeSimple,
		Field:    fieldID,
		Operator: "eq",
		Value:    value,
	}
	return fb
}

// VisibleWhenNotEquals makes the field visible when another field doesn't equal a value
func (fb *FieldBuilder) VisibleWhenNotEquals(fieldID string, value interface{}) *FieldBuilder {
	fb.field.Visible = &Condition{
		Type:     ConditionTypeSimple,
		Field:    fieldID,
		Operator: "neq",
		Value:    value,
	}
	return fb
}

// VisibleWhenGreaterThan makes the field visible when another field is greater than a value
func (fb *FieldBuilder) VisibleWhenGreaterThan(fieldID string, value interface{}) *FieldBuilder {
	fb.field.Visible = &Condition{
		Type:     ConditionTypeSimple,
		Field:    fieldID,
		Operator: "gt",
		Value:    value,
	}
	return fb
}

// VisibleWhenLessThan makes the field visible when another field is less than a value
func (fb *FieldBuilder) VisibleWhenLessThan(fieldID string, value interface{}) *FieldBuilder {
	fb.field.Visible = &Condition{
		Type:     ConditionTypeSimple,
		Field:    fieldID,
		Operator: "lt",
		Value:    value,
	}
	return fb
}

// VisibleWhenExists makes the field visible when another field exists and is not empty
func (fb *FieldBuilder) VisibleWhenExists(fieldID string) *FieldBuilder {
	fb.field.Visible = &Condition{
		Type:  ConditionTypeExists,
		Field: fieldID,
	}
	return fb
}

// VisibleWhenAllMatch makes the field visible when all specified conditions match
func (fb *FieldBuilder) VisibleWhenAllMatch(conditions ...*Condition) *FieldBuilder {
	fb.field.Visible = &Condition{
		Type:       ConditionTypeAnd,
		Conditions: conditions,
	}
	return fb
}

// VisibleWhenAnyMatch makes the field visible when any of the specified conditions match
func (fb *FieldBuilder) VisibleWhenAnyMatch(conditions ...*Condition) *FieldBuilder {
	fb.field.Visible = &Condition{
		Type:       ConditionTypeOr,
		Conditions: conditions,
	}
	return fb
}

// VisibleWithExpression makes the field visible based on a custom expression
func (fb *FieldBuilder) VisibleWithExpression(expression string) *FieldBuilder {
	fb.field.Visible = &Condition{
		Type:       ConditionTypeExpression,
		Expression: expression,
	}
	return fb
}

// EnabledWhen sets enablement condition for the field
func (fb *FieldBuilder) EnabledWhen(condition *Condition) *FieldBuilder {
	fb.field.Enabled = condition
	return fb
}

// EnabledWhenEquals makes the field enabled when another field equals a value
func (fb *FieldBuilder) EnabledWhenEquals(fieldID string, value interface{}) *FieldBuilder {
	fb.field.Enabled = &Condition{
		Type:     ConditionTypeSimple,
		Field:    fieldID,
		Operator: "eq",
		Value:    value,
	}
	return fb
}

// EnabledWhenNotEquals makes the field enabled when another field doesn't equal a value
func (fb *FieldBuilder) EnabledWhenNotEquals(fieldID string, value interface{}) *FieldBuilder {
	fb.field.Enabled = &Condition{
		Type:     ConditionTypeSimple,
		Field:    fieldID,
		Operator: "neq",
		Value:    value,
	}
	return fb
}

// EnabledWhenExists makes the field enabled when another field exists and is not empty
func (fb *FieldBuilder) EnabledWhenExists(fieldID string) *FieldBuilder {
	fb.field.Enabled = &Condition{
		Type:  ConditionTypeExists,
		Field: fieldID,
	}
	return fb
}

// AddValidation adds a validation rule to the field
func (fb *FieldBuilder) AddValidation(rule *ValidationRule) *FieldBuilder {
	if fb.field.ValidationRules == nil {
		fb.field.ValidationRules = []*ValidationRule{}
	}
	fb.field.ValidationRules = append(fb.field.ValidationRules, rule)
	return fb
}

// ValidateRequired adds a required validation rule
func (fb *FieldBuilder) ValidateRequired(message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:    ValidationTypeRequired,
		Message: message,
	})
}

// ValidateMinLength adds a minimum length validation rule
func (fb *FieldBuilder) ValidateMinLength(min float64, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeMinLength,
		Message:    message,
		Parameters: min,
	})
}

// ValidateMaxLength adds a maximum length validation rule
func (fb *FieldBuilder) ValidateMaxLength(max float64, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeMaxLength,
		Message:    message,
		Parameters: max,
	})
}

// ValidatePattern adds a pattern validation rule
func (fb *FieldBuilder) ValidatePattern(pattern string, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypePattern,
		Message:    message,
		Parameters: pattern,
	})
}

// ValidateMin adds a minimum value validation rule
func (fb *FieldBuilder) ValidateMin(min float64, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeMin,
		Message:    message,
		Parameters: min,
	})
}

// ValidateMax adds a maximum value validation rule
func (fb *FieldBuilder) ValidateMax(max float64, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeMax,
		Message:    message,
		Parameters: max,
	})
}

// ValidateEmail adds an email validation rule
func (fb *FieldBuilder) ValidateEmail(message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:    ValidationTypeEmail,
		Message: message,
	})
}

// ValidateURL adds a URL validation rule
func (fb *FieldBuilder) ValidateURL(message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:    ValidationTypeURL,
		Message: message,
	})
}

// ValidateFileType adds a file type validation rule
func (fb *FieldBuilder) ValidateFileType(allowedTypes []string, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeFileType,
		Message:    message,
		Parameters: allowedTypes,
	})
}

// ValidateFileSize adds a file size validation rule
func (fb *FieldBuilder) ValidateFileSize(maxSize float64, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeFileSize,
		Message:    message,
		Parameters: maxSize,
	})
}

// ValidateImageDimensions adds an image dimensions validation rule
func (fb *FieldBuilder) ValidateImageDimensions(dimensions map[string]interface{}, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeImageDimensions,
		Message:    message,
		Parameters: dimensions,
	})
}

// ValidateDependency adds a field dependency validation rule
func (fb *FieldBuilder) ValidateDependency(dependency map[string]interface{}, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeDependency,
		Message:    message,
		Parameters: dependency,
	})
}

// ValidateUnique adds a uniqueness validation rule
func (fb *FieldBuilder) ValidateUnique(message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:    ValidationTypeUnique,
		Message: message,
	})
}

// ValidateCustom adds a custom validation rule
func (fb *FieldBuilder) ValidateCustom(params map[string]interface{}, message string) *FieldBuilder {
	return fb.AddValidation(&ValidationRule{
		Type:       ValidationTypeCustom,
		Message:    message,
		Parameters: params,
	})
}

// WithStaticOptions adds static options to the field
func (fb *FieldBuilder) WithStaticOptions(options []*Option) *FieldBuilder {
	fb.field.Options = &OptionsConfig{
		Type:   OptionsTypeStatic,
		Static: options,
	}
	return fb
}

// WithDynamicOptions adds dynamic options to the field
func (fb *FieldBuilder) WithDynamicOptions(source *DynamicSource) *FieldBuilder {
	fb.field.Options = &OptionsConfig{
		Type:          OptionsTypeDynamic,
		DynamicSource: source,
	}
	return fb
}

// WithDynamicFunction adds a dynamic function to the field
func (fb *FieldBuilder) WithDynamicFunction(functionName string) *DynamicFunctionBuilder {
	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config in field properties
	fb.field.Properties["dynamicFunction"] = config

	// Return a builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: fb,
		config:       config,
	}
}

// HasDynamicFunction checks if the field has a dynamic function
func (fb *FieldBuilder) HasDynamicFunction() bool {
	_, ok := fb.field.Properties["dynamicFunction"]
	return ok
}

// GetDynamicFunctionConfig gets the dynamic function config for the field
func (fb *FieldBuilder) GetDynamicFunctionConfig() *DynamicFieldConfig {
	config, ok := fb.field.Properties["dynamicFunction"].(*DynamicFieldConfig)
	if !ok {
		return nil
	}
	return config
}

// DynamicFunctionBuilder provides a fluent API for configuring dynamic functions
type DynamicFunctionBuilder struct {
	fieldBuilder *FieldBuilder
	config       *DynamicFieldConfig
}

// WithArgument adds an argument to the dynamic function
func (dfb *DynamicFunctionBuilder) WithArgument(name string, value interface{}) *DynamicFunctionBuilder {
	dfb.config.Arguments[name] = value
	return dfb
}

// WithArguments adds multiple arguments to the dynamic function
func (dfb *DynamicFunctionBuilder) WithArguments(args map[string]interface{}) *DynamicFunctionBuilder {
	for name, value := range args {
		dfb.config.Arguments[name] = value
	}
	return dfb
}

// WithFieldReference adds a field reference as an argument
func (dfb *DynamicFunctionBuilder) WithFieldReference(argName string, fieldId string) *DynamicFunctionBuilder {
	dfb.config.Arguments[argName] = "${" + fieldId + "}"
	return dfb
}

// WithTransformer adds a data transformer to the dynamic function
func (dfb *DynamicFunctionBuilder) WithTransformer(transformerName string) *DynamicFunctionBuilder {
	dfb.config.TransformerName = transformerName
	dfb.config.TransformerParams = make(map[string]interface{})
	return dfb
}

// WithTransformerParam adds a parameter to the transformer
func (dfb *DynamicFunctionBuilder) WithTransformerParam(name string, value interface{}) *DynamicFunctionBuilder {
	if dfb.config.TransformerParams == nil {
		dfb.config.TransformerParams = make(map[string]interface{})
	}
	dfb.config.TransformerParams[name] = value
	return dfb
}

// End returns to the field builder
func (dfb *DynamicFunctionBuilder) End() *FieldBuilder {
	return dfb.fieldBuilder
}

// Now let's extend the OptionsBuilder to support dynamic functions

// WithFunctionOptions configures options to come from a dynamic function
func (dob *DynamicOptionsBuilder) WithFunctionOptions(functionName string) *DynamicOptionsFunctionBuilder {
	dob.config.DynamicSource.Type = "function"

	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config in dynamic source parameters
	if dob.config.DynamicSource.Parameters == nil {
		dob.config.DynamicSource.Parameters = make(map[string]interface{})
	}
	dob.config.DynamicSource.Parameters["dynamicFunction"] = config

	// Return a builder for configuring the dynamic function
	return &DynamicOptionsFunctionBuilder{
		DynamicOptionsBuilder: dob,
		config:                config,
	}
}

// DynamicOptionsFunctionBuilder provides a fluent API for configuring dynamic function options
type DynamicOptionsFunctionBuilder struct {
	*DynamicOptionsBuilder
	config *DynamicFieldConfig
}

// WithArgument adds an argument to the dynamic function
func (dofb *DynamicOptionsFunctionBuilder) WithArgument(name string, value interface{}) *DynamicOptionsFunctionBuilder {
	dofb.config.Arguments[name] = value
	return dofb
}

// WithArguments adds multiple arguments to the dynamic function
func (dofb *DynamicOptionsFunctionBuilder) WithArguments(args map[string]interface{}) *DynamicOptionsFunctionBuilder {
	for name, value := range args {
		dofb.config.Arguments[name] = value
	}
	return dofb
}

// WithFieldReference adds a field reference as an argument
func (dofb *DynamicOptionsFunctionBuilder) WithFieldReference(argName string, fieldId string) *DynamicOptionsFunctionBuilder {
	dofb.config.Arguments[argName] = "${" + fieldId + "}"
	return dofb
}

// WithTransformer adds a data transformer to the dynamic function
func (dofb *DynamicOptionsFunctionBuilder) WithTransformer(transformerName string) *DynamicOptionsFunctionBuilder {
	dofb.config.TransformerName = transformerName
	dofb.config.TransformerParams = make(map[string]interface{})
	return dofb
}

// WithTransformerParam adds a parameter to the transformer
func (dofb *DynamicOptionsFunctionBuilder) WithTransformerParam(name string, value interface{}) *DynamicOptionsFunctionBuilder {
	if dofb.config.TransformerParams == nil {
		dofb.config.TransformerParams = make(map[string]interface{})
	}
	dofb.config.TransformerParams[name] = value
	return dofb
}

// WithSearchSupport enables search and filtering for the options
func (dofb *DynamicOptionsFunctionBuilder) WithSearchSupport() *DynamicOptionsFunctionBuilder {
	if dofb.config.TransformerParams == nil {
		dofb.config.TransformerParams = make(map[string]interface{})
	}
	dofb.config.TransformerParams["enableSearch"] = true
	return dofb
}

// WithFilterableFields specifies which fields can be filtered
func (dofb *DynamicOptionsFunctionBuilder) WithFilterableFields(fields ...string) *DynamicOptionsFunctionBuilder {
	if dofb.config.TransformerParams == nil {
		dofb.config.TransformerParams = make(map[string]interface{})
	}
	dofb.config.TransformerParams["filterableFields"] = fields
	return dofb
}

// WithSortableFields specifies which fields can be sorted
func (dofb *DynamicOptionsFunctionBuilder) WithSortableFields(fields ...string) *DynamicOptionsFunctionBuilder {
	if dofb.config.TransformerParams == nil {
		dofb.config.TransformerParams = make(map[string]interface{})
	}
	dofb.config.TransformerParams["sortableFields"] = fields
	return dofb
}

// WithPagination enables pagination for the options
func (dofb *DynamicOptionsFunctionBuilder) WithPagination(defaultLimit int) *DynamicOptionsFunctionBuilder {
	if dofb.config.TransformerParams == nil {
		dofb.config.TransformerParams = make(map[string]interface{})
	}
	dofb.config.TransformerParams["enablePagination"] = true
	dofb.config.TransformerParams["defaultLimit"] = defaultLimit
	return dofb
}

// End returns to the dynamic options builder
func (dofb *DynamicOptionsFunctionBuilder) End() *DynamicOptionsBuilder {
	return dofb.DynamicOptionsBuilder
}

// Now let's add extensions for specific field types that can use dynamic functions

// DynamicValue adds a dynamic value calculation to the field
func (fb *FieldBuilder) DynamicValue(functionName string) *DynamicFunctionBuilder {
	fb.field.Properties["dynamicValue"] = true
	return fb.WithDynamicFunction(functionName)
}

// DynamicValidation adds a dynamic validation rule to the field
func (fb *FieldBuilder) DynamicValidation(
	functionName string,
	message string,
) *DynamicFunctionBuilder {
	// Create the dynamic function config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Add validation rule
	fb.AddValidation(&ValidationRule{
		Type:    ValidationTypeCustom,
		Message: message,
		Parameters: map[string]interface{}{
			"dynamicFunction": config,
		},
	})

	// Return builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: fb,
		config:       config,
	}
}

// AutocompleteField adds autocomplete functionality to text fields
func (fb *FieldBuilder) AutocompleteField(functionName string) *DynamicFunctionBuilder {
	if fb.field.Type != FieldTypeText &&
		fb.field.Type != FieldTypeEmail &&
		fb.field.Type != FieldTypePassword {
		// Only applicable to text-like fields
		return nil
	}

	fb.field.Properties["autocomplete"] = true

	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config
	fb.field.Properties["autocompleteFunction"] = config

	// Return builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: fb,
		config:       config,
	}
}

// LiveSearch adds live search capability to a field
func (fb *FieldBuilder) LiveSearch(functionName string) *DynamicFunctionBuilder {
	fb.field.Properties["liveSearch"] = true

	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config
	fb.field.Properties["searchFunction"] = config

	// Return builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: fb,
		config:       config,
	}
}

// DataSource sets a dynamic data source for the field
func (fb *FieldBuilder) DataSource(functionName string) *DynamicFunctionBuilder {
	fb.field.Properties["dataSource"] = true

	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config
	fb.field.Properties["dataSourceFunction"] = config

	// Return builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: fb,
		config:       config,
	}
}

// Formatter adds a dynamic formatter to the field
func (fb *FieldBuilder) Formatter(functionName string) *DynamicFunctionBuilder {
	fb.field.Properties["formatter"] = true

	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config
	fb.field.Properties["formatterFunction"] = config

	// Return builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: fb,
		config:       config,
	}
}

// Parser adds a dynamic parser to the field
func (fb *FieldBuilder) Parser(functionName string) *DynamicFunctionBuilder {
	fb.field.Properties["parser"] = true

	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config
	fb.field.Properties["parserFunction"] = config

	// Return builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: fb,
		config:       config,
	}
}

// WithDependentOptions adds dependent options to the field
func (fb *FieldBuilder) WithDependentOptions(dependentField string, valueMap map[string][]*Option) *FieldBuilder {
	fb.field.Options = &OptionsConfig{
		Type: OptionsTypeDependent,
		Dependency: &OptionsDependency{
			Field:    dependentField,
			ValueMap: valueMap,
		},
	}
	return fb
}

// AddOption adds a single option to the field (creates static options if not already set)
func (fb *FieldBuilder) AddOption(value interface{}, label string) *FieldBuilder {
	option := &Option{Value: value, Label: label}

	if fb.field.Options == nil {
		fb.field.Options = &OptionsConfig{
			Type:   OptionsTypeStatic,
			Static: []*Option{option},
		}
	} else if fb.field.Options.Type == OptionsTypeStatic {
		fb.field.Options.Static = append(fb.field.Options.Static, option)
	} else {
		// Convert to static options if it was another type
		fb.field.Options = &OptionsConfig{
			Type:   OptionsTypeStatic,
			Static: []*Option{option},
		}
	}

	return fb
}

// AddOptions adds multiple options to the field (creates static options if not already set)
func (fb *FieldBuilder) AddOptions(options ...*Option) *FieldBuilder {
	if fb.field.Options == nil {
		fb.field.Options = &OptionsConfig{
			Type:   OptionsTypeStatic,
			Static: options,
		}
	} else if fb.field.Options.Type == OptionsTypeStatic {
		fb.field.Options.Static = append(fb.field.Options.Static, options...)
	} else {
		// Convert to static options if it was another type
		fb.field.Options = &OptionsConfig{
			Type:   OptionsTypeStatic,
			Static: options,
		}
	}

	return fb
}

// WithOptionsFromAPI adds dynamic options from an API endpoint
func (fb *FieldBuilder) WithOptionsFromAPI(endpoint, method, valuePath, labelPath string) *FieldBuilder {
	source := &DynamicSource{
		Type:      "api",
		Endpoint:  endpoint,
		Method:    method,
		ValuePath: valuePath,
		LabelPath: labelPath,
	}

	return fb.WithDynamicOptions(source)
}

// WithOptionsRefreshingOn adds refresh triggers to dynamic options
func (fb *FieldBuilder) WithOptionsRefreshingOn(fieldIDs ...string) *FieldBuilder {
	if fb.field.Options != nil && fb.field.Options.DynamicSource != nil {
		fb.field.Options.DynamicSource.RefreshOn = fieldIDs
	}
	return fb
}

// WithDynamicOptionsConfig adds dynamic options from a config to the field
func (fb *FieldBuilder) WithDynamicOptionsConfig(config *OptionsConfig) *FieldBuilder {
	if config.Type == OptionsTypeDynamic && config.DynamicSource != nil {
		fb.field.Options = &OptionsConfig{
			Type:          OptionsTypeDynamic,
			DynamicSource: config.DynamicSource,
		}
	} else {
		// Handle error or default case
		fb.field.Options = config
	}
	return fb
}

// Build finalizes and returns the field
func (fb *FieldBuilder) Build() *Field {
	return fb.field
}
