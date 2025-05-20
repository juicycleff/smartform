package template

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

// TemplatePart represents a part of a template expression
type TemplatePart interface {
	Evaluate(registry *VariableRegistry, context map[string]interface{}) (interface{}, error)
}

// TextPart represents a static text part of a template
type TextPart struct {
	Text string
}

// Evaluate returns the static text
func (tp *TextPart) Evaluate(registry *VariableRegistry, context map[string]interface{}) (interface{}, error) {
	return tp.Text, nil
}

// VariablePart represents a variable reference in a template
type VariablePart struct {
	Path string
}

// Evaluate looks up the variable value in context or registry
func (vp *VariablePart) Evaluate(registry *VariableRegistry, context map[string]interface{}) (interface{}, error) {
	// Check if it's a context variable
	value := getValueByPath(context, vp.Path)
	if value != nil {
		return value, nil
	}

	// Check if it's a registry variable using the complex path
	// Extract the root variable name first
	rootVar := vp.Path
	dotIndex := strings.Index(vp.Path, ".")
	bracketIndex := strings.Index(vp.Path, "[")

	if dotIndex > 0 && (bracketIndex < 0 || dotIndex < bracketIndex) {
		// If there's a dot and it comes before any bracket, use it to find root
		rootVar = vp.Path[:dotIndex]
	} else if bracketIndex > 0 {
		// If there's a bracket, the root is everything before it
		rootVar = vp.Path[:bracketIndex]
	}

	// Get the root variable from registry
	if rootValue, ok := registry.variables[rootVar]; ok {
		// If we just wanted the root variable
		if vp.Path == rootVar {
			return rootValue, nil
		}

		// Otherwise, dig into the object
		fakeContext := map[string]interface{}{rootVar: rootValue}
		result := getValueByPath(fakeContext, vp.Path)
		if result != nil {
			return result, nil
		}
	}

	// Special handling for direct array access on registry variables
	// This handles cases like "items[0]" directly
	arrayAccessRegex := regexp.MustCompile(`^([a-zA-Z0-9_]+)\[(\d+)\](.*)$`)
	match := arrayAccessRegex.FindStringSubmatch(vp.Path)
	if len(match) > 0 {
		arrayName := match[1]
		indexStr := match[2]
		remainder := match[3]

		// Get the array from registry
		if arrayValue, ok := registry.variables[arrayName]; ok {
			// Convert the array value
			if array, ok := arrayValue.([]interface{}); ok {
				// Parse the index
				index, err := strconv.Atoi(indexStr)
				if err != nil || index < 0 || index >= len(array) {
					return nil, fmt.Errorf("invalid array index: %s", indexStr)
				}

				// Get the element at the index
				element := array[index]

				// If there's more to the path, process it
				if remainder == "" {
					return element, nil
				} else if strings.HasPrefix(remainder, ".") {
					// Handle property access on array element
					if elemMap, ok := element.(map[string]interface{}); ok {
						propName := remainder[1:] // Remove the leading dot
						if propValue, ok := elemMap[propName]; ok {
							return propValue, nil
						}
					}
				}
			}
		}
	}

	// Special handling for coalesce context - return nil instead of error
	if isCoalesceContext(context) {
		return nil, nil
	}

	return nil, fmt.Errorf("variable not found: %s", vp.Path)
}

// FunctionPart represents a function call in a template
type FunctionPart struct {
	Name string
	Args []TemplatePart
}

// Evaluate calls the function with evaluated arguments
func (fp *FunctionPart) Evaluate(registry *VariableRegistry, context map[string]interface{}) (interface{}, error) {
	fn, ok := registry.GetFunction(fp.Name)
	if !ok {
		return nil, fmt.Errorf("function not found: %s", fp.Name)
	}

	args := make([]interface{}, len(fp.Args))
	for i, arg := range fp.Args {
		value, err := arg.Evaluate(registry, context)
		if err != nil {
			return nil, err
		}
		args[i] = value
	}

	return fn(args)
}

// NullCoalescePart represents a null coalescing operation (a ?? b)
type NullCoalescePart struct {
	Left  TemplatePart
	Right TemplatePart
}

// Evaluate returns the left value if not nil/empty, otherwise the right value
func (ncp *NullCoalescePart) Evaluate(registry *VariableRegistry, context map[string]interface{}) (interface{}, error) {
	// Try to evaluate the left part, but don't propagate errors
	leftVal, leftErr := ncp.Left.Evaluate(registry, context)

	// If left part evaluated successfully and is not nil/empty, use it
	if leftErr == nil && leftVal != nil {
		// For strings, also check if it's empty
		if strVal, isStr := leftVal.(string); !isStr || strVal != "" {
			return leftVal, nil
		}
	}

	// Otherwise, evaluate and use the right part
	rightVal, rightErr := ncp.Right.Evaluate(registry, context)
	return rightVal, rightErr
}
