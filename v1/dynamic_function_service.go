package smartform

import (
	"encoding/json"
	"fmt"
	"reflect"
	"strings"
	"sync"
)

// DynamicFunctionService manages and executes dynamic functions for form fields
type DynamicFunctionService struct {
	functions     map[string]DynamicFunction
	functionLock  sync.RWMutex
	transformers  map[string]DataTransformer
	transformLock sync.RWMutex
}

// DynamicFunction represents a function that can be called at runtime
type DynamicFunction func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error)

// DataTransformer represents a function that transforms data
type DataTransformer func(data interface{}, params map[string]interface{}) (interface{}, error)

// NewDynamicFunctionService creates a new dynamic function service
func NewDynamicFunctionService() *DynamicFunctionService {
	return &DynamicFunctionService{
		functions:    make(map[string]DynamicFunction),
		transformers: make(map[string]DataTransformer),
	}
}

// RegisterFunction registers a dynamic function
func (dfs *DynamicFunctionService) RegisterFunction(name string, fn DynamicFunction) {
	dfs.functionLock.Lock()
	defer dfs.functionLock.Unlock()
	dfs.functions[name] = fn
}

// RegisterTransformer registers a data transformer
func (dfs *DynamicFunctionService) RegisterTransformer(name string, transformer DataTransformer) {
	dfs.transformLock.Lock()
	defer dfs.transformLock.Unlock()
	dfs.transformers[name] = transformer
}

// ExecuteFunction executes a dynamic function with the given arguments
func (dfs *DynamicFunctionService) ExecuteFunction(
	functionName string,
	args map[string]interface{},
	formState map[string]interface{},
) (interface{}, error) {
	dfs.functionLock.RLock()
	fn, exists := dfs.functions[functionName]
	dfs.functionLock.RUnlock()

	if !exists {
		return nil, fmt.Errorf("function '%s' not found", functionName)
	}

	// Replace any template variables in the arguments
	processedArgs := dfs.processTemplateVars(args, formState)

	// Execute the function
	return fn(processedArgs, formState)
}

// TransformData applies a transformer to the given data
func (dfs *DynamicFunctionService) TransformData(
	transformerName string,
	data interface{},
	params map[string]interface{},
) (interface{}, error) {
	dfs.transformLock.RLock()
	transformer, exists := dfs.transformers[transformerName]
	dfs.transformLock.RUnlock()

	if !exists {
		return nil, fmt.Errorf("transformer '%s' not found", transformerName)
	}

	return transformer(data, params)
}

// processTemplateVars replaces template variables in arguments with values from formState
func (dfs *DynamicFunctionService) processTemplateVars(
	args map[string]interface{},
	formState map[string]interface{},
) map[string]interface{} {
	result := make(map[string]interface{})

	for key, value := range args {
		switch v := value.(type) {
		case string:
			if strings.HasPrefix(v, "${") && strings.HasSuffix(v, "}") {
				fieldName := v[2 : len(v)-1]
				if fieldValue, ok := formState[fieldName]; ok {
					result[key] = fieldValue
				} else {
					result[key] = v
				}
			} else {
				result[key] = v
			}
		case map[string]interface{}:
			result[key] = dfs.processTemplateVars(v, formState)
		default:
			result[key] = v
		}
	}

	return result
}

// FilterOptions applies filtering to a list of options
func (dfs *DynamicFunctionService) FilterOptions(
	options []*Option,
	filterCriteria map[string]interface{},
) []*Option {
	if len(filterCriteria) == 0 {
		return options
	}

	result := []*Option{}

	for _, option := range options {
		if dfs.matchesFilter(option, filterCriteria) {
			result = append(result, option)
		}
	}

	return result
}

// matchesFilter checks if an option matches the filter criteria
func (dfs *DynamicFunctionService) matchesFilter(
	option *Option,
	filterCriteria map[string]interface{},
) bool {
	for key, value := range filterCriteria {
		switch key {
		case "search":
			// Search in both value and label
			searchStr, ok := value.(string)
			if !ok {
				continue
			}

			// Convert option value and label to lowercase strings for case-insensitive search
			valueStr := strings.ToLower(fmt.Sprintf("%v", option.Value))
			labelStr := strings.ToLower(option.Label)
			searchStrLower := strings.ToLower(searchStr)

			if !strings.Contains(valueStr, searchStrLower) && !strings.Contains(labelStr, searchStrLower) {
				return false
			}

		case "values":
			// Match against a list of allowed values
			valuesList, ok := value.([]interface{})
			if !ok {
				continue
			}

			found := false
			for _, allowedValue := range valuesList {
				if reflect.DeepEqual(option.Value, allowedValue) {
					found = true
					break
				}
			}

			if !found {
				return false
			}

		default:
			// Match specific field in option
			propValue, ok := option.Value.(map[string]interface{})[key]
			if !ok {
				return false
			}

			if !reflect.DeepEqual(propValue, value) {
				return false
			}
		}
	}

	return true
}

// SearchAndSort searches and sorts options based on criteria
func (dfs *DynamicFunctionService) SearchAndSort(
	options []*Option,
	searchParams map[string]interface{},
) ([]*Option, error) {
	// Extract parameters
	search, _ := searchParams["search"].(string)
	sort, _ := searchParams["sort"].(string)
	sortDir, _ := searchParams["sortDir"].(string)
	limit, _ := searchParams["limit"].(float64)
	offset, _ := searchParams["offset"].(float64)
	filters, _ := searchParams["filters"].(map[string]interface{})

	// Apply search if specified
	if search != "" {
		options = dfs.filterBySearch(options, search)
	}

	// Apply filters if specified
	if filters != nil {
		options = dfs.FilterOptions(options, filters)
	}

	// Apply sorting if specified
	if sort != "" {
		options = dfs.sortOptions(options, sort, sortDir)
	}

	// Apply pagination if specified
	if limit > 0 {
		startIdx := int(offset)
		endIdx := int(offset + limit)

		if startIdx >= len(options) {
			return []*Option{}, nil
		}

		if endIdx > len(options) {
			endIdx = len(options)
		}

		options = options[startIdx:endIdx]
	}

	return options, nil
}

// filterBySearch filters options by search string
func (dfs *DynamicFunctionService) filterBySearch(options []*Option, search string) []*Option {
	if search == "" {
		return options
	}

	result := []*Option{}
	searchLower := strings.ToLower(search)

	for _, option := range options {
		valueStr := strings.ToLower(fmt.Sprintf("%v", option.Value))
		labelStr := strings.ToLower(option.Label)

		if strings.Contains(valueStr, searchLower) || strings.Contains(labelStr, searchLower) {
			result = append(result, option)
		}
	}

	return result
}

// sortOptions sorts options by the specified field and direction
func (dfs *DynamicFunctionService) sortOptions(options []*Option, sortField string, sortDir string) []*Option {
	result := make([]*Option, len(options))
	copy(result, options)

	// Default sort direction is ascending
	ascending := true
	if strings.ToLower(sortDir) == "desc" {
		ascending = false
	}

	// Sort based on field
	switch sortField {
	case "value":
		// Sort by value
		dfs.sortByValue(result, ascending)
	case "label":
		// Sort by label
		dfs.sortByLabel(result, ascending)
	default:
		// Try to sort by custom field
		dfs.sortByCustomField(result, sortField, ascending)
	}

	return result
}

// sortByValue sorts options by value
func (dfs *DynamicFunctionService) sortByValue(options []*Option, ascending bool) {
	if ascending {
		SortOptionsBy(options, func(a, b *Option) bool {
			return fmt.Sprintf("%v", a.Value) < fmt.Sprintf("%v", b.Value)
		})
	} else {
		SortOptionsBy(options, func(a, b *Option) bool {
			return fmt.Sprintf("%v", a.Value) > fmt.Sprintf("%v", b.Value)
		})
	}
}

// sortByLabel sorts options by label
func (dfs *DynamicFunctionService) sortByLabel(options []*Option, ascending bool) {
	if ascending {
		SortOptionsBy(options, func(a, b *Option) bool {
			return a.Label < b.Label
		})
	} else {
		SortOptionsBy(options, func(a, b *Option) bool {
			return a.Label > b.Label
		})
	}
}

// sortByCustomField sorts options by a custom field within the value (if it's a map)
func (dfs *DynamicFunctionService) sortByCustomField(options []*Option, field string, ascending bool) {
	SortOptionsBy(options, func(a, b *Option) bool {
		// Try to get the field from option value if it's a map
		aMap, aOk := a.Value.(map[string]interface{})
		bMap, bOk := b.Value.(map[string]interface{})

		if !aOk || !bOk {
			return false
		}

		aVal, aOk := aMap[field]
		bVal, bOk := bMap[field]

		if !aOk || !bOk {
			return false
		}

		// Convert to strings for comparison
		aStr := fmt.Sprintf("%v", aVal)
		bStr := fmt.Sprintf("%v", bVal)

		if ascending {
			return aStr < bStr
		} else {
			return aStr > bStr
		}
	})
}

// SortOptionsBy sorts options using the provided less function
func SortOptionsBy(options []*Option, less func(a, b *Option) bool) {
	// Simple bubble sort (for small lists it's fine)
	n := len(options)
	for i := 0; i < n-1; i++ {
		for j := 0; j < n-i-1; j++ {
			if less(options[j+1], options[j]) {
				options[j], options[j+1] = options[j+1], options[j]
			}
		}
	}
}

// DynamicFieldConfig represents configuration for a dynamic field
type DynamicFieldConfig struct {
	FunctionName      string                 `json:"functionName"`
	Arguments         map[string]interface{} `json:"arguments,omitempty"`
	TransformerName   string                 `json:"transformerName,omitempty"`
	TransformerParams map[string]interface{} `json:"transformerParams,omitempty"`
}

// ExecuteWithFormState executes the dynamic field function with form state
func (dfc *DynamicFieldConfig) ExecuteWithFormState(
	service *DynamicFunctionService,
	formState map[string]interface{},
) (interface{}, error) {
	// Execute the function
	result, err := service.ExecuteFunction(dfc.FunctionName, dfc.Arguments, formState)
	if err != nil {
		return nil, err
	}

	// Apply transformer if specified
	if dfc.TransformerName != "" {
		result, err = service.TransformData(dfc.TransformerName, result, dfc.TransformerParams)
		if err != nil {
			return nil, err
		}
	}

	return result, nil
}

// CreateOptionsFromResult converts a function result into options
func (dfc *DynamicFieldConfig) CreateOptionsFromResult(result interface{}) ([]*Option, error) {
	// Handle different result types
	switch v := result.(type) {
	case []*Option:
		// Already the correct format
		return v, nil

	case []Option:
		// Convert to pointer slice
		options := make([]*Option, len(v))
		for i, opt := range v {
			option := opt // Create a copy to avoid issues with loop variable
			options[i] = &option
		}
		return options, nil

	case []map[string]interface{}:
		// Convert maps to options
		options := make([]*Option, len(v))
		for i, item := range v {
			value, hasValue := item["value"]
			label, hasLabel := item["label"]
			icon, _ := item["icon"].(string)

			if !hasValue {
				value = item
			}

			if !hasLabel {
				if labelField, ok := item["name"].(string); ok {
					label = labelField
				} else if labelField, ok := item["title"].(string); ok {
					label = labelField
				} else {
					label = fmt.Sprintf("%v", value)
				}
			}

			options[i] = &Option{
				Value: value,
				Label: fmt.Sprintf("%v", label),
				Icon:  icon,
			}
		}
		return options, nil

	case map[string]interface{}:
		// Convert map entries to options
		options := []*Option{}
		for key, value := range v {
			var label string

			switch val := value.(type) {
			case map[string]interface{}:
				if labelVal, ok := val["label"]; ok {
					label = fmt.Sprintf("%v", labelVal)
				} else if nameVal, ok := val["name"]; ok {
					label = fmt.Sprintf("%v", nameVal)
				} else {
					label = key
				}
				options = append(options, &Option{
					Value: key,
					Label: label,
				})
			default:
				options = append(options, &Option{
					Value: key,
					Label: fmt.Sprintf("%v", value),
				})
			}
		}
		return options, nil

	default:
		// Try to marshal and unmarshal as JSON
		jsonData, err := json.Marshal(result)
		if err != nil {
			return nil, fmt.Errorf("unsupported result type: %T", result)
		}

		var optionList []*Option
		if err := json.Unmarshal(jsonData, &optionList); err != nil {
			return nil, fmt.Errorf("failed to convert result to options: %v", err)
		}

		return optionList, nil
	}
}
