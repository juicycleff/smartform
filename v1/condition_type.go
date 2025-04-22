package smartform

import (
	"database/sql/driver"
	"fmt"
)

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

// Scan implements the sql.Scanner interface to read from a database value.
func (ct *ConditionType) Scan(value interface{}) error {
	if str, ok := value.(string); ok {
		*ct = ConditionType(str)
		return nil
	}
	return fmt.Errorf("failed to scan ConditionType: invalid type %T", value)
}

// Value implements the driver.Valuer interface to convert to a database value.
func (ct ConditionType) Value() (driver.Value, error) {
	return string(ct), nil
}

// UnmarshalText implements the encoding.TextUnmarshaler interface.
func (ct *ConditionType) UnmarshalText(text []byte) error {
	*ct = ConditionType(text)
	return nil
}

// MarshalText implements the encoding.TextMarshaler interface.
func (ct ConditionType) MarshalText() ([]byte, error) {
	return []byte(ct), nil
}

// Values returns all possible values for ConditionType
func (ConditionType) Values() []string {
	return []string{
		string(ConditionTypeSimple),
		string(ConditionTypeAnd),
		string(ConditionTypeOr),
		string(ConditionTypeNot),
		string(ConditionTypeExists),
		string(ConditionTypeExpression),
	}
}

// IsValid checks if the ConditionType is valid
func (ct ConditionType) IsValid() bool {
	for _, v := range ConditionType("").Values() {
		if string(ct) == v {
			return true
		}
	}
	return false
}
