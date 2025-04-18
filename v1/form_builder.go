package smartform

// FormBuilder provides a fluent API for creating form schemas
type FormBuilder struct {
	schema *FormSchema
}

// NewForm creates a new form builder
func NewForm(id, title string) *FormBuilder {
	return &FormBuilder{
		schema: &FormSchema{
			ID:         id,
			Title:      title,
			Fields:     []*Field{},
			Properties: make(map[string]interface{}),
		},
	}
}

// Description sets the form description
func (fb *FormBuilder) Description(description string) *FormBuilder {
	fb.schema.Description = description
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

// BranchField adds a workflow branch field to the form
func (fb *FormBuilder) BranchField(id, label string) *BranchFieldBuilder {
	field := NewBranchFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// CustomField Custom adds a custom field to the form
func (fb *FormBuilder) CustomField(id, label string) *CustomFieldBuilder {
	field := NewCustomFieldBuilder(id, label)
	fb.AddField(field.Build())
	return field
}

// Build finalizes and returns the form schema
func (fb *FormBuilder) Build() *FormSchema {
	return fb.schema
}
