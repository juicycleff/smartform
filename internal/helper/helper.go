// Package helper provides internal utilities for the smart-form library
package helper

// FormatName formats a name for greeting
func FormatName(name string) string {
	if name == "" {
		return "there"
	}
	return name
}
