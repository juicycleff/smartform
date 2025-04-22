package smartform

import (
	"fmt"
)

// ValidationType defines the type of validation
type ValidationType string

// Define validation types
const (
	ValidationTypeRequired        ValidationType = "required"
	ValidationTypeRequiredIf      ValidationType = "requiredIf"
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

// Values returns all possible values of ValidationType
func (vt ValidationType) Values() []string {
	return []string{
		string(ValidationTypeRequired),
		string(ValidationTypeRequiredIf),
		string(ValidationTypeMinLength),
		string(ValidationTypeMaxLength),
		string(ValidationTypePattern),
		string(ValidationTypeMin),
		string(ValidationTypeMax),
		string(ValidationTypeEmail),
		string(ValidationTypeURL),
		string(ValidationTypeCustom),
		string(ValidationTypeUnique),
		string(ValidationTypeFileType),
		string(ValidationTypeFileSize),
		string(ValidationTypeImageDimensions),
		string(ValidationTypeDependency),
	}
}

// String returns the string representation of ValidationType
func (vt ValidationType) String() string {
	return string(vt)
}

// IsValid checks if the value of ValidationType is valid
func (vt ValidationType) IsValid() bool {
	switch vt {
	case ValidationTypeRequired,
		ValidationTypeRequiredIf,
		ValidationTypeMinLength,
		ValidationTypeMaxLength,
		ValidationTypePattern,
		ValidationTypeMin,
		ValidationTypeMax,
		ValidationTypeEmail,
		ValidationTypeURL,
		ValidationTypeCustom,
		ValidationTypeUnique,
		ValidationTypeFileType,
		ValidationTypeFileSize,
		ValidationTypeImageDimensions,
		ValidationTypeDependency:
		return true
	default:
		return false
	}
}

// MarshalText implements the encoding.TextMarshaler interface
func (vt ValidationType) MarshalText() ([]byte, error) {
	if !vt.IsValid() {
		return nil, fmt.Errorf("invalid ValidationType: %s", vt)
	}
	return []byte(vt), nil
}

// UnmarshalText implements the encoding.TextUnmarshaler interface
func (vt *ValidationType) UnmarshalText(text []byte) error {
	val := ValidationType(text)
	if !val.IsValid() {
		return fmt.Errorf("invalid ValidationType: %s", val)
	}
	*vt = val
	return nil
}
