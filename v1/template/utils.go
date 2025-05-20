package template

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// getValueByPath retrieves a value by path from a map, supporting dot notation and array indices
// Example paths: "user.name", "items[0]", "users[0].addresses[1].street"
func getValueByPath(data map[string]interface{}, path string) interface{} {
	// Handle empty path
	if path == "" {
		return nil
	}

	// Use a regex to identify array access patterns
	arrayAccessRegex := regexp.MustCompile(`(\w+)\[(\d+)\]`)

	// Parse the path into parts, handling both dot notation and array access
	var parts []string
	currentPath := path

	for currentPath != "" {
		// Check for array notation first
		arrayMatch := arrayAccessRegex.FindStringSubmatchIndex(currentPath)
		if len(arrayMatch) > 0 {
			// We found an array access pattern

			// If there's content before the array notation, add it as a part
			if arrayMatch[0] > 0 {
				// If there's a dot before the array notation, split on it
				dotBeforeArray := strings.LastIndex(currentPath[:arrayMatch[0]], ".")
				if dotBeforeArray != -1 {
					parts = append(parts, currentPath[:dotBeforeArray])
					currentPath = currentPath[dotBeforeArray+1:]
					continue
				} else {
					// No dot, just add the part before the array
					parts = append(parts, currentPath[:arrayMatch[0]])
					currentPath = currentPath[arrayMatch[0]:]
				}
			}

			// Extract the array name and index
			arrayName := currentPath[arrayMatch[2]:arrayMatch[3]] // The array field name
			indexStr := currentPath[arrayMatch[4]:arrayMatch[5]]  // The index as a string

			// Combine them as a special part with the array notation
			parts = append(parts, fmt.Sprintf("%s[%s]", arrayName, indexStr))

			// Move past this part in the path
			if arrayMatch[1] < len(currentPath) {
				// If there's more after the array access
				if currentPath[arrayMatch[1]] == '.' {
					// Skip the dot
					currentPath = currentPath[arrayMatch[1]+1:]
				} else {
					currentPath = currentPath[arrayMatch[1]:]
				}
			} else {
				// We've reached the end
				currentPath = ""
			}
		} else {
			// No array notation, use dot notation
			dotIndex := strings.Index(currentPath, ".")
			if dotIndex == -1 {
				// No more dots, add the rest and finish
				parts = append(parts, currentPath)
				currentPath = ""
			} else {
				// Add the part before the dot
				parts = append(parts, currentPath[:dotIndex])
				// Continue with the part after the dot
				currentPath = currentPath[dotIndex+1:]
			}
		}
	}

	// Now we have the parts, navigate through them
	var current interface{} = data

	for _, part := range parts {
		// Check if this part is an array access
		arrayMatch := arrayAccessRegex.FindStringSubmatch(part)
		if len(arrayMatch) > 0 {
			// It's an array access
			arrayName := arrayMatch[1]
			indexStr := arrayMatch[2]

			// Parse the index
			index, err := strconv.Atoi(indexStr)
			if err != nil {
				return nil // Invalid index
			}

			// Get the array
			var array []interface{}

			// First, get the array by name from the current context
			switch c := current.(type) {
			case map[string]interface{}:
				arrayValue, ok := c[arrayName]
				if !ok {
					return nil // Array not found
				}

				// Ensure it's actually an array
				if arr, ok := arrayValue.([]interface{}); ok {
					array = arr
				} else {
					return nil // Not an array
				}

			default:
				return nil // Current context is not a map, can't access field
			}

			// Check if the index is valid
			if index < 0 || index >= len(array) {
				return nil // Index out of bounds
			}

			// Access the array element
			element := array[index]

			// Convert ints to float64 for consistency with JSON parsing
			if intVal, isInt := element.(int); isInt {
				element = float64(intVal)
			}

			// Update current to the array element
			current = element

		} else {
			// Regular field access
			switch c := current.(type) {
			case map[string]interface{}:
				var ok bool
				current, ok = c[part]
				if !ok {
					return nil // Field not found
				}

				// Convert ints to float64 for consistency
				if intVal, isInt := current.(int); isInt {
					current = float64(intVal)
				}

			default:
				return nil // Can't navigate further, not a map
			}
		}
	}

	return current
}

// Helper function to check if a value is a number
func isNumber(value interface{}) bool {
	switch value.(type) {
	case int, int32, int64, float32, float64:
		return true
	default:
		return false
	}
}

// Helper function to check if we're in a coalesce context
func isCoalesceContext(context map[string]interface{}) bool {
	_, ok := context["__coalesce"]
	return ok
}
