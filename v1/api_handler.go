package smartform

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// APIHandler handles HTTP requests for Autoform
type APIHandler struct {
	schemas                map[string]*FormSchema
	optionService          *OptionService
	authService            *AuthService
	dynamicFunctionService *DynamicFunctionService
	schemasLock            sync.RWMutex
}

// Helper functions for path extraction
func getPathParam(path, prefix string) string {
	if len(path) <= len(prefix) {
		return ""
	}
	return path[len(prefix):]
}

func getPathSegment(path string, index int) string {
	segments := splitPath(path)
	if index < 0 || index >= len(segments) {
		return ""
	}
	return segments[index]
}

func splitPath(path string) []string {
	segments := []string{}
	for _, segment := range splitAndClean(path, '/') {
		if segment != "" {
			segments = append(segments, segment)
		}
	}
	return segments
}

func splitAndClean(s string, sep byte) []string {
	if s == "" {
		return []string{}
	}

	n := 1
	for i := 0; i < len(s); i++ {
		if s[i] == sep {
			n++
		}
	}

	result := make([]string, 0, n)
	field := ""

	for i := 0; i < len(s); i++ {
		if s[i] == sep {
			result = append(result, field)
			field = ""
		} else {
			field += string(s[i])
		}
	}

	result = append(result, field)
	return result
}

// NewAPIHandler creates a new API handler
func NewAPIHandler() *APIHandler {
	return &APIHandler{
		schemas:       make(map[string]*FormSchema),
		optionService: NewOptionService(5 * time.Minute),
		authService:   NewAuthService(),
		schemasLock:   sync.RWMutex{},
	}
}

// RegisterSchema registers a form schema
func (ah *APIHandler) RegisterSchema(schema *FormSchema) {
	ah.schemasLock.Lock()
	defer ah.schemasLock.Unlock()
	ah.schemas[schema.ID] = schema
}

// GetSchema gets a schema by ID
func (ah *APIHandler) GetSchema(id string) (*FormSchema, bool) {
	ah.schemasLock.RLock()
	defer ah.schemasLock.RUnlock()
	schema, ok := ah.schemas[id]
	return schema, ok
}

// SetDynamicFunctionService sets the dynamic function service
func (ah *APIHandler) SetDynamicFunctionService(service *DynamicFunctionService) {
	ah.dynamicFunctionService = service
}

// SetupRoutes sets up HTTP routes for the API
func (ah *APIHandler) SetupRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/forms", ah.handleForms)
	mux.HandleFunc("/api/forms/", ah.handleForm)
	mux.HandleFunc("/api/options/", ah.handleOptions)
	mux.HandleFunc("/api/validate/", ah.handleValidate)
	mux.HandleFunc("/api/submit/", ah.handleSubmit)
	mux.HandleFunc("/api/auth/", ah.handleAuth)

	mux.HandleFunc("/api/function/", ah.handleDynamicFunction)
	mux.HandleFunc("/api/field/dynamic/", ah.handleDynamicField)
	mux.HandleFunc("/api/options/dynamic/", ah.handleDynamicOptions)
	mux.HandleFunc("/api/options/function/", ah.handleFunctionOptions)

}

// handleForms handles requests to list all forms
func (ah *APIHandler) handleForms(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	ah.schemasLock.RLock()
	defer ah.schemasLock.RUnlock()

	// Build a list of form metadata
	formsList := []map[string]string{}
	for _, schema := range ah.schemas {
		formsList = append(formsList, map[string]string{
			"id":          schema.ID,
			"title":       schema.Title,
			"description": schema.Description,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(formsList)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
}

// handleForm handles requests for a specific form
func (ah *APIHandler) handleForm(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract form ID from path
	formID := getPathParam(r.URL.Path, "/api/forms/")
	if formID == "" {
		http.Error(w, "Form ID is required", http.StatusBadRequest)
		return
	}

	// Get schema
	schema, ok := ah.GetSchema(formID)
	if !ok {
		http.Error(w, "Form not found", http.StatusNotFound)
		return
	}

	// Parse context from query parameters
	context := map[string]interface{}{}
	for key, values := range r.URL.Query() {
		if len(values) > 0 {
			context[key] = values[0]
		}
	}

	// Render schema with context
	renderer := NewFormRenderer(schema)
	jsonString, err := renderer.RenderJSONWithContext(context)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error rendering form: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write([]byte(jsonString))
}

// New handler for function-based options
func (ah *APIHandler) handleFunctionOptions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract form ID and function name from path
	path := r.URL.Path
	parts := splitPath(path)
	if len(parts) < 4 {
		http.Error(w, "Form ID and function name are required", http.StatusBadRequest)
		return
	}

	formID := parts[3]
	functionName := parts[4]

	// Get schema
	_, ok := ah.GetSchema(formID)
	if !ok {
		http.Error(w, "Form not found", http.StatusNotFound)
		return
	}

	// Parse request body
	var request struct {
		Parameters map[string]interface{} `json:"parameters"`
		FormState  map[string]interface{} `json:"formState"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Check if dynamic function service is configured
	if ah.dynamicFunctionService == nil {
		http.Error(w, "Dynamic function service not configured", http.StatusInternalServerError)
		return
	}

	// Execute the function and convert to options
	options, err := ah.dynamicFunctionService.ExecuteFunctionForOptions(
		functionName,
		request.Parameters,
		request.FormState,
	)

	if err != nil {
		http.Error(w, fmt.Sprintf("Error executing function: %v", err), http.StatusInternalServerError)
		return
	}

	// Return the options
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(options)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
}

// handleOptions handles requests for field options
func (ah *APIHandler) handleOptions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract form ID and field ID from path
	path := r.URL.Path
	formID := getPathSegment(path, 3) // /api/options/{formID}/{fieldID}
	fieldID := getPathSegment(path, 4)

	if formID == "" || fieldID == "" {
		http.Error(w, "Form ID and Field ID are required", http.StatusBadRequest)
		return
	}

	// Get schema
	schema, ok := ah.GetSchema(formID)
	if !ok {
		http.Error(w, "Form not found", http.StatusNotFound)
		return
	}

	// Find field
	field := schema.FindFieldByID(fieldID)
	if field == nil {
		http.Error(w, "Field not found", http.StatusNotFound)
		return
	}

	// Check if field has options
	if field.Options == nil {
		http.Error(w, "Field does not support options", http.StatusBadRequest)
		return
	}

	// Parse context from query parameters
	context := map[string]interface{}{}
	for key, values := range r.URL.Query() {
		if len(values) > 0 {
			context[key] = values[0]
		}
	}

	// Get options based on type
	var options []*Option
	var err error

	switch field.Options.Type {
	case OptionsTypeStatic:
		options = field.Options.Static

	case OptionsTypeDynamic:
		if field.Options.DynamicSource == nil {
			http.Error(w, "Dynamic source not configured", http.StatusInternalServerError)
			return
		}

		// Check if it's a function type
		if field.Options.DynamicSource.Type == "function" {
			options, err = ah.getOptionsFromFunction(
				field.Options.DynamicSource.FunctionName,
				field.Options.DynamicSource.Parameters,
				context,
			)
		} else {
			// Default to API type
			options, err = ah.optionService.GetDynamicOptions(field.Options.DynamicSource, context)
		}

		if err != nil {
			http.Error(w, fmt.Sprintf("Error fetching dynamic options: %v", err), http.StatusInternalServerError)
			return
		}

	case OptionsTypeDependent:
		if field.Options.Dependency == nil {
			http.Error(w, "Dependency not configured", http.StatusInternalServerError)
			return
		}

		// Get dependent field value
		dependentField := field.Options.Dependency.Field
		dependentValue := ""
		if value, ok := context[dependentField]; ok {
			dependentValue = fmt.Sprintf("%v", value)
		}

		// Get options for this value
		if dependentOptions, ok := field.Options.Dependency.ValueMap[dependentValue]; ok {
			options = dependentOptions
		} else {
			// Return empty options if no mapping exists
			options = []*Option{}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(options)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
}

// handleValidate handles form validation requests
func (ah *APIHandler) handleValidate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract form ID from path
	formID := getPathParam(r.URL.Path, "/api/validate/")
	if formID == "" {
		http.Error(w, "Form ID is required", http.StatusBadRequest)
		return
	}

	// Get schema
	schema, ok := ah.GetSchema(formID)
	if !ok {
		http.Error(w, "Form not found", http.StatusNotFound)
		return
	}

	// Parse request body
	var formData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&formData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate form
	validator := NewValidator(schema)
	result := validator.ValidateForm(formData)

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(result)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
}

// handleSubmit handles form submission
func (ah *APIHandler) handleSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract form ID from path
	formID := getPathParam(r.URL.Path, "/api/submit/")
	if formID == "" {
		http.Error(w, "Form ID is required", http.StatusBadRequest)
		return
	}

	// Get schema
	schema, ok := ah.GetSchema(formID)
	if !ok {
		http.Error(w, "Form not found", http.StatusNotFound)
		return
	}

	// Parse request body
	var formData map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&formData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate form first
	validator := NewValidator(schema)
	result := validator.ValidateForm(formData)

	if !result.Valid {
		// Return validation errors
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		err := json.NewEncoder(w).Encode(result)
		if err != nil {
			http.Error(w, "Bad request", http.StatusBadRequest)
			return
		}
		return
	}

	// Process form submission (in a real implementation, this would save to a database)
	response := map[string]interface{}{
		"success": true,
		"message": "Form submitted successfully",
		"formId":  formID,
		"data":    formData,
	}

	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
}

// handleAuth handles authentication requests
func (ah *APIHandler) handleAuth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract auth type from path
	authType := getPathParam(r.URL.Path, "/api/auth/")
	if authType == "" {
		http.Error(w, "Auth type is required", http.StatusBadRequest)
		return
	}

	// Parse request body
	var authData map[string]string
	if err := json.NewDecoder(r.Body).Decode(&authData); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var token string
	var err error

	// Process based on auth type
	switch authType {
	case "oauth":
		token, err = ah.authService.AuthenticateOAuth(authData)
		break
	case "basic":
		token, err = ah.authService.AuthenticateBasic(authData["username"], authData["password"])
		break
	case "apikey":
		token, err = ah.authService.AuthenticateAPIKey(authData["apiKey"])
		break
	case "jwt":
		token, err = ah.authService.AuthenticateJWT(authData)
		break
	case "saml":
		token, err = ah.authService.AuthenticateSAML(authData)
		break
	default:
		http.Error(w, "Unsupported auth type", http.StatusBadRequest)
		return
	}

	if err != nil {
		http.Error(w, fmt.Sprintf("Authentication failed: %v", err), http.StatusUnauthorized)
		return
	}

	// Store token for service
	serviceID := authData["serviceId"]
	if serviceID != "" {
		switch authType {
		case "oauth", "basic", "apikey":
			ah.authService.SetToken(serviceID, token)
			break
		case "jwt":
			ah.authService.SetJWTToken(serviceID, token)
			break
		case "saml":
			ah.authService.SetSAMLToken(serviceID, token)
			break
		}
	}

	// Return token
	response := map[string]string{
		"token": token,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}

// handleDynamicFunction handles requests to execute a dynamic function
func (ah *APIHandler) handleDynamicFunction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check if dynamic function service is configured
	if ah.dynamicFunctionService == nil {
		http.Error(w, "Dynamic function service not configured", http.StatusInternalServerError)
		return
	}

	// Extract function name from path
	functionName := getPathParam(r.URL.Path, "/api/function/")
	if functionName == "" {
		http.Error(w, "Function name is required", http.StatusBadRequest)
		return
	}

	// Parse request body
	var request struct {
		Arguments map[string]interface{} `json:"arguments"`
		FormState map[string]interface{} `json:"formState"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Execute the function
	result, err := ah.dynamicFunctionService.ExecuteFunction(
		functionName,
		request.Arguments,
		request.FormState,
	)

	if err != nil {
		http.Error(w, fmt.Sprintf("Error executing function: %v", err), http.StatusInternalServerError)
		return
	}

	// Return the result
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(result)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
}

// handleDynamicField handles requests to get/update a dynamic field
func (ah *APIHandler) handleDynamicField(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check if dynamic function service is configured
	if ah.dynamicFunctionService == nil {
		http.Error(w, "Dynamic function service not configured", http.StatusInternalServerError)
		return
	}

	// Extract form ID and field ID from path
	pathParts := splitPath(r.URL.Path)
	if len(pathParts) < 4 {
		http.Error(w, "Form ID and Field ID are required", http.StatusBadRequest)
		return
	}

	formID := pathParts[3]
	fieldID := pathParts[4]

	// Parse request body
	var request struct {
		Config    *DynamicFieldConfig    `json:"config"`
		FormState map[string]interface{} `json:"formState"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get schema
	schema, ok := ah.GetSchema(formID)
	if !ok {
		http.Error(w, "Form not found", http.StatusNotFound)
		return
	}

	// Find field
	field := schema.FindFieldByID(fieldID)
	if field == nil {
		http.Error(w, "Field not found", http.StatusNotFound)
		return
	}

	// Execute the dynamic field function
	result, err := request.Config.ExecuteWithFormState(ah.dynamicFunctionService, request.FormState)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error executing dynamic field function: %v", err), http.StatusInternalServerError)
		return
	}

	// Return the result
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(result)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
}

// handleDynamicOptions handles requests for dynamic field options with search/filter support
func (ah *APIHandler) handleDynamicOptions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check if dynamic function service is configured
	if ah.dynamicFunctionService == nil {
		http.Error(w, "Dynamic function service not configured", http.StatusInternalServerError)
		return
	}

	// Extract form ID and field ID from path
	pathParts := splitPath(r.URL.Path)
	if len(pathParts) < 4 {
		http.Error(w, "Form ID and Field ID are required", http.StatusBadRequest)
		return
	}

	formID := pathParts[3]
	fieldID := pathParts[4]

	// Parse request body
	var request struct {
		Config        *DynamicFieldConfig    `json:"config"`
		FormState     map[string]interface{} `json:"formState"`
		Search        string                 `json:"search,omitempty"`
		Filters       map[string]interface{} `json:"filters,omitempty"`
		Sort          string                 `json:"sort,omitempty"`
		SortDirection string                 `json:"sortDirection,omitempty"`
		Limit         int                    `json:"limit,omitempty"`
		Offset        int                    `json:"offset,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get schema
	schema, ok := ah.GetSchema(formID)
	if !ok {
		http.Error(w, "Form not found", http.StatusNotFound)
		return
	}

	// Find field
	field := schema.FindFieldByID(fieldID)
	if field == nil {
		http.Error(w, "Field not found", http.StatusNotFound)
		return
	}

	// Execute the dynamic field function
	result, err := request.Config.ExecuteWithFormState(ah.dynamicFunctionService, request.FormState)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error executing dynamic field function: %v", err), http.StatusInternalServerError)
		return
	}

	// Convert result to options
	options, err := request.Config.CreateOptionsFromResult(result)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error converting result to options: %v", err), http.StatusInternalServerError)
		return
	}

	// Apply search, filter and sorting
	searchParams := map[string]interface{}{
		"search":  request.Search,
		"sort":    request.Sort,
		"sortDir": request.SortDirection,
		"limit":   float64(request.Limit),
		"offset":  float64(request.Offset),
		"filters": request.Filters,
	}

	filteredOptions, err := ah.dynamicFunctionService.SearchAndSort(options, searchParams)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error filtering options: %v", err), http.StatusInternalServerError)
		return
	}

	// Build response with pagination info
	response := map[string]interface{}{
		"options": filteredOptions,
		"pagination": map[string]interface{}{
			"total":  len(options),
			"offset": request.Offset,
			"limit":  request.Limit,
		},
	}

	// Return the result
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}
}

// Update the getOptionsFromFunction method in APIHandler
func (ah *APIHandler) getOptionsFromFunction(functionName string, params map[string]interface{}, context map[string]interface{}) ([]*Option, error) {
	// Check if dynamic function service is configured
	if ah.dynamicFunctionService == nil {
		return nil, fmt.Errorf("dynamic function service not configured")
	}

	// Execute the function and convert to options
	return ah.dynamicFunctionService.ExecuteFunctionForOptions(functionName, params, context)
}
