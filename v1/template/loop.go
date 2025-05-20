package template

import (
	"fmt"
	"strings"
)

// ForEachPart represents a loop construct in a template
type ForEachPart struct {
	ItemVar    string
	IndexVar   string
	Collection TemplatePart
	Body       TemplatePart
}

// Evaluate executes the loop and concatenates the results
func (fp *ForEachPart) Evaluate(registry *VariableRegistry, context map[string]interface{}) (interface{}, error) {
	// Evaluate the collection
	collection, err := fp.Collection.Evaluate(registry, context)
	if err != nil {
		return nil, err
	}

	var items []interface{}
	switch v := collection.(type) {
	case []interface{}:
		items = v
	case map[string]interface{}:
		// For maps, iterate over key-value pairs
		items = make([]interface{}, 0, len(v))
		for key, value := range v {
			items = append(items, map[string]interface{}{
				"key":   key,
				"value": value,
			})
		}
	default:
		return "", nil // Not a collection, return empty string
	}

	// Iterate over the collection
	var result strings.Builder
	for i, item := range items {
		// Create a new context with the item variable
		loopContext := make(map[string]interface{})
		for k, v := range context {
			loopContext[k] = v
		}
		loopContext[fp.ItemVar] = item
		if fp.IndexVar != "" {
			loopContext[fp.IndexVar] = i
		}

		// Evaluate the body with the new context
		bodyResult, err := fp.Body.Evaluate(registry, loopContext)
		if err != nil {
			return nil, err
		}

		// Skip empty results for conditional cases
		if bodyStr, ok := bodyResult.(string); ok && bodyStr == "" {
			continue
		}

		// Append the result
		result.WriteString(fmt.Sprintf("%v", bodyResult))
	}

	return result.String(), nil
}
