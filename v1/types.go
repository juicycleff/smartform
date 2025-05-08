package smartform

import (
	"sort"
	"time"
)

// FormSchema represents the entire form structure
type FormSchema struct {
	ID          string                 `json:"id"`
	Title       string                 `json:"title"`
	Description string                 `json:"description,omitempty"`
	Type        FormType               `json:"type"`               // Type of form (regular or auth)
	AuthType    AuthStrategy           `json:"authType,omitempty"` // Auth type if this is an auth form
	Fields      []*Field               `json:"fields"`
	Properties  map[string]interface{} `json:"properties,omitempty"`
	validator   *Validator

	// Map of registered functions - not serialized
	functions map[string]DynamicFunction `json:"-"`
}

// Field represents a single form field with all its properties
type Field struct {
	ID              string                 `json:"id"`
	Type            FieldType              `json:"type"`
	Label           string                 `json:"label"`
	Required        bool                   `json:"required"`
	RequiredIf      *Condition             `json:"requiredIf,omitempty"`
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

// Condition represents a conditional expression for field visibility or enablement
type Condition struct {
	Type       ConditionType `json:"type"`
	Field      string        `json:"field,omitempty"`      // Reference to another field
	Value      interface{}   `json:"value,omitempty"`      // Static value for comparison
	Operator   string        `json:"operator,omitempty"`   // eq, neq, gt, lt, etc.
	Conditions []*Condition  `json:"conditions,omitempty"` // For AND/OR conditions
	Expression string        `json:"expression,omitempty"` // For custom expressions
}

// ValidationRule represents a validation constraint for a field
type ValidationRule struct {
	Type       ValidationType `json:"type"`
	Message    string         `json:"message"`
	Parameters interface{}    `json:"parameters,omitempty"` // Type-specific parameters
}

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
	Type           string                 `json:"type"` // api, function, etc.
	Endpoint       string                 `json:"endpoint,omitempty"`
	Method         string                 `json:"method,omitempty"`
	Headers        map[string]string      `json:"headers,omitempty"`
	Parameters     map[string]interface{} `json:"parameters,omitempty"`
	ValuePath      string                 `json:"valuePath,omitempty"` // JSON path to value in response
	LabelPath      string                 `json:"labelPath,omitempty"` // JSON path to label in response
	RefreshOn      []string               `json:"refreshOn,omitempty"` // Fields that trigger refresh
	FunctionName   string                 `json:"functionName,omitempty"`
	FunctionConfig *DynamicFieldConfig    `json:"functionConfig,omitempty"`

	// This won't be serialized to JSON but allows passing a direct function reference
	// when creating the options - won't survive serialization
	DirectFunction DynamicFunction `json:"-"`
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
	f := &FormSchema{
		ID:         id,
		Title:      title,
		Fields:     []*Field{},
		Properties: make(map[string]interface{}),
		Type:       FormTypeRegular, // Set default form type
	}

	f.validator = NewValidator(f)
	return f
}

// NewAuthFormSchema creates a new authentication form schema instance
func NewAuthFormSchema(id, title string, authType AuthStrategy) *FormSchema {
	f := &FormSchema{
		ID:         id,
		Title:      title,
		Type:       FormTypeAuth,
		AuthType:   authType,
		Fields:     []*Field{},
		Properties: make(map[string]interface{}),
	}

	f.validator = NewValidator(f)
	return f
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

// Validate validates the given form data against the schema and returns a ValidationResult containing validation outcomes.
func (fs *FormSchema) Validate(data map[string]any) *ValidationResult {
	return fs.validator.ValidateForm(data)
}

// SortFields sorts fields by their order property
func (fs *FormSchema) SortFields() {
	// First, ensure all fields have an order value
	fs.ensureFieldsHaveOrder()

	// Sort top-level fields
	sort.Slice(fs.Fields, func(i, j int) bool {
		return fs.Fields[i].Order < fs.Fields[j].Order
	})

	// Also sort nested fields recursively
	for _, field := range fs.Fields {
		if field.Nested != nil && len(field.Nested) > 0 {
			sortNestedFields(field.Nested)
		}
	}
}

// ensureFieldsHaveOrder assigns default order values to fields that don't have them set
func (fs *FormSchema) ensureFieldsHaveOrder() {
	// First pass: count fields with explicit order
	hasExplicitOrder := 0
	for _, field := range fs.Fields {
		if field.Order > 0 {
			hasExplicitOrder++
		}
	}

	// If no fields have explicit order, assign sequential order based on definition order
	if hasExplicitOrder == 0 {
		for i, field := range fs.Fields {
			field.Order = i + 1 // Start from 1 to avoid conflicts with zero values
		}
		return
	}

	// If some fields have explicit order, assign high order values to unordered fields
	// to ensure they appear after explicitly ordered fields
	maxOrder := 0
	for _, field := range fs.Fields {
		if field.Order > maxOrder {
			maxOrder = field.Order
		}
	}

	nextOrder := maxOrder + 1
	for _, field := range fs.Fields {
		if field.Order == 0 {
			field.Order = nextOrder
			nextOrder++
		}
	}

	// Recursively ensure orders for nested fields
	for _, field := range fs.Fields {
		if field.Nested != nil && len(field.Nested) > 0 {
			ensureNestedFieldsHaveOrder(field.Nested)
		}
	}
}

// ensureNestedFieldsHaveOrder assigns default order values to nested fields
func ensureNestedFieldsHaveOrder(fields []*Field) {
	// First pass: count fields with explicit order
	hasExplicitOrder := 0
	for _, field := range fields {
		if field.Order > 0 {
			hasExplicitOrder++
		}
	}

	// If no fields have explicit order, assign sequential order based on definition order
	if hasExplicitOrder == 0 {
		for i, field := range fields {
			field.Order = i + 1 // Start from 1 to avoid conflicts with zero values
		}
	} else {
		// If some fields have explicit order, assign high order values to unordered fields
		maxOrder := 0
		for _, field := range fields {
			if field.Order > maxOrder {
				maxOrder = field.Order
			}
		}

		nextOrder := maxOrder + 1
		for _, field := range fields {
			if field.Order == 0 {
				field.Order = nextOrder
				nextOrder++
			}
		}
	}

	// Recursively ensure orders for nested fields
	for _, field := range fields {
		if field.Nested != nil && len(field.Nested) > 0 {
			ensureNestedFieldsHaveOrder(field.Nested)
		}
	}
}

// sortNestedFields recursively sorts nested fields by their order property
func sortNestedFields(fields []*Field) {
	sort.Slice(fields, func(i, j int) bool {
		return fields[i].Order < fields[j].Order
	})

	// Recursively sort nested fields
	for _, field := range fields {
		if field.Nested != nil && len(field.Nested) > 0 {
			sortNestedFields(field.Nested)
		}
	}
}
