package smartform

import (
	"strings"

	"github.com/juicycleff/smartform/v1/template"
)

// FormBuilder provides a fluent API for creating form schemas
type FormBuilder struct {
	schema *FormSchema
}

// NewForm creates a new form builder
func NewForm(id, title string) *FormBuilder {
	return &FormBuilder{
		schema: NewFormSchema(id, title),
	}
}

// NewAuthForm creates a new authentication form builder
func NewAuthForm(id, title string, authType AuthStrategy) *FormBuilder {
	return &FormBuilder{
		schema: NewAuthFormSchema(id, title, authType),
	}
}

// Description sets the form description
func (fb *FormBuilder) Description(description string) *FormBuilder {
	fb.schema.Description = description
	return fb
}

// FormType sets the form type
func (fb *FormBuilder) FormType(formType FormType) *FormBuilder {
	fb.schema.Type = formType
	return fb
}

// AuthType sets the authentication type for auth forms
func (fb *FormBuilder) AuthType(authType AuthStrategy) *FormBuilder {
	if fb.schema.Type == FormTypeAuth {
		fb.schema.AuthType = authType
	}
	return fb
}

// Property sets a custom property on the form
func (fb *FormBuilder) Property(key string, value interface{}) *FormBuilder {
	fb.schema.Properties[key] = value
	return fb
}

// AddField adds a field to the form
func (fb *FormBuilder) AddField(field *Field) *FormBuilder {
	fb.schema.Fields = append(fb.schema.Fields, field)
	return fb
}

// AddFields adds multiple fields to the form
func (fb *FormBuilder) AddFields(fields ...*Field) *FormBuilder {
	fb.schema.Fields = append(fb.schema.Fields, fields...)
	return fb
}

// TextField adds a text field to the form
func (fb *FormBuilder) TextField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeText, label)
	fb.AddField(field.Build())
	return field
}

// TextareaField adds a textarea field to the form
func (fb *FormBuilder) TextareaField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeTextarea, label)
	fb.AddField(field.Build())
	return field
}

// NumberField adds a number field to the form
func (fb *FormBuilder) NumberField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeNumber, label)
	fb.AddField(field.Build())
	return field
}

// EmailField adds an email field to the form
func (fb *FormBuilder) EmailField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeEmail, label)
	fb.AddField(field.Build())
	return field
}

// PasswordField adds a password field to the form
func (fb *FormBuilder) PasswordField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypePassword, label)
	fb.AddField(field.Build())
	return field
}

// SelectField adds a select field to the form
func (fb *FormBuilder) SelectField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeSelect, label)
	fb.AddField(field.Build())
	return field
}

// MultiSelectField adds a multi-select field to the form
func (fb *FormBuilder) MultiSelectField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeMultiSelect, label)
	fb.AddField(field.Build())
	return field
}

// CheckboxField adds a checkbox field to the form
func (fb *FormBuilder) CheckboxField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeCheckbox, label)
	fb.AddField(field.Build())
	return field
}

// RadioField adds a radio button field to the form
func (fb *FormBuilder) RadioField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeRadio, label)
	fb.AddField(field.Build())
	return field
}

// DateField adds a date field to the form
func (fb *FormBuilder) DateField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeDate, label)
	fb.AddField(field.Build())
	return field
}

// TimeField adds a time field to the form
func (fb *FormBuilder) TimeField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeTime, label)
	fb.AddField(field.Build())
	return field
}

// DateTimeField adds a datetime field to the form
func (fb *FormBuilder) DateTimeField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeDateTime, label)
	fb.AddField(field.Build())
	return field
}

// FileField adds a file upload field to the form
func (fb *FormBuilder) FileField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeFile, label)
	fb.AddField(field.Build())
	return field
}

// ImageField adds an image upload field to the form
func (fb *FormBuilder) ImageField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeImage, label)
	fb.AddField(field.Build())
	return field
}

// SwitchField adds a switch field to the form
func (fb *FormBuilder) SwitchField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeSwitch, label)
	fb.AddField(field.Build())
	return field
}

// SliderField adds a slider field to the form
func (fb *FormBuilder) SliderField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeSlider, label)
	fb.AddField(field.Build())
	return field
}

// RatingField adds a rating field to the form
func (fb *FormBuilder) RatingField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeRating, label)
	fb.AddField(field.Build())
	return field
}

// ColorField adds a color picker field to the form
func (fb *FormBuilder) ColorField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeColor, label)
	fb.AddField(field.Build())
	return field
}

// HiddenField adds a hidden field to the form
func (fb *FormBuilder) HiddenField(id string, value interface{}) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeHidden, "")
	field.DefaultValue(value)
	fb.AddField(field.Build())
	return field
}

// RichTextField adds a rich text editor field to the form
func (fb *FormBuilder) RichTextField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeRichText, label)
	fb.AddField(field.Build())
	return field
}

// SectionField adds a section separator to the form
func (fb *FormBuilder) SectionField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeSection, label)
	fb.AddField(field.Build())
	return field
}

// GroupField adds a group field to the form
func (fb *FormBuilder) GroupField(id, label string) *GroupFieldBuilder {
	field := NewGroupFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// ArrayField adds an array field to the form
func (fb *FormBuilder) ArrayField(id, label string) *ArrayFieldBuilder {
	field := NewArrayFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// OneOfField adds a oneOf field to the form
func (fb *FormBuilder) OneOfField(id, label string) *OneOfFieldBuilder {
	field := NewOneOfFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// AnyOfField adds an anyOf field to the form
func (fb *FormBuilder) AnyOfField(id, label string) *AnyOfFieldBuilder {
	field := NewAnyOfFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// APIField adds an API integration field to the form
func (fb *FormBuilder) APIField(id, label string) *APIFieldBuilder {
	field := NewAPIFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// AuthField adds an authentication field to the form
func (fb *FormBuilder) AuthField(id, label string) *AuthFieldBuilder {
	field := NewAuthFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// OAuthField adds an OAuth authentication field to the form
func (fb *FormBuilder) OAuthField(id, label string) *OAuth2Builder {
	if id == "" {
		id = "oauth"
	}

	field := NewOAuth2Builder(id, label)
	fb.AddField(field.Build())
	return field
}

// BasicAuthField adds a basic authentication field to the form
func (fb *FormBuilder) BasicAuthField(id, label string) *BasicAuthBuilder {
	if id == "" {
		id = "basic"
	}
	field := NewBasicAuthBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// APIKeyField adds an API key authentication field to the form
func (fb *FormBuilder) APIKeyField(id, label string) *APIKeyBuilder {
	if id == "" {
		id = "key"
	}

	field := NewAPIKeyBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// JWTField adds a JWT authentication field to the form
func (fb *FormBuilder) JWTField(id, label string) *JWTBuilder {
	if id == "" {
		id = "jwt"
	}
	field := NewJWTBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// SAMLField adds a SAML authentication field to the form
func (fb *FormBuilder) SAMLField(id, label string) *SAMLBuilder {
	if id == "" {
		id = "saml"
	}
	field := NewSAMLBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// BranchField adds a workflow branch field to the form
func (fb *FormBuilder) BranchField(id, label string) *BranchFieldBuilder {
	field := NewBranchFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// CustomField Custom adds a custom field to the form
func (fb *FormBuilder) CustomField(id, label string) *CustomFieldBuilder {
	if id == "" {
		id = "custom"
	}
	field := NewCustomFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// RegisterVariable registers a variable in the form
func (fb *FormBuilder) RegisterVariable(name string, value interface{}) *FormBuilder {
	fb.schema.RegisterVariable(name, value)
	return fb
}

// RegisterVariableFunction registers a function in the form
func (fb *FormBuilder) RegisterVariableFunction(name string, fn template.TemplateFunction) *FormBuilder {
	fb.schema.RegisterVariableFunction(name, fn)
	return fb
}

// Build finalizes and returns the form schema
func (fb *FormBuilder) Build() *FormSchema {
	fb.registerDynamicFunctions()

	return fb.schema
}

func (fb *FormBuilder) registerDynamicFunctions() {
	for _, field := range fb.schema.Fields {
		fb.registerFieldDynamicFunctions(field, "")
	}
}

// Register dynamic functions for a single field and its nested fields
func (fb *FormBuilder) registerFieldDynamicFunctions(field *Field, path string) {
	// Build the current field's path
	fieldPath := field.ID
	if path != "" {
		fieldPath = path + "." + field.ID
	}

	// Check if the field has dynamic options
	if field.Options != nil && field.Options.Type == OptionsTypeDynamic &&
		field.Options.DynamicSource != nil && field.Options.DynamicSource.Type == "function" {

		dynamicSource := field.Options.DynamicSource

		// If there's a DirectFunction, register it with a path-based name
		if dynamicSource.DirectFunction != nil {
			// Use the field ID as the function name (with path prefix)
			functionName := fieldPath

			// If there's already an explicitly set function name, use that instead
			if dynamicSource.FunctionName != "" &&
				!strings.HasPrefix(dynamicSource.FunctionName, "direct_func_") {
				functionName = dynamicSource.FunctionName
			} else {
				// Update the function name in the dynamic source
				dynamicSource.FunctionName = functionName
			}

			// Register the function with the schema
			fb.schema.RegisterFunction(functionName, dynamicSource.DirectFunction)
		}
	}

	// Process nested fields recursively
	if field.Nested != nil {
		for _, nestedField := range field.Nested {
			fb.registerFieldDynamicFunctions(nestedField, fieldPath)
		}
	}
}
