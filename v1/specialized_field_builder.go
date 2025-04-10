package smartform

// GroupFieldBuilder provides a fluent API for creating group fields
type GroupFieldBuilder struct {
	FieldBuilder
}

// NewGroupFieldBuilder creates a new group field builder
func NewGroupFieldBuilder(id, label string) *GroupFieldBuilder {
	return &GroupFieldBuilder{
		FieldBuilder: *NewFieldBuilder(id, FieldTypeGroup, label),
	}
}

// AddField adds a nested field to the group
func (gb *GroupFieldBuilder) AddField(field *Field) *GroupFieldBuilder {
	if gb.field.Nested == nil {
		gb.field.Nested = []*Field{}
	}
	gb.field.Nested = append(gb.field.Nested, field)
	return gb
}

// TextField adds a text field to the group
func (gb *GroupFieldBuilder) TextField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeText, label)
	gb.AddField(field.Build())
	return field
}

// TextareaField adds a textarea field to the group
func (gb *GroupFieldBuilder) TextareaField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeTextarea, label)
	gb.AddField(field.Build())
	return field
}

// NumberField adds a number field to the group
func (gb *GroupFieldBuilder) NumberField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeNumber, label)
	gb.AddField(field.Build())
	return field
}

// EmailField adds an email field to the group
func (gb *GroupFieldBuilder) EmailField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeEmail, label)
	gb.AddField(field.Build())
	return field
}

// SelectField adds a select field to the group
func (gb *GroupFieldBuilder) SelectField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeSelect, label)
	gb.AddField(field.Build())
	return field
}

// CheckboxField adds a checkbox field to the group
func (gb *GroupFieldBuilder) CheckboxField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeCheckbox, label)
	gb.AddField(field.Build())
	return field
}

// RadioField creates a new radio button field with the given ID and label, adds it to the group, and returns its builder.
func (gb *GroupFieldBuilder) RadioField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeRadio, label)
	gb.AddField(field.Build())
	return field
}

// MultiSelectField creates a new multi-select field with the specified ID and label.
// It adds the field to the group field builder and returns a field builder for further configuration.
func (gb *GroupFieldBuilder) MultiSelectField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeMultiSelect, label)
	gb.AddField(field.Build())
	return field
}

// PasswordField adds a password input field with the specified id and label to the group field and returns a FieldBuilder.
func (gb *GroupFieldBuilder) PasswordField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypePassword, label)
	gb.AddField(field.Build())
	return field
}

// FileField creates a new file upload field with the specified ID and label and adds it to the group field builder.
func (gb *GroupFieldBuilder) FileField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeFile, label)
	gb.AddField(field.Build())
	return field
}

// ObjectField creates a new GroupFieldBuilder instance with the provided id and label, adds it to the parent builder, and returns it.
func (gb *GroupFieldBuilder) ObjectField(id, label string) *GroupFieldBuilder {
	field := NewGroupFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// ObjectTemplate creates a new GroupFieldBuilder instance with the given id and label, adds it to the parent group, and returns it.
func (gb *GroupFieldBuilder) ObjectTemplate(id, label string) *GroupFieldBuilder {
	field := NewGroupFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// ArrayField creates a new array field with the specified id and label, adds it to the group, and returns its builder.
func (gb *GroupFieldBuilder) ArrayField(id, label string) *ArrayFieldBuilder {
	field := NewArrayFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// OneOfField creates a new OneOfFieldBuilder with the given id and label, adds it to the group, and returns the builder.
func (gb *GroupFieldBuilder) OneOfField(id, label string) *OneOfFieldBuilder {
	field := NewOneOfFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// AnyOfField adds an "anyOf" type field to the group with the specified ID and label and returns its builder.
func (gb *GroupFieldBuilder) AnyOfField(id, label string) *AnyOfFieldBuilder {
	field := NewAnyOfFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// APIField creates a new API field with the given ID and label, adds it to the group, and returns its builder for chaining.
func (gb *GroupFieldBuilder) APIField(id, label string) *APIFieldBuilder {
	field := NewAPIFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// AuthField adds a new authentication field to the group and returns its builder for further customization.
func (gb *GroupFieldBuilder) AuthField(id, label string) *AuthFieldBuilder {
	field := NewAuthFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// BranchField creates a new BranchFieldBuilder, adds it to the GroupFieldBuilder, and returns the BranchFieldBuilder instance.
func (gb *GroupFieldBuilder) BranchField(id, label string) *BranchFieldBuilder {
	field := NewBranchFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// CustomField adds a customizable field with a specified id and label, returning a CustomFieldBuilder for further configuration.
func (gb *GroupFieldBuilder) CustomField(id, label string) *CustomFieldBuilder {
	field := NewCustomFieldBuilder(id, label)
	gb.AddField(field.Build())
	return field
}

// HiddenField creates a hidden field with the specified id and label and adds it to the parent group field.
// Returns a FieldBuilder instance for further customization of the hidden field.
func (gb *GroupFieldBuilder) HiddenField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeHidden, label)
	gb.AddField(field.Build())
	return field
}

// DateField adds a date field to the group
func (gb *GroupFieldBuilder) DateField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeDate, label)
	gb.AddField(field.Build())
	return field
}

// Build finalizes and returns the group field
func (gb *GroupFieldBuilder) Build() *Field {
	return gb.field
}

// -------------------------------

// ArrayFieldBuilder provides a fluent API for creating array fields
type ArrayFieldBuilder struct {
	FieldBuilder
}

// NewArrayFieldBuilder creates a new array field builder
func NewArrayFieldBuilder(id, label string) *ArrayFieldBuilder {
	return &ArrayFieldBuilder{
		FieldBuilder: *NewFieldBuilder(id, FieldTypeArray, label),
	}
}

// ItemTemplate sets the template for array items
func (ab *ArrayFieldBuilder) ItemTemplate(field *Field) *ArrayFieldBuilder {
	if ab.field.Nested == nil {
		ab.field.Nested = []*Field{}
	}
	ab.field.Nested = append(ab.field.Nested, field)
	return ab
}

// TextField adds a text field template to the array
func (ab *ArrayFieldBuilder) TextField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeText, label)
	ab.ItemTemplate(field.Build())
	return field
}

// ObjectTemplate adds an object field template to the array
func (ab *ArrayFieldBuilder) ObjectTemplate(id, label string) *GroupFieldBuilder {
	group := NewGroupFieldBuilder(id, label)
	ab.ItemTemplate(group.Build())
	return group
}

// ObjectTemplateWithFields creates a GroupFieldBuilder with the given fields, sets it as an item template, and returns it.
func (ab *ArrayFieldBuilder) ObjectTemplateWithFields(id, label string, fields []*Field) *GroupFieldBuilder {
	group := NewGroupFieldBuilder(id, label)
	for _, field := range fields {
		group.AddField(field)
	}
	ab.ItemTemplate(group.Build())
	return group
}

// DateField adds a date field to the array field configuration.
// The field is created with the specified id and label.
func (ab *ArrayFieldBuilder) DateField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeDate, label)
	ab.ItemTemplate(field.Build())
	return field
}

// NumberField creates a new number field with the specified id and label, adds it to the array field builder, and returns it.
func (ab *ArrayFieldBuilder) NumberField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeNumber, label)
	ab.ItemTemplate(field.Build())
	return field
}

// EmailField creates a new email field with the specified id and label, adds it to the array field template, and returns the builder.
func (ab *ArrayFieldBuilder) EmailField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeEmail, label)
	ab.ItemTemplate(field.Build())
	return field
}

// SelectField creates a select field with the specified id and label, and adds it to the ArrayFieldBuilder's item template.
func (ab *ArrayFieldBuilder) SelectField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeSelect, label)
	ab.ItemTemplate(field.Build())
	return field
}

// CheckboxField creates a checkbox field with the specified id and label, adds it to the array's item template, and returns it.
func (ab *ArrayFieldBuilder) CheckboxField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeCheckbox, label)
	ab.ItemTemplate(field.Build())
	return field
}

// RadioField creates a new field of type "radio" with the specified ID and label, adds it to the array template, and returns it.
func (ab *ArrayFieldBuilder) RadioField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeRadio, label)
	ab.ItemTemplate(field.Build())
	return field
}

// MultiSelectField creates a new multi-select field with the given ID and label, and adds it to the item template.
func (ab *ArrayFieldBuilder) MultiSelectField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeMultiSelect, label)
	ab.ItemTemplate(field.Build())
	return field
}

// PasswordField creates a password field with the specified ID and label and adds it to the array field builder.
func (ab *ArrayFieldBuilder) PasswordField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypePassword, label)
	ab.ItemTemplate(field.Build())
	return field
}

// FileField creates a new file field with the given id and label, adds it to the item template, and returns its builder.
func (ab *ArrayFieldBuilder) FileField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeFile, label)
	ab.ItemTemplate(field.Build())
	return field
}

// ObjectField adds a new group field with the specified id and label to the array field builder.
// It returns a GroupFieldBuilder for further configuration of the group field.
func (ab *ArrayFieldBuilder) ObjectField(id, label string) *GroupFieldBuilder {
	field := NewGroupFieldBuilder(id, label)
	ab.ItemTemplate(field.Build())
	return field
}

// OneOfField adds a oneOf field to the array field builder and returns a OneOfFieldBuilder for further configuration.
func (ab *ArrayFieldBuilder) OneOfField(id, label string) *OneOfFieldBuilder {
	field := NewOneOfFieldBuilder(id, label)
	ab.ItemTemplate(field.Build())
	return field
}

// AnyOfField creates a new AnyOfFieldBuilder with the specified id and label, adds it as an item template, and returns it.
func (ab *ArrayFieldBuilder) AnyOfField(id, label string) *AnyOfFieldBuilder {
	field := NewAnyOfFieldBuilder(id, label)
	ab.ItemTemplate(field.Build())
	return field
}

// APIField creates and adds a new API field to the ArrayFieldBuilder, returning its builder for further configuration.
func (ab *ArrayFieldBuilder) APIField(id, label string) *APIFieldBuilder {
	field := NewAPIFieldBuilder(id, label)
	ab.ItemTemplate(field.Build())
	return field
}

// AuthField creates an authentication field with the given ID and label, adds it to the array template, and returns its builder.
func (ab *ArrayFieldBuilder) AuthField(id, label string) *AuthFieldBuilder {
	field := NewAuthFieldBuilder(id, label)
	ab.ItemTemplate(field.Build())
	return field
}

// BranchField adds a new branch field to the array field builder and returns a BranchFieldBuilder for further configuration.
func (ab *ArrayFieldBuilder) BranchField(id, label string) *BranchFieldBuilder {
	field := NewBranchFieldBuilder(id, label)
	ab.ItemTemplate(field.Build())
	return field
}

// CustomField adds a custom field with the specified id and label to an array field, returning a CustomFieldBuilder instance.
func (ab *ArrayFieldBuilder) CustomField(id, label string) *CustomFieldBuilder {
	field := NewCustomFieldBuilder(id, label)
	ab.ItemTemplate(field.Build())
	return field
}

// HiddenField adds a hidden field to the form builder with the specified ID and label, returning the field builder instance.
func (ab *ArrayFieldBuilder) HiddenField(id, label string) *FieldBuilder {
	field := NewFieldBuilder(id, FieldTypeHidden, label)
	ab.ItemTemplate(field.Build())
	return field
}

// MinItems sets the minimum number of items in the array
func (ab *ArrayFieldBuilder) MinItems(min int) *ArrayFieldBuilder {
	ab.Property("minItems", min)
	return ab
}

// MaxItems sets the maximum number of items in the array
func (ab *ArrayFieldBuilder) MaxItems(max int) *ArrayFieldBuilder {
	ab.Property("maxItems", max)
	return ab
}

// Build finalizes and returns the array field
func (ab *ArrayFieldBuilder) Build() *Field {
	return ab.field
}

// -------------------------------

// OneOfFieldBuilder provides a fluent API for creating oneOf fields
type OneOfFieldBuilder struct {
	FieldBuilder
}

// NewOneOfFieldBuilder creates a new oneOf field builder
func NewOneOfFieldBuilder(id, label string) *OneOfFieldBuilder {
	return &OneOfFieldBuilder{
		FieldBuilder: *NewFieldBuilder(id, FieldTypeOneOf, label),
	}
}

// AddOption adds an option to the oneOf field
func (ob *OneOfFieldBuilder) AddOption(field *Field) *OneOfFieldBuilder {
	if ob.field.Nested == nil {
		ob.field.Nested = []*Field{}
	}
	ob.field.Nested = append(ob.field.Nested, field)
	return ob
}

// GroupOption adds a group option to the oneOf field
func (ob *OneOfFieldBuilder) GroupOption(id, label string) *GroupFieldBuilder {
	group := NewGroupFieldBuilder(id, label)
	ob.AddOption(group.Build())
	return group
}

// Build finalizes and returns the oneOf field
func (ob *OneOfFieldBuilder) Build() *Field {
	return ob.field
}

// -------------------------------

// AnyOfFieldBuilder provides a fluent API for creating anyOf fields
type AnyOfFieldBuilder struct {
	FieldBuilder
}

// NewAnyOfFieldBuilder creates a new anyOf field builder
func NewAnyOfFieldBuilder(id, label string) *AnyOfFieldBuilder {
	return &AnyOfFieldBuilder{
		FieldBuilder: *NewFieldBuilder(id, FieldTypeAnyOf, label),
	}
}

// AddOption adds an option to the anyOf field
func (ab *AnyOfFieldBuilder) AddOption(field *Field) *AnyOfFieldBuilder {
	if ab.field.Nested == nil {
		ab.field.Nested = []*Field{}
	}
	ab.field.Nested = append(ab.field.Nested, field)
	return ab
}

// GroupOption adds a group option to the anyOf field
func (ab *AnyOfFieldBuilder) GroupOption(id, label string) *GroupFieldBuilder {
	group := NewGroupFieldBuilder(id, label)
	ab.AddOption(group.Build())
	return group
}

// Build finalizes and returns the anyOf field
func (ab *AnyOfFieldBuilder) Build() *Field {
	return ab.field
}

// -------------------------------

// APIFieldBuilder provides a fluent API for creating API integration fields
type APIFieldBuilder struct {
	FieldBuilder
}

// NewAPIFieldBuilder creates a new API field builder
func NewAPIFieldBuilder(id, label string) *APIFieldBuilder {
	return &APIFieldBuilder{
		FieldBuilder: *NewFieldBuilder(id, FieldTypeAPI, label),
	}
}

// Endpoint sets the API endpoint
func (ab *APIFieldBuilder) Endpoint(endpoint string) *APIFieldBuilder {
	ab.Property("endpoint", endpoint)
	return ab
}

// Method sets the HTTP method
func (ab *APIFieldBuilder) Method(method string) *APIFieldBuilder {
	ab.Property("method", method)
	return ab
}

// Header adds an HTTP header
func (ab *APIFieldBuilder) Header(key, value string) *APIFieldBuilder {
	headers, ok := ab.field.Properties["headers"].(map[string]string)
	if !ok {
		headers = make(map[string]string)
		ab.Property("headers", headers)
	}
	headers[key] = value
	return ab
}

// Parameter adds a request parameter
func (ab *APIFieldBuilder) Parameter(key string, value interface{}) *APIFieldBuilder {
	params, ok := ab.field.Properties["parameters"].(map[string]interface{})
	if !ok {
		params = make(map[string]interface{})
		ab.Property("parameters", params)
	}
	params[key] = value
	return ab
}

// ResponseMapping sets a mapping from API response to form fields
func (ab *APIFieldBuilder) ResponseMapping(mapping map[string]string) *APIFieldBuilder {
	ab.Property("responseMapping", mapping)
	return ab
}

// Build finalizes and returns the API field
func (ab *APIFieldBuilder) Build() *Field {
	return ab.field
}

// -------------------------------

// AuthFieldBuilder provides a fluent API for creating authentication fields
type AuthFieldBuilder struct {
	FieldBuilder
}

// NewAuthFieldBuilder creates a new authentication field builder
func NewAuthFieldBuilder(id, label string) *AuthFieldBuilder {
	return &AuthFieldBuilder{
		FieldBuilder: *NewFieldBuilder(id, FieldTypeAuth, label),
	}
}

// AuthType sets the authentication type
func (ab *AuthFieldBuilder) AuthType(authType string) *AuthFieldBuilder {
	ab.Property("authType", authType)
	return ab
}

// ServiceID sets the service ID for authentication
func (ab *AuthFieldBuilder) ServiceID(serviceID string) *AuthFieldBuilder {
	ab.Property("serviceId", serviceID)
	return ab
}

// Build finalizes and returns the authentication field
func (ab *AuthFieldBuilder) Build() *Field {
	return ab.field
}

// -------------------------------

// BranchFieldBuilder provides a fluent API for creating workflow branch fields
type BranchFieldBuilder struct {
	FieldBuilder
}

// NewBranchFieldBuilder creates a new branch field builder
func NewBranchFieldBuilder(id, label string) *BranchFieldBuilder {
	return &BranchFieldBuilder{
		FieldBuilder: *NewFieldBuilder(id, FieldTypeBranch, label),
	}
}

// Condition sets the branch condition
func (bb *BranchFieldBuilder) Condition(condition *Condition) *BranchFieldBuilder {
	bb.Property("condition", condition)
	return bb
}

// TrueBranch sets the form to show when condition is true
func (bb *BranchFieldBuilder) TrueBranch(formID string) *BranchFieldBuilder {
	bb.Property("trueBranch", formID)
	return bb
}

// FalseBranch sets the form to show when condition is false
func (bb *BranchFieldBuilder) FalseBranch(formID string) *BranchFieldBuilder {
	bb.Property("falseBranch", formID)
	return bb
}

// Build finalizes and returns the branch field
func (bb *BranchFieldBuilder) Build() *Field {
	return bb.field
}

// Extend API field builder for dynamic function support
func (ab *APIFieldBuilder) WithDynamicRequest(functionName string) *DynamicFunctionBuilder {
	ab.field.Properties["dynamicRequest"] = true

	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config
	ab.field.Properties["requestFunction"] = config

	// Return builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: &ab.FieldBuilder,
		config:       config,
	}
}

// Extend API field builder for dynamic response handling
func (ab *APIFieldBuilder) WithDynamicResponse(functionName string) *DynamicFunctionBuilder {
	ab.field.Properties["dynamicResponse"] = true

	// Create dynamic field config
	config := &DynamicFieldConfig{
		FunctionName: functionName,
		Arguments:    make(map[string]interface{}),
	}

	// Store the config
	ab.field.Properties["responseFunction"] = config

	// Return builder for configuring the dynamic function
	return &DynamicFunctionBuilder{
		fieldBuilder: &ab.FieldBuilder,
		config:       config,
	}
}

// -------------------------------

// CustomFieldBuilder provides a fluent API for creating custom component fields
type CustomFieldBuilder struct {
	FieldBuilder
}

// NewCustomFieldBuilder creates a new custom field builder
func NewCustomFieldBuilder(id, label string) *CustomFieldBuilder {
	return &CustomFieldBuilder{
		FieldBuilder: *NewFieldBuilder(id, FieldTypeCustom, label),
	}
}

// ComponentName sets the custom component name
func (cb *CustomFieldBuilder) ComponentName(name string) *CustomFieldBuilder {
	cb.Property("componentName", name)
	return cb
}

// ComponentProps sets the custom component props
func (cb *CustomFieldBuilder) ComponentProps(props map[string]interface{}) *CustomFieldBuilder {
	cb.Property("componentProps", props)
	return cb
}

// Build finalizes and returns the custom field
func (cb *CustomFieldBuilder) Build() *Field {
	return cb.field
}
