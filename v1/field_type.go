package smartform

import (
	"database/sql/driver"
	"fmt"
)

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

// Values provides all possible values for FieldType
func (FieldType) Values() (types []string) {
	return []string{
		string(FieldTypeText),
		string(FieldTypeTextarea),
		string(FieldTypeNumber),
		string(FieldTypeSelect),
		string(FieldTypeMultiSelect),
		string(FieldTypeCheckbox),
		string(FieldTypeRadio),
		string(FieldTypeDate),
		string(FieldTypeTime),
		string(FieldTypeDateTime),
		string(FieldTypeEmail),
		string(FieldTypePassword),
		string(FieldTypeFile),
		string(FieldTypeImage),
		string(FieldTypeGroup),
		string(FieldTypeArray),
		string(FieldTypeOneOf),
		string(FieldTypeAnyOf),
		string(FieldTypeSwitch),
		string(FieldTypeSlider),
		string(FieldTypeRating),
		string(FieldTypeObject),
		string(FieldTypeRichText),
		string(FieldTypeColor),
		string(FieldTypeHidden),
		string(FieldTypeSection),
		string(FieldTypeCustom),
		string(FieldTypeAPI),
		string(FieldTypeAuth),
		string(FieldTypeBranch),
	}
}

// Scan Implement sql.Scanner for FieldType
func (ft *FieldType) Scan(value interface{}) error {
	if str, ok := value.(string); ok {
		*ft = FieldType(str)
		return nil
	}
	return fmt.Errorf("cannot scan type %T into FieldType", value)
}

// Value Implement driver.Valuer for FieldType
func (ft FieldType) Value() (driver.Value, error) {
	return string(ft), nil
}

// MarshalText Implement encoding.TextMarshaler for FieldType
func (ft FieldType) MarshalText() ([]byte, error) {
	return []byte(ft), nil
}

// UnmarshalText Implement encoding.TextUnmarshaler for FieldType
func (ft *FieldType) UnmarshalText(data []byte) error {
	*ft = FieldType(string(data))
	return nil
}
