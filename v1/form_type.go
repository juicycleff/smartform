package smartform

import (
	"database/sql/driver"
	"fmt"
)

// FormType represents the type of form
type FormType string

// Define form types
const (
	FormTypeRegular FormType = "regular" // Standard form
	FormTypeAuth    FormType = "auth"    // Authentication form
)

// Values provides the possible values for FormType, compatible with entgo.
func (FormType) Values() (types []string) {
	return []string{
		string(FormTypeRegular),
		string(FormTypeAuth),
	}
}

// MarshalText implements the encoding.TextMarshaler interface
func (f FormType) MarshalText() ([]byte, error) {
	return []byte(f), nil
}

// UnmarshalText implements the encoding.TextUnmarshaler interface
func (f *FormType) UnmarshalText(text []byte) error {
	switch FormType(text) {
	case FormTypeRegular, FormTypeAuth:
		*f = FormType(text)
		return nil
	default:
		return fmt.Errorf("invalid FormType: %s", string(text))
	}
}

// Scan implements the sql.Scanner interface
func (f *FormType) Scan(value interface{}) error {
	str, ok := value.(string)
	if !ok {
		return fmt.Errorf("FormType should be a string, got %T", value)
	}
	return f.UnmarshalText([]byte(str))
}

// Value implements the driver.Valuer interface
func (f FormType) Value() (driver.Value, error) {
	return string(f), nil
}
