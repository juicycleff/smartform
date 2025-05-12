package smartform

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// OptionService handles fetching and processing dynamic options
type OptionService struct {
	client          *http.Client
	cache           map[string]*CacheEntry
	cacheTTL        time.Duration
	functionService *DynamicFunctionService
}

// NewOptionService creates a new option service
func NewOptionService(cacheTTL time.Duration) *OptionService {
	return &OptionService{
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
		cache:    make(map[string]*CacheEntry),
		cacheTTL: cacheTTL,
	}
}

// GetDynamicOptions fetches options from a dynamic source
func (os *OptionService) GetDynamicOptions(source *DynamicSource, context map[string]interface{}) ([]*Option, error) {
	switch source.Type {
	case "api":
		return os.fetchAPIOptions(source, context)
	case "function":
		return os.executeFunctionOptions(source, context)
	default:
		return nil, fmt.Errorf("unsupported dynamic source type: %s", source.Type)
	}
}

// fetchAPIOptions fetches options from an API endpoint
func (os *OptionService) fetchAPIOptions(source *DynamicSource, context map[string]interface{}) ([]*Option, error) {
	// Prepare the endpoint URL with context variables
	endpoint := os.replaceContextVariables(source.Endpoint, context)

	// Check cache first
	cacheKey := os.generateCacheKey(endpoint, source.Method, source.Parameters)
	if entry, ok := os.cache[cacheKey]; ok {
		if time.Since(entry.Timestamp) < os.cacheTTL {
			// Cache is still valid
			return os.parseOptionsFromResponse(entry.Data, source.ValuePath, source.LabelPath)
		}
	}

	// Prepare request
	var req *http.Request
	var err error

	if source.Method == "GET" {
		// Append parameters to URL for GET requests
		if len(source.Parameters) > 0 {
			params := []string{}
			for k, v := range source.Parameters {
				params = append(params, fmt.Sprintf("%s=%v", k, v))
			}
			if strings.Contains(endpoint, "?") {
				endpoint += "&" + strings.Join(params, "&")
			} else {
				endpoint += "?" + strings.Join(params, "&")
			}
		}
		req, err = http.NewRequest("GET", endpoint, nil)
	} else {
		// For POST, PUT, etc., add parameters to request body
		jsonData, err := json.Marshal(source.Parameters)
		if err != nil {
			return nil, fmt.Errorf("error marshaling parameters: %w", err)
		}
		req, err = http.NewRequest(source.Method, endpoint, bytes.NewBuffer(jsonData))
		if err != nil {
			return nil, fmt.Errorf("error creating request: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")
	}

	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// Add headers
	for k, v := range source.Headers {
		req.Header.Add(k, v)
	}

	// Execute request
	resp, err := os.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error executing request: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response: %w", err)
	}

	// Check status code
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("API returned error status: %d, body: %s", resp.StatusCode, string(body))
	}

	// Cache the response
	os.cache[cacheKey] = &CacheEntry{
		Data:      body,
		Timestamp: time.Now(),
	}

	// Parse options from response
	return os.parseOptionsFromResponse(body, source.ValuePath, source.LabelPath)
}

// parseOptionsFromResponse extracts options from an API response
func (os *OptionService) parseOptionsFromResponse(data []byte, valuePath, labelPath string) ([]*Option, error) {
	var jsonData interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		return nil, fmt.Errorf("error parsing response JSON: %w", err)
	}

	// Get the array of items from the response
	items, err := os.extractJSONPath(jsonData, "")
	if err != nil {
		return nil, err
	}

	// Convert items to an array if it's not already
	var itemsArray []interface{}
	switch v := items.(type) {
	case []interface{}:
		itemsArray = v
	case map[string]interface{}:
		// If it's a map, convert each key-value pair to an option
		itemsArray = make([]interface{}, 0, len(v))
		for key, val := range v {
			item := map[string]interface{}{
				"key":   key,
				"value": val,
			}
			itemsArray = append(itemsArray, item)
		}
	default:
		return nil, fmt.Errorf("unexpected data type for options: %T", items)
	}

	// Extract options from items
	options := make([]*Option, 0, len(itemsArray))
	for _, item := range itemsArray {
		var value, label interface{}
		var err error

		// Extract value using path
		if valuePath != "" {
			value, err = os.extractJSONPath(item, valuePath)
			if err != nil {
				continue // Skip this item
			}
		} else {
			// Default to the item itself
			value = item
		}

		// Extract label using path
		if labelPath != "" {
			label, err = os.extractJSONPath(item, labelPath)
			if err != nil {
				continue // Skip this item
			}
		} else {
			// Default to using the value as the label
			label = value
		}

		options = append(options, &Option{
			Value: value,
			Label: fmt.Sprintf("%v", label),
		})
	}

	return options, nil
}

// extractJSONPath extracts a value from JSON data using a path
func (os *OptionService) extractJSONPath(data interface{}, path string) (interface{}, error) {
	if path == "" {
		return data, nil
	}

	parts := strings.Split(path, ".")
	current := data

	for _, part := range parts {
		switch v := current.(type) {
		case map[string]interface{}:
			var ok bool
			current, ok = v[part]
			if !ok {
				return nil, fmt.Errorf("path '%s' not found in JSON", path)
			}
		case []interface{}:
			// Handle array indexing (path.0.name)
			if index, err := parseArrayIndex(part); err == nil && index >= 0 && index < len(v) {
				current = v[index]
			} else {
				// Try to apply the part to each item in the array
				result := make([]interface{}, 0, len(v))
				for _, item := range v {
					if mapItem, ok := item.(map[string]interface{}); ok {
						if value, ok := mapItem[part]; ok {
							result = append(result, value)
						}
					}
				}
				current = result
			}
		default:
			return nil, fmt.Errorf("cannot navigate path '%s' in JSON", path)
		}
	}

	return current, nil
}

// parseArrayIndex parses a string into an array index
func parseArrayIndex(s string) (int, error) {
	var index int
	_, err := fmt.Sscanf(s, "%d", &index)
	return index, err
}

// executeFunctionOptions executes a custom function to get options
// This would typically be integrated with a script engine or plugin system
func (os *OptionService) executeFunctionOptions(source *DynamicSource, context map[string]interface{}) ([]*Option, error) {
	// This is a placeholder for custom function execution
	// A real implementation would integrate with a script engine
	return nil, fmt.Errorf("function options not implemented")
}

// generateCacheKey generates a cache key for the request
func (os *OptionService) generateCacheKey(endpoint, method string, params map[string]interface{}) string {
	key := method + ":" + endpoint
	if len(params) > 0 {
		paramJSON, _ := json.Marshal(params)
		key += ":" + string(paramJSON)
	}
	return key
}

// replaceContextVariables replaces ${variable} placeholders with values from context
func (os *OptionService) replaceContextVariables(input string, context map[string]interface{}) string {
	result := input

	// Find all ${variable} placeholders
	for key, value := range context {
		placeholder := "${" + key + "}"
		result = strings.ReplaceAll(result, placeholder, fmt.Sprintf("%v", value))
	}

	return result
}

func (os *OptionService) SetDynamicFunctionService(service *DynamicFunctionService) {
	os.functionService = service
}

func (os *OptionService) fetchFunctionOptions(source *DynamicSource, context map[string]interface{}) ([]*Option, error) {
	// Check if we have direct access to the function
	if source.DirectFunction != nil {
		// Process parameters with context variables
		params := os.processTemplateVars(source.Parameters, context)

		// Generate cache key
		cacheKey := os.generateCacheKey("function:"+source.FunctionName, "", params)

		// Check cache
		if entry, ok := os.cache[cacheKey]; ok {
			if time.Since(entry.Timestamp) < os.cacheTTL {
				var options []*Option
				if err := json.Unmarshal(entry.Data, &options); err != nil {
					return nil, fmt.Errorf("error unmarshaling cached options: %w", err)
				}
				return options, nil
			}
		}

		// Execute the direct function
		result, err := source.DirectFunction(params, context)
		if err != nil {
			return nil, fmt.Errorf("error executing direct function: %w", err)
		}

		// Convert result to options
		options, err := convertResultToOptions(result)
		if err != nil {
			return nil, err
		}

		// Cache the result
		optionsData, err := json.Marshal(options)
		if err != nil {
			return nil, fmt.Errorf("error marshaling options for cache: %w", err)
		}

		os.cache[cacheKey] = &CacheEntry{
			Data:      optionsData,
			Timestamp: time.Now(),
		}

		return options, nil
	}

	// Fall back to function service if available
	if os.functionService == nil {
		return nil, fmt.Errorf("function service not configured and no direct function available")
	}

	// Process parameters with context variables
	params := os.processTemplateVars(source.Parameters, context)

	// Generate cache key
	cacheKey := os.generateCacheKey("function:"+source.FunctionName, "", params)

	// Check cache
	if entry, ok := os.cache[cacheKey]; ok {
		if time.Since(entry.Timestamp) < os.cacheTTL {
			var options []*Option
			if err := json.Unmarshal(entry.Data, &options); err != nil {
				return nil, fmt.Errorf("error unmarshaling cached options: %w", err)
			}
			return options, nil
		}
	}

	// Execute the function
	options, err := os.functionService.ExecuteFunctionForOptions(source.FunctionName, params, context)
	if err != nil {
		return nil, err
	}

	// Cache the result
	optionsData, err := json.Marshal(options)
	if err != nil {
		return nil, fmt.Errorf("error marshaling options for cache: %w", err)
	}

	os.cache[cacheKey] = &CacheEntry{
		Data:      optionsData,
		Timestamp: time.Now(),
	}

	return options, nil
}

func (os *OptionService) processTemplateVars(args map[string]interface{}, formState map[string]interface{}) map[string]interface{} {
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
			result[key] = os.processTemplateVars(v, formState)
		default:
			result[key] = v
		}
	}
	return result
}

// AuthService handles authentication for API integrations
type AuthService struct {
	tokens     map[string]string
	jwtTokens  map[string]string
	samlTokens map[string]string
}

// NewAuthService creates a new authentication service
func NewAuthService() *AuthService {
	return &AuthService{
		tokens: make(map[string]string),
	}
}

// AuthenticateOAuth performs OAuth authentication
func (as *AuthService) AuthenticateOAuth(config map[string]string) (string, error) {
	// Implementation would handle the OAuth flow
	return "", fmt.Errorf("OAuth authentication not implemented")
}

// AuthenticateBasic performs Basic authentication
func (as *AuthService) AuthenticateBasic(username, password string) (string, error) {
	// Implementation would validate credentials and return a token
	return "", fmt.Errorf("Basic authentication not implemented")
}

// AuthenticateAPIKey validates an API key
func (as *AuthService) AuthenticateAPIKey(apiKey string) (string, error) {
	// Implementation would validate the API key
	return "", fmt.Errorf("API key authentication not implemented")
}

// GetToken retrieves a token for a service
func (as *AuthService) GetToken(serviceID string) (string, bool) {
	token, ok := as.tokens[serviceID]
	return token, ok
}

// SetToken stores a token for a service
func (as *AuthService) SetToken(serviceID, token string) {
	as.tokens[serviceID] = token
}

// AuthenticateJWT performs JWT authentication
func (as *AuthService) AuthenticateJWT(jwtConfig map[string]string) (string, error) {
	// Implementation would validate JWT parameters and generate a token
	// This is a simplified placeholder
	return "", fmt.Errorf("JWT authentication not implemented")
}

// AuthenticateSAML performs SAML authentication
func (as *AuthService) AuthenticateSAML(samlConfig map[string]string) (string, error) {
	// Implementation would handle SAML authentication flow
	// This is a simplified placeholder
	return "", fmt.Errorf("SAML authentication not implemented")
}

// GetJWTToken retrieves a JWT token for a service
func (as *AuthService) GetJWTToken(serviceID string) (string, bool) {
	token, ok := as.jwtTokens[serviceID]
	return token, ok
}

// SetJWTToken stores a JWT token for a service
func (as *AuthService) SetJWTToken(serviceID, token string) {
	as.jwtTokens[serviceID] = token
}

// GetSAMLToken retrieves a SAML token for a service
func (as *AuthService) GetSAMLToken(serviceID string) (string, bool) {
	token, ok := as.samlTokens[serviceID]
	return token, ok
}

// SetSAMLToken stores a SAML token for a service
func (as *AuthService) SetSAMLToken(serviceID, token string) {
	as.samlTokens[serviceID] = token
}
