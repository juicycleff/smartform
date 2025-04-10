package smartform

import (
	"time"
)

// FormSchema represents the entire form structure
type FormSchema struct {
	ID          string                 `json:"id"`
	Title       string                 `json:"title"`
	Description string                 `json:"description,omitempty"`
	Fields      []*Field               `json:"fields"`
	Properties  map[string]interface{} `json:"properties,omitempty"`
}

// Field represents a single form field with all its properties
type Field struct {
	ID              string                 `json:"id"`
	Type            FieldType              `json:"type"`
	Label           string                 `json:"label"`
	Required        bool                   `json:"required"`
	Visible         *Condition             `json:"visible,omitempty"`
	Enabled         *Condition             `json:"enabled,omitempty"`
	DefaultValue    interface{}            `json:"defaultValue,omitempty"`
	Placeholder     string                 `json:"placeholder,omitempty"`
	HelpText        string                 `json:"helpText,omitempty"`
	ValidationRules []*ValidationRule      `json:"validationRules,omitempty"`
	Properties      map[string]interface{} `json:"properties,omitempty"`
	Order           int                    `json:"order"`
	Options         *OptionsConfig         `json:"options,omitempty"`
	Nested          []*Field               `json:"nested,omitempty"` // For group, oneOf, anyOf fields
}

// FieldType represents the type of form field
type FieldType string

// Define all possible field types
const (
	FieldTypeText        FieldType = "text"
	FieldTypeTextarea    FieldType = "textarea"
	FieldTypeNumber      FieldType = "number"
	FieldTypeSelect      FieldType = "select"
	FieldTypeMultiSelect FieldType = "multiselect"
	FieldTypeCheckbox    FieldType = "checkbox"
	FieldTypeRadio       FieldType = "radio"
	FieldTypeDate        FieldType = "date"
	FieldTypeTime        FieldType = "time"
	FieldTypeDateTime    FieldType = "datetime"
	FieldTypeEmail       FieldType = "email"
	FieldTypePassword    FieldType = "password"
	FieldTypeFile        FieldType = "file"
	FieldTypeImage       FieldType = "image"
	FieldTypeGroup       FieldType = "group"
	FieldTypeArray       FieldType = "array"
	FieldTypeOneOf       FieldType = "oneOf"
	FieldTypeAnyOf       FieldType = "anyOf"
	FieldTypeSwitch      FieldType = "switch"
	FieldTypeSlider      FieldType = "slider"
	FieldTypeRating      FieldType = "rating"
	FieldTypeObject      FieldType = "object"
	FieldTypeRichText    FieldType = "richtext"
	FieldTypeColor       FieldType = "color"
	FieldTypeHidden      FieldType = "hidden"
	FieldTypeSection     FieldType = "section" // For visual separation
	FieldTypeCustom      FieldType = "custom"  // For custom components
	FieldTypeAPI         FieldType = "api"     // For API integration
	FieldTypeAuth        FieldType = "auth"    // For authentication fields
	FieldTypeBranch      FieldType = "branch"  // For workflow branches
)

// Condition represents a conditional expression for field visibility or enablement
type Condition struct {
	Type       ConditionType `json:"type"`
	Field      string        `json:"field,omitempty"`      // Reference to another field
	Value      interface{}   `json:"value,omitempty"`      // Static value for comparison
	Operator   string        `json:"operator,omitempty"`   // eq, neq, gt, lt, etc.
	Conditions []*Condition  `json:"conditions,omitempty"` // For AND/OR conditions
	Expression string        `json:"expression,omitempty"` // For custom expressions
}

// ConditionType defines the type of condition
type ConditionType string

// Define condition types
const (
	ConditionTypeSimple     ConditionType = "simple"     // Simple field comparison
	ConditionTypeAnd        ConditionType = "and"        // Logical AND of multiple conditions
	ConditionTypeOr         ConditionType = "or"         // Logical OR of multiple conditions
	ConditionTypeNot        ConditionType = "not"        // Logical NOT of a condition
	ConditionTypeExists     ConditionType = "exists"     // Field exists and is not empty
	ConditionTypeExpression ConditionType = "expression" // Custom expression
)

// ValidationRule represents a validation constraint for a field
type ValidationRule struct {
	Type       ValidationType `json:"type"`
	Message    string         `json:"message"`
	Parameters interface{}    `json:"parameters,omitempty"` // Type-specific parameters
}

// ValidationType defines the type of validation
type ValidationType string

// Define validation types
const (
	ValidationTypeRequired        ValidationType = "required"
	ValidationTypeMinLength       ValidationType = "minLength"
	ValidationTypeMaxLength       ValidationType = "maxLength"
	ValidationTypePattern         ValidationType = "pattern"
	ValidationTypeMin             ValidationType = "min"
	ValidationTypeMax             ValidationType = "max"
	ValidationTypeEmail           ValidationType = "email"
	ValidationTypeURL             ValidationType = "url"
	ValidationTypeCustom          ValidationType = "custom"
	ValidationTypeUnique          ValidationType = "unique"
	ValidationTypeFileType        ValidationType = "fileType"
	ValidationTypeFileSize        ValidationType = "fileSize"
	ValidationTypeImageDimensions ValidationType = "imageDimensions"
	ValidationTypeDependency      ValidationType = "dependency"
)

// OptionsConfig represents configuration for field options (select, multiselect, etc.)
type OptionsConfig struct {
	Type          OptionsType        `json:"type"`
	Static        []*Option          `json:"static,omitempty"`
	DynamicSource *DynamicSource     `json:"dynamicSource,omitempty"`
	Dependency    *OptionsDependency `json:"dependency,omitempty"`
}

// OptionsType defines how options are sourced
type OptionsType string

// Define options types
const (
	OptionsTypeStatic    OptionsType = "static"    // Hardcoded options
	OptionsTypeDynamic   OptionsType = "dynamic"   // Dynamically loaded options
	OptionsTypeDependent OptionsType = "dependent" // Options depend on another field
)

// Option represents a single option for select-type fields
type Option struct {
	Value interface{} `json:"value"`
	Label string      `json:"label"`
	Icon  string      `json:"icon,omitempty"`
}

// DynamicSource defines where to get dynamic options from
type DynamicSource struct {
	Type       string                 `json:"type"` // api, function, etc.
	Endpoint   string                 `json:"endpoint,omitempty"`
	Method     string                 `json:"method,omitempty"`
	Headers    map[string]string      `json:"headers,omitempty"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
	ValuePath  string                 `json:"valuePath,omitempty"` // JSON path to value in response
	LabelPath  string                 `json:"labelPath,omitempty"` // JSON path to label in response
	RefreshOn  []string               `json:"refreshOn,omitempty"` // Fields that trigger refresh
}

// OptionsDependency defines how options depend on other field values
type OptionsDependency struct {
	Field      string               `json:"field"`
	ValueMap   map[string][]*Option `json:"valueMap,omitempty"`
	Expression string               `json:"expression,omitempty"`
}

// ValidationError represents a validation error for a specific field
type ValidationError struct {
	FieldID  string `json:"fieldId"`
	Message  string `json:"message"`
	RuleType string `json:"ruleType"`
}

// ValidationResult holds the result of validating the entire form
type ValidationResult struct {
	Valid  bool               `json:"valid"`
	Errors []*ValidationError `json:"errors,omitempty"`
}

// CacheEntry represents a cached API response
type CacheEntry struct {
	Data      []byte
	Timestamp time.Time
}

// NewFormSchema creates a new form schema instance
func NewFormSchema(id, title string) *FormSchema {
	return &FormSchema{
		ID:         id,
		Title:      title,
		Fields:     []*Field{},
		Properties: make(map[string]interface{}),
	}
}

// AddField adds a field to the form schema
func (fs *FormSchema) AddField(field *Field) *FormSchema {
	fs.Fields = append(fs.Fields, field)
	return fs
}

// FindFieldByID returns a field by its ID
func (fs *FormSchema) FindFieldByID(id string) *Field {
	for _, field := range fs.Fields {
		if field.ID == id {
			return field
		}
		// Check nested fields
		if field.Nested != nil {
			for _, nestedField := range field.Nested {
				if nestedField.ID == id {
					return nestedField
				}
			}
		}
	}
	return nil
}

// SortFields sorts fields by their order property
func (fs *FormSchema) SortFields() {
	// Implementation uses sort.Slice in real implementation
	// Simplified version for demonstration
}
