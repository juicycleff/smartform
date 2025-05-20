package template

import (
	"fmt"
	"reflect"
	"sort"
	"strings"
	"time"
)

// VariableSuggestion represents a single variable suggestion for the UI
type VariableSuggestion struct {
	Expr        string      `json:"expr"`        // The expression to use (e.g., "customer.address.city")
	Type        string      `json:"type"`        // The data type (e.g., "string", "number", "object", "array")
	Description string      `json:"description"` // Human-readable description
	Value       interface{} `json:"value"`       // Sample value (for preview)
	Children    []string    `json:"children"`    // Child property paths, if an object
	IsNested    bool        `json:"isNested"`    // Whether this is a nested property
	ArrayInfo   *ArrayInfo  `json:"arrayInfo"`   // Info about array, if this is an array
	IsFunction  bool        `json:"isFunction"`  // Whether this is a function
	Signature   string      `json:"signature"`   // Function signature, if a function
}

// ArrayInfo contains information about an array type
type ArrayInfo struct {
	ItemType     string `json:"itemType"`     // Type of items in the array
	SampleAccess string `json:"sampleAccess"` // Example of how to access an item (e.g., "items[0]")
}

// GenerateVariableSuggestions creates a list of all available variables and their properties
func (vr *VariableRegistry) GenerateVariableSuggestions() []*VariableSuggestion {
	suggestions := make([]*VariableSuggestion, 0)

	// Add all variables
	vr.mutex.RLock()
	for name, value := range vr.variables {
		// Add the root variable
		varType := getValueType(value)
		suggestion := &VariableSuggestion{
			Expr:        name,
			Type:        varType,
			Description: fmt.Sprintf("%s variable", name),
			Value:       getSampleValue(value),
			Children:    make([]string, 0),
		}

		suggestions = append(suggestions, suggestion)

		// Add nested properties recursively
		nestedSuggestions := generateNestedSuggestions(name, value)
		suggestions = append(suggestions, nestedSuggestions...)

		// Populate children for the root suggestion
		for _, nested := range nestedSuggestions {
			// Only direct children
			if strings.Count(nested.Expr, ".") == 1 &&
				strings.HasPrefix(nested.Expr, name+".") {
				parts := strings.Split(nested.Expr, ".")
				if len(parts) == 2 {
					suggestion.Children = append(suggestion.Children, parts[1])
				}
			}
		}
	}

	// Add all functions with appropriate signatures
	for name := range vr.functions {
		signature, description := getFunctionInfo(name)
		suggestions = append(suggestions, &VariableSuggestion{
			Expr:        name,
			Type:        "function",
			Description: description,
			IsFunction:  true,
			Signature:   signature,
		})
	}
	vr.mutex.RUnlock()

	return suggestions
}

// generateNestedSuggestions recursively creates suggestions for nested properties
func generateNestedSuggestions(prefix string, value interface{}) []*VariableSuggestion {
	suggestions := make([]*VariableSuggestion, 0)

	switch v := value.(type) {
	case map[string]interface{}:
		// Add a suggestion for each property in the map
		childNames := make([]string, 0, len(v))
		for key, propVal := range v {
			childNames = append(childNames, key)
			propExpr := fmt.Sprintf("%s.%s", prefix, key)
			propType := getValueType(propVal)

			suggestion := &VariableSuggestion{
				Expr:        propExpr,
				Type:        propType,
				Description: fmt.Sprintf("Property of %s", prefix),
				Value:       getSampleValue(propVal),
				IsNested:    true,
			}

			suggestions = append(suggestions, suggestion)

			// Recursively add nested properties
			suggestions = append(suggestions, generateNestedSuggestions(propExpr, propVal)...)
		}

		// Update the parent suggestion with child property names
		sort.Strings(childNames)
		for i, s := range suggestions {
			if s.Expr == prefix {
				suggestions[i].Children = childNames
				break
			}
		}

	case []interface{}:
		// Add array-specific suggestions
		if len(v) > 0 {
			// Add a suggestion for accessing the first element
			firstItemExpr := fmt.Sprintf("%s[0]", prefix)
			firstItemType := getValueType(v[0])

			suggestion := &VariableSuggestion{
				Expr:        firstItemExpr,
				Type:        firstItemType,
				Description: fmt.Sprintf("First element of %s array", prefix),
				Value:       getSampleValue(v[0]),
				IsNested:    true,
			}

			suggestions = append(suggestions, suggestion)

			// Recursively add nested properties of the first element
			suggestions = append(suggestions, generateNestedSuggestions(firstItemExpr, v[0])...)

			// Add array info to the parent suggestion
			for i, s := range suggestions {
				if s.Expr == prefix {
					suggestions[i].ArrayInfo = &ArrayInfo{
						ItemType:     firstItemType,
						SampleAccess: firstItemExpr,
					}
					break
				}
			}
		}
	}

	return suggestions
}

// getValueType determines the type of a value as a string
func getValueType(value interface{}) string {
	if value == nil {
		return "null"
	}

	switch v := value.(type) {
	case bool:
		return "boolean"
	case int, int32, int64, float32, float64:
		return "number"
	case string:
		return "string"
	case []interface{}:
		if len(v) > 0 {
			itemType := getValueType(v[0])
			return fmt.Sprintf("array<%s>", itemType)
		}
		return "array"
	case map[string]interface{}:
		return "object"
	case time.Time:
		return "date"
	default:
		// Use reflection for other types
		rt := reflect.TypeOf(value)
		if rt.Kind() == reflect.Slice || rt.Kind() == reflect.Array {
			return "array"
		}
		if rt.Kind() == reflect.Map || rt.Kind() == reflect.Struct {
			return "object"
		}
		return rt.String()
	}
}

// getSampleValue returns a simplified version of a value for preview
func getSampleValue(value interface{}) interface{} {
	if value == nil {
		return nil
	}

	switch v := value.(type) {
	case []interface{}:
		if len(v) > 0 {
			return []interface{}{getSampleValue(v[0]), "..."}
		}
		return []interface{}{}
	case map[string]interface{}:
		if len(v) > 3 {
			// Return just a few keys for large objects
			sample := make(map[string]interface{})
			count := 0
			for k, val := range v {
				if count < 3 {
					sample[k] = getSampleValue(val)
					count++
				} else {
					break
				}
			}
			return sample
		}
		// For smaller objects, include all properties but simplify their values
		sample := make(map[string]interface{})
		for k, val := range v {
			sample[k] = getSampleValue(val)
		}
		return sample
	case string:
		// Truncate long strings
		if len(v) > 20 {
			return v[:20] + "..."
		}
		return v
	default:
		return value
	}
}

// getFunctionInfo returns the signature and description for a function
func getFunctionInfo(name string) (string, string) {
	// Define signatures and descriptions for standard functions
	functionInfo := map[string]struct {
		Signature   string
		Description string
	}{
		"if": {
			Signature:   "if(condition, trueValue, falseValue)",
			Description: "Returns trueValue if condition is true, otherwise falseValue",
		},
		"eq": {
			Signature:   "eq(value1, value2)",
			Description: "Returns true if value1 equals value2",
		},
		"ne": {
			Signature:   "ne(value1, value2)",
			Description: "Returns true if value1 is not equal to value2",
		},
		"gt": {
			Signature:   "gt(value1, value2)",
			Description: "Returns true if value1 is greater than value2",
		},
		"lt": {
			Signature:   "lt(value1, value2)",
			Description: "Returns true if value1 is less than value2",
		},
		"add": {
			Signature:   "add(number1, number2, ...)",
			Description: "Adds all numbers together",
		},
		"subtract": {
			Signature:   "subtract(number1, number2)",
			Description: "Subtracts the second number from the first",
		},
		"multiply": {
			Signature:   "multiply(number1, number2, ...)",
			Description: "Multiplies all numbers together",
		},
		"divide": {
			Signature:   "divide(number1, number2)",
			Description: "Divides the first number by the second",
		},
		"mod": {
			Signature:   "mod(number1, number2)",
			Description: "Returns the remainder of dividing the first number by the second",
		},
		"concat": {
			Signature:   "concat(value1, value2, ...)",
			Description: "Concatenates all values into a single string",
		},
		"format": {
			Signature:   "format(formatString, value1, value2, ...)",
			Description: "Formats a string using printf-style formatting",
		},
		"length": {
			Signature:   "length(value)",
			Description: "Returns the length of a string, array, or object",
		},
		"substring": {
			Signature:   "substring(string, startIndex, [endIndex])",
			Description: "Returns a portion of a string",
		},
		"toLower": {
			Signature:   "toLower(string)",
			Description: "Converts a string to lowercase",
		},
		"toUpper": {
			Signature:   "toUpper(string)",
			Description: "Converts a string to uppercase",
		},
		"trim": {
			Signature:   "trim(string)",
			Description: "Removes whitespace from both ends of a string",
		},
		"join": {
			Signature:   "join(array, separator)",
			Description: "Joins array elements into a string with the specified separator",
		},
		"first": {
			Signature:   "first(array)",
			Description: "Returns the first element of an array",
		},
		"last": {
			Signature:   "last(array)",
			Description: "Returns the last element of an array",
		},
		"count": {
			Signature:   "count(array)",
			Description: "Returns the number of elements in an array",
		},
		"toString": {
			Signature:   "toString(value)",
			Description: "Converts a value to a string",
		},
		"toNumber": {
			Signature:   "toNumber(value)",
			Description: "Converts a value to a number",
		},
		"toBool": {
			Signature:   "toBool(value)",
			Description: "Converts a value to a boolean",
		},
		"default": {
			Signature:   "default(value, defaultValue)",
			Description: "Returns value if it's not null or empty, otherwise returns defaultValue",
		},
		"coalesce": {
			Signature:   "coalesce(value1, value2, ...)",
			Description: "Returns the first non-null, non-empty value",
		},
		"now": {
			Signature:   "now()",
			Description: "Returns the current date and time",
		},
		"formatDate": {
			Signature:   "formatDate(date, [format])",
			Description: "Formats a date according to the specified format",
		},
		"addDays": {
			Signature:   "addDays(date, days)",
			Description: "Adds the specified number of days to a date",
		},
	}

	if info, ok := functionInfo[name]; ok {
		return info.Signature, info.Description
	}

	// For custom functions not in our map
	return name + "(...)", "Custom function"
}
