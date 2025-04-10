// Package smart-form provides example functionality
package smart-form

import "github.com/wakflo/smart-form/internal/helper"

// Version is the current version of the library
const Version = "0.1.0"

// SayHello returns a greeting message
func SayHello(name string) string {
	formattedName := helper.FormatName(name)
	return "Hello, " + formattedName + "!"
}
