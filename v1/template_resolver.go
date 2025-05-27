package smartform

import (
	"fmt"
	"reflect"
	"strings"
	"sync"

	"github.com/juicycleff/smartform/v1/template"
)

// TemplateResolver handles resolving template expressions in form data and configurations
type TemplateResolver struct {
	schema         *FormSchema
	templateEngine *template.TemplateEngine
	resolving      map[string]bool // Track circular dependencies
	mutex          sync.RWMutex
}

// ResolutionContext provides context for template resolution
type ResolutionContext struct {
	FormData        map[string]interface{} // Current form data
	FieldContext    map[string]interface{} // Context specific to current field
	GlobalVariables map[string]interface{} // Additional global variables
	ResolutionPath  []string               // Track resolution path for circular dependency detection
	Options         *ResolutionOptions     // Resolution options
}

// ResolutionOptions configures how template resolution behaves
type ResolutionOptions struct {
	StrictMode      bool   // If true, errors on unresolved variables
	DefaultOnError  string // Default value when resolution fails
	MaxDepth        int    // Maximum resolution depth (default: 10)
	PreserveNulls   bool   // If true, preserve null values instead of converting to strings
	EnableRecursion bool   // If true, allow recursive resolution of resolved values
}

// ResolutionResult holds the result of template resolution
type ResolutionResult struct {
	Value    interface{}
	Resolved bool
	Error    error
}

// NewTemplateResolver creates a new template resolver for the given form schema
func NewTemplateResolver(schema *FormSchema) *TemplateResolver {
	return &TemplateResolver{
		schema:         schema,
		templateEngine: template.NewTemplateEngine(),
		resolving:      make(map[string]bool),
	}
}

// GetTemplateResolver returns a template resolver for the form schema
func (fs *FormSchema) GetTemplateResolver() *TemplateResolver {
	resolver := NewTemplateResolver(fs)

	// Set the variable registry from the form schema
	resolver.templateEngine.SetVariableRegistry(fs.variableRegistry)

	// Also ensure the template engine's registry has all the variables
	// by copying them to be absolutely sure
	if fs.variableRegistry != nil {
		allVars := fs.variableRegistry.GetVariables()
		templateEngineRegistry := resolver.templateEngine.GetVariableRegistry()
		for key, value := range allVars {
			templateEngineRegistry.RegisterVariable(key, value)
		}
	}

	return resolver
}

// ResolveFormData resolves all template expressions in form data
func (tr *TemplateResolver) ResolveFormData(data map[string]interface{}, options ...*ResolutionOptions) map[string]interface{} {
	opts := tr.getOptions(options...)

	context := &ResolutionContext{
		FormData:        data,
		FieldContext:    make(map[string]interface{}),
		GlobalVariables: make(map[string]interface{}),
		ResolutionPath:  []string{},
		Options:         opts,
	}

	// Create a copy of the data to avoid modifying the original
	resolved := tr.deepCopyMap(data)

	// Resolve all values in the copied data
	tr.resolveMapValues(resolved, context)

	return resolved
}

// ResolveFieldValue resolves template expressions in a single field value
func (tr *TemplateResolver) ResolveFieldValue(fieldID string, value interface{}, formData map[string]interface{}, options ...*ResolutionOptions) *ResolutionResult {
	opts := tr.getOptions(options...)

	context := &ResolutionContext{
		FormData:        formData,
		FieldContext:    map[string]interface{}{"currentField": fieldID},
		GlobalVariables: make(map[string]interface{}),
		ResolutionPath:  []string{fieldID},
		Options:         opts,
	}

	resolvedValue, err := tr.resolveValue(value, context)

	return &ResolutionResult{
		Value:    resolvedValue,
		Resolved: err == nil,
		Error:    err,
	}
}

// ResolveFieldConfiguration resolves template expressions in field configuration
func (tr *TemplateResolver) ResolveFieldConfiguration(field *Field, formData map[string]interface{}, options ...*ResolutionOptions) *Field {
	opts := tr.getOptions(options...)

	context := &ResolutionContext{
		FormData:        formData,
		FieldContext:    map[string]interface{}{"currentField": field.ID, "fieldType": string(field.Type)},
		GlobalVariables: make(map[string]interface{}),
		ResolutionPath:  []string{"field_config", field.ID},
		Options:         opts,
	}

	// Create a copy of the field to avoid modifying the original
	resolvedField := tr.copyField(field)

	// Resolve field properties
	if label, err := tr.resolveValue(resolvedField.Label, context); err == nil {
		if labelStr, ok := label.(string); ok {
			resolvedField.Label = labelStr
		}
	}

	if placeholder, err := tr.resolveValue(resolvedField.Placeholder, context); err == nil {
		if placeholderStr, ok := placeholder.(string); ok {
			resolvedField.Placeholder = placeholderStr
		}
	}

	if helpText, err := tr.resolveValue(resolvedField.HelpText, context); err == nil {
		if helpTextStr, ok := helpText.(string); ok {
			resolvedField.HelpText = helpTextStr
		}
	}

	// Resolve default value
	if defaultValue, err := tr.resolveValue(resolvedField.DefaultValue, context); err == nil {
		resolvedField.DefaultValue = defaultValue
	}

	// Resolve properties
	if resolvedField.Properties != nil {
		resolvedProperties := make(map[string]interface{})
		for key, value := range resolvedField.Properties {
			if resolvedValue, err := tr.resolveValue(value, context); err == nil {
				resolvedProperties[key] = resolvedValue
			} else {
				resolvedProperties[key] = value
			}
		}
		resolvedField.Properties = resolvedProperties
	}

	return resolvedField
}

// ResolveDefaultValues resolves default values for all fields
func (tr *TemplateResolver) ResolveDefaultValues(formData map[string]interface{}, options ...*ResolutionOptions) map[string]interface{} {
	opts := tr.getOptions(options...)
	defaults := make(map[string]interface{})

	context := &ResolutionContext{
		FormData:        formData,
		FieldContext:    make(map[string]interface{}),
		GlobalVariables: make(map[string]interface{}),
		ResolutionPath:  []string{"defaults"},
		Options:         opts,
	}

	for _, field := range tr.schema.Fields {
		tr.resolveFieldDefaults(field, defaults, context, "")
	}

	return defaults
}

// ResolveConditionalExpression resolves a conditional expression
func (tr *TemplateResolver) ResolveConditionalExpression(condition *Condition, formData map[string]interface{}, options ...*ResolutionOptions) (bool, error) {
	if condition == nil {
		return true, nil
	}

	opts := tr.getOptions(options...)

	context := &ResolutionContext{
		FormData:        formData,
		FieldContext:    make(map[string]interface{}),
		GlobalVariables: make(map[string]interface{}),
		ResolutionPath:  []string{"condition"},
		Options:         opts,
	}

	// If it's an expression-based condition
	if condition.Expression != "" {
		result, err := tr.templateEngine.EvaluateExpression(condition.Expression, tr.buildTemplateContext(context))
		if err != nil {
			return false, err
		}

		if boolResult, ok := result.(bool); ok {
			return boolResult, nil
		}

		// Try to convert to boolean
		return tr.toBool(result), nil
	}

	// Handle other condition types using existing form validation logic
	validator := NewValidator(tr.schema)
	return validator.evaluateCondition(condition, formData), nil
}

// resolveValue resolves a single value that may contain template expressions
func (tr *TemplateResolver) resolveValue(value interface{}, context *ResolutionContext) (interface{}, error) {
	// Check resolution depth
	if len(context.ResolutionPath) > context.Options.MaxDepth {
		return value, fmt.Errorf("maximum resolution depth exceeded")
	}

	switch v := value.(type) {
	case string:
		return tr.resolveStringValue(v, context)
	case map[string]interface{}:
		return tr.resolveMapValues(v, context), nil
	case []interface{}:
		return tr.resolveArrayValues(v, context), nil
	default:
		return value, nil
	}
}

// resolveStringValue resolves template expressions in a string value
func (tr *TemplateResolver) resolveStringValue(value string, context *ResolutionContext) (interface{}, error) {
	// Check if the string contains template expressions
	if !strings.Contains(value, "${") {
		return value, nil
	}

	// Build template context
	templateContext := tr.buildTemplateContext(context)

	// Evaluate the expression
	result, err := tr.templateEngine.EvaluateExpression(value, templateContext)
	if err != nil {
		if context.Options.StrictMode {
			return nil, err
		}
		// Return default value or original string
		if context.Options.DefaultOnError != "" {
			return context.Options.DefaultOnError, nil
		}
		return value, nil
	}

	// If recursive resolution is enabled and result is a string with templates
	if context.Options.EnableRecursion {
		if resultStr, ok := result.(string); ok && strings.Contains(resultStr, "${") {
			// Prevent infinite recursion
			resolutionKey := fmt.Sprintf("recursive:%s", resultStr)
			if tr.isResolving(resolutionKey) {
				return result, nil
			}

			tr.setResolving(resolutionKey, true)
			defer tr.setResolving(resolutionKey, false)

			return tr.resolveStringValue(resultStr, context)
		}
	}

	return result, nil
}

// resolveMapValues resolves all values in a map
func (tr *TemplateResolver) resolveMapValues(data map[string]interface{}, context *ResolutionContext) map[string]interface{} {
	for key, value := range data {
		// Create new context with current key in path
		newContext := tr.copyContext(context)
		newContext.ResolutionPath = append(newContext.ResolutionPath, key)

		if resolvedValue, err := tr.resolveValue(value, newContext); err == nil {
			data[key] = resolvedValue
		}
	}
	return data
}

// resolveArrayValues resolves all values in an array
func (tr *TemplateResolver) resolveArrayValues(data []interface{}, context *ResolutionContext) []interface{} {
	for i, value := range data {
		// Create new context with current index in path
		newContext := tr.copyContext(context)
		newContext.ResolutionPath = append(newContext.ResolutionPath, fmt.Sprintf("[%d]", i))

		if resolvedValue, err := tr.resolveValue(value, newContext); err == nil {
			data[i] = resolvedValue
		}
	}
	return data
}

// resolveFieldDefaults resolves default values for a field and its nested fields
func (tr *TemplateResolver) resolveFieldDefaults(field *Field, defaults map[string]interface{}, context *ResolutionContext, prefix string) {
	fieldPath := field.ID
	if prefix != "" {
		fieldPath = prefix + "." + field.ID
	}

	// Resolve default value if present
	if field.DefaultValue != nil {
		newContext := tr.copyContext(context)
		newContext.ResolutionPath = append(newContext.ResolutionPath, fieldPath)
		newContext.FieldContext["currentField"] = field.ID
		newContext.FieldContext["fieldType"] = string(field.Type)

		if resolvedValue, err := tr.resolveValue(field.DefaultValue, newContext); err == nil {
			defaults[fieldPath] = resolvedValue
		}
	}

	// Handle conditional defaults (DefaultWhen)
	for _, defaultWhen := range field.DefaultWhen {
		if defaultWhen.Condition != nil {
			// Check if condition is met
			conditionMet, err := tr.ResolveConditionalExpression(defaultWhen.Condition, context.FormData)
			if err == nil && conditionMet {
				newContext := tr.copyContext(context)
				newContext.ResolutionPath = append(newContext.ResolutionPath, fieldPath, "defaultWhen")

				if resolvedValue, err := tr.resolveValue(defaultWhen.Value, newContext); err == nil {
					defaults[fieldPath] = resolvedValue
				}
			}
		}
	}

	// Handle nested fields
	if field.Nested != nil {
		for _, nestedField := range field.Nested {
			tr.resolveFieldDefaults(nestedField, defaults, context, fieldPath)
		}
	}
}

// buildTemplateContext builds the context map for template evaluation
func (tr *TemplateResolver) buildTemplateContext(context *ResolutionContext) map[string]interface{} {
	templateContext := make(map[string]interface{})

	// Add form data first (lowest priority), but only resolved values
	// This prevents infinite recursion from unresolved template expressions
	if context.FormData != nil {
		for key, value := range context.FormData {
			// Only add values that are NOT template expressions to avoid circular references
			if strValue, ok := value.(string); ok && strings.Contains(strValue, "${") {
				// Skip unresolved template expressions
				continue
			}
			// Add resolved values (strings without ${, numbers, booleans, etc.)
			templateContext[key] = value
		}
	}

	// Add field context
	if context.FieldContext != nil {
		for key, value := range context.FieldContext {
			templateContext[key] = value
		}
	}

	// Add registered variables from the schema's variable registry (higher priority)
	if tr.schema != nil && tr.schema.variableRegistry != nil {
		allVars := tr.schema.variableRegistry.GetVariables()
		for key, value := range allVars {
			templateContext[key] = value
		}
	}

	// Add global variables (highest priority)
	if context.GlobalVariables != nil {
		for key, value := range context.GlobalVariables {
			templateContext[key] = value
		}
	}

	return templateContext
}

// Helper methods

func (tr *TemplateResolver) getOptions(options ...*ResolutionOptions) *ResolutionOptions {
	if len(options) > 0 && options[0] != nil {
		return options[0]
	}

	return &ResolutionOptions{
		StrictMode:      false,
		DefaultOnError:  "",
		MaxDepth:        10,
		PreserveNulls:   false,
		EnableRecursion: false,
	}
}

func (tr *TemplateResolver) copyContext(context *ResolutionContext) *ResolutionContext {
	newContext := &ResolutionContext{
		FormData:        context.FormData,
		FieldContext:    make(map[string]interface{}),
		GlobalVariables: context.GlobalVariables,
		ResolutionPath:  make([]string, len(context.ResolutionPath)),
		Options:         context.Options,
	}

	// Copy field context
	for key, value := range context.FieldContext {
		newContext.FieldContext[key] = value
	}

	// Copy resolution path
	copy(newContext.ResolutionPath, context.ResolutionPath)

	return newContext
}

func (tr *TemplateResolver) copyField(field *Field) *Field {
	// Create a shallow copy of the field
	// In a production system, you might want to implement deep copying
	return &Field{
		ID:              field.ID,
		Type:            field.Type,
		Label:           field.Label,
		Required:        field.Required,
		RequiredIf:      field.RequiredIf,
		Visible:         field.Visible,
		Enabled:         field.Enabled,
		DefaultValue:    field.DefaultValue,
		DefaultWhen:     field.DefaultWhen,
		Placeholder:     field.Placeholder,
		HelpText:        field.HelpText,
		ValidationRules: field.ValidationRules,
		Properties:      field.Properties,
		Order:           field.Order,
		Options:         field.Options,
		Nested:          field.Nested,
		Multiline:       field.Multiline,
	}
}

func (tr *TemplateResolver) deepCopyMap(original map[string]interface{}) map[string]interface{} {
	copy := make(map[string]interface{})
	for key, value := range original {
		copy[key] = tr.deepCopyValue(value)
	}
	return copy
}

func (tr *TemplateResolver) deepCopyValue(original interface{}) interface{} {
	if original == nil {
		return nil
	}

	switch v := original.(type) {
	case map[string]interface{}:
		return tr.deepCopyMap(v)
	case []interface{}:
		copy := make([]interface{}, len(v))
		for i, item := range v {
			copy[i] = tr.deepCopyValue(item)
		}
		return copy
	default:
		return v
	}
}

func (tr *TemplateResolver) isResolving(key string) bool {
	tr.mutex.RLock()
	defer tr.mutex.RUnlock()
	return tr.resolving[key]
}

func (tr *TemplateResolver) setResolving(key string, resolving bool) {
	tr.mutex.Lock()
	defer tr.mutex.Unlock()
	if resolving {
		tr.resolving[key] = true
	} else {
		delete(tr.resolving, key)
	}
}

func (tr *TemplateResolver) toBool(value interface{}) bool {
	if value == nil {
		return false
	}

	switch v := value.(type) {
	case bool:
		return v
	case string:
		return strings.ToLower(v) == "true" || v == "1"
	case int, int32, int64:
		return reflect.ValueOf(v).Int() != 0
	case float32, float64:
		return reflect.ValueOf(v).Float() != 0
	default:
		return true // Non-zero values are truthy
	}
}
