package smartform

// ValidationBuilder provides a fluent API for creating validation rules
type ValidationBuilder struct{}

// NewValidationBuilder creates a new validation builder
func NewValidationBuilder() *ValidationBuilder {
	return &ValidationBuilder{}
}

// Required creates a required validation rule
func (vb *ValidationBuilder) Required(message string) *ValidationRule {
	return &ValidationRule{
		Type:    ValidationTypeRequired,
		Message: message,
	}
}

func (vb *ValidationBuilder) RequiredIf(condition *Condition, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypeRequiredIf,
		Message:    message,
		Parameters: condition,
	}
}

// MinLength creates a minimum length validation rule
func (vb *ValidationBuilder) MinLength(min float64, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypeMinLength,
		Message:    message,
		Parameters: min,
	}
}

// MaxLength creates a maximum length validation rule
func (vb *ValidationBuilder) MaxLength(max float64, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypeMaxLength,
		Message:    message,
		Parameters: max,
	}
}

// Pattern creates a pattern validation rule
func (vb *ValidationBuilder) Pattern(pattern string, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypePattern,
		Message:    message,
		Parameters: pattern,
	}
}

// Min creates a minimum value validation rule
func (vb *ValidationBuilder) Min(min float64, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypeMin,
		Message:    message,
		Parameters: min,
	}
}

// Max creates a maximum value validation rule
func (vb *ValidationBuilder) Max(max float64, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypeMax,
		Message:    message,
		Parameters: max,
	}
}

// Email creates an email validation rule
func (vb *ValidationBuilder) Email(message string) *ValidationRule {
	return &ValidationRule{
		Type:    ValidationTypeEmail,
		Message: message,
	}
}

// URL creates a URL validation rule
func (vb *ValidationBuilder) URL(message string) *ValidationRule {
	return &ValidationRule{
		Type:    ValidationTypeURL,
		Message: message,
	}
}

// FileType creates a file type validation rule
func (vb *ValidationBuilder) FileType(allowedTypes []string, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypeFileType,
		Message:    message,
		Parameters: allowedTypes,
	}
}

// FileSize creates a file size validation rule
func (vb *ValidationBuilder) FileSize(maxSize float64, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypeFileSize,
		Message:    message,
		Parameters: maxSize,
	}
}

// ImageDimensions creates an image dimensions validation rule
func (vb *ValidationBuilder) ImageDimensions(dimensions map[string]interface{}, message string) *ValidationRule {
	return &ValidationRule{
		Type:       ValidationTypeImageDimensions,
		Message:    message,
		Parameters: dimensions,
	}
}

// Dependency creates a field dependency validation rule
func (vb *ValidationBuilder) Dependency(field string, operator string, value interface{}, message string) *ValidationRule {
	return &ValidationRule{
		Type:    ValidationTypeDependency,
		Message: message,
		Parameters: map[string]interface{}{
			"field":    field,
			"operator": operator,
			"value":    value,
		},
	}
}

// Unique creates a uniqueness validation rule
func (vb *ValidationBuilder) Unique(message string) *ValidationRule {
	return &ValidationRule{
		Type:    ValidationTypeUnique,
		Message: message,
	}
}

// Custom creates a custom validation rule
func (vb *ValidationBuilder) Custom(functionName string, params map[string]interface{}, message string) *ValidationRule {
	if params == nil {
		params = make(map[string]interface{})
	}
	params["function"] = functionName

	return &ValidationRule{
		Type:       ValidationTypeCustom,
		Message:    message,
		Parameters: params,
	}
}
