# SmartForm API Reference

This document provides a detailed reference for the SmartForm API, including all the available builder methods, field types, validation rules, and more.

## Table of Contents

1. [FormBuilder API](#formbuilder-api)
2. [FieldBuilder API](#fieldbuilder-api)
3. [Condition API](#condition-api)
4. [Validation API](#validation-api)
5. [Options API](#options-api)
6. [Dynamic Function API](#dynamic-function-api)
7. [API Handler](#api-handler)
8. [HTTP Endpoints](#http-endpoints)
9. [Frontend API](#frontend-api)

## FormBuilder API

The `FormBuilder` provides a fluent API for creating form schemas.

### Methods

```go
// Create a new form builder
NewForm(id string, title string) *FormBuilder

// Set form description
Description(description string) *FormBuilder

// Set a custom property
Property(key string, value interface{}) *FormBuilder

// Add a field to the form
AddField(field *Field) *FormBuilder

// Add multiple fields to the form
AddFields(fields ...*Field) *FormBuilder

// Build and return the form props
Build() *FormSchema
```

### Field Creation Methods

The `FormBuilder` provides methods for creating various field types:

```go
// Create a text field
TextField(id string, label string) *FieldBuilder

// Create a textarea field
TextareaField(id string, label string) *FieldBuilder

// Create a number field
NumberField(id string, label string) *FieldBuilder

// Create an email field
EmailField(id string, label string) *FieldBuilder

// Create a password field
PasswordField(id string, label string) *FieldBuilder

// Create a select field
SelectField(id string, label string) *FieldBuilder

// Create a multi-select field
MultiSelectField(id string, label string) *FieldBuilder

// Create a checkbox field
CheckboxField(id string, label string) *FieldBuilder

// Create a radio button field
RadioField(id string, label string) *FieldBuilder

// Create a date field
DateField(id string, label string) *FieldBuilder

// Create a time field
TimeField(id string, label string) *FieldBuilder

// Create a datetime field
DateTimeField(id string, label string) *FieldBuilder

// Create a file upload field
FileField(id string, label string) *FieldBuilder

// Create an image upload field
ImageField(id string, label string) *FieldBuilder

// Create a switch field
SwitchField(id string, label string) *FieldBuilder

// Create a slider field
SliderField(id string, label string) *FieldBuilder

// Create a rating field
RatingField(id string, label string) *FieldBuilder

// Create a color picker field
ColorField(id string, label string) *FieldBuilder

// Create a hidden field
HiddenField(id string, value interface{}) *FieldBuilder

// Create a rich text editor field
RichTextField(id string, label string) *FieldBuilder

// Create a section separator
SectionField(id string, label string) *FieldBuilder

// Create a group field (for nested fields)
GroupField(id string, label string) *GroupFieldBuilder

// Create an array field (for repeating items)
ArrayField(id string, label string) *ArrayFieldBuilder

// Create a oneOf field (select exactly one option)
OneOfField(id string, label string) *OneOfFieldBuilder

// Create an anyOf field (select one or more options)
AnyOfField(id string, label string) *AnyOfFieldBuilder

// Create an API integration field
APIField(id string, label string) *APIFieldBuilder

// Create an authentication field
AuthField(id string, label string) *AuthFieldBuilder

// Create a workflow branch field
BranchField(id string, label string) *BranchFieldBuilder

// Create a custom component field
CustomField(id string, label string) *CustomFieldBuilder
```

## FieldBuilder API

The `FieldBuilder` provides a fluent API for configuring field properties.

### Common Methods

```go
// Create a new field builder
NewFieldBuilder(id string, fieldType FieldType, label string) *FieldBuilder

// Mark the field as required
Required(required bool) *FieldBuilder

// Set field placeholder text
Placeholder(placeholder string) *FieldBuilder

// Set field help text
HelpText(helpText string) *FieldBuilder

// Set field default value
DefaultValue(value interface{}) *FieldBuilder

// Set field order
Order(order int) *FieldBuilder

// Set a custom property
Property(key string, value interface{}) *FieldBuilder

// Build and return the field
Build() *Field
```

### Visibility and Enablement Methods

```go
// Set visibility condition
VisibleWhen(condition *Condition) *FieldBuilder

// Make field visible when another field equals a value
VisibleWhenEquals(fieldID string, value interface{}) *FieldBuilder

// Make field visible when another field doesn't equal a value
VisibleWhenNotEquals(fieldID string, value interface{}) *FieldBuilder

// Make field visible when another field is greater than a value
VisibleWhenGreaterThan(fieldID string, value interface{}) *FieldBuilder

// Make field visible when another field is less than a value
VisibleWhenLessThan(fieldID string, value interface{}) *FieldBuilder

// Make field visible when another field exists and is not empty
VisibleWhenExists(fieldID string) *FieldBuilder

// Make field visible when all specified conditions match
VisibleWhenAllMatch(conditions ...*Condition) *FieldBuilder

// Make field visible when any of the specified conditions match
VisibleWhenAnyMatch(conditions ...*Condition) *FieldBuilder

// Make field visible based on a custom expression
VisibleWithExpression(expression string) *FieldBuilder

// Set enablement condition
EnabledWhen(condition *Condition) *FieldBuilder

// Make field enabled when another field equals a value
EnabledWhenEquals(fieldID string, value interface{}) *FieldBuilder

// Make field enabled when another field doesn't equal a value
EnabledWhenNotEquals(fieldID string, value interface{}) *FieldBuilder

// Make field enabled when another field exists and is not empty
EnabledWhenExists(fieldID string) *FieldBuilder
```

### Validation Methods

```go
// Add a validation rule
AddValidation(rule *ValidationRule) *FieldBuilder

// Add a required validation rule
ValidateRequired(message string) *FieldBuilder

// Add a minimum length validation rule
ValidateMinLength(min float64, message string) *FieldBuilder

// Add a maximum length validation rule
ValidateMaxLength(max float64, message string) *FieldBuilder

// Add a pattern validation rule
ValidatePattern(pattern string, message string) *FieldBuilder

// Add a minimum value validation rule
ValidateMin(min float64, message string) *FieldBuilder

// Add a maximum value validation rule
ValidateMax(max float64, message string) *FieldBuilder

// Add an email validation rule
ValidateEmail(message string) *FieldBuilder

// Add a URL validation rule
ValidateURL(message string) *FieldBuilder

// Add a file type validation rule
ValidateFileType(allowedTypes []string, message string) *FieldBuilder

// Add a file size validation rule
ValidateFileSize(maxSize float64, message string) *FieldBuilder

// Add an image dimensions validation rule
ValidateImageDimensions(dimensions map[string]interface{}, message string) *FieldBuilder

// Add a field dependency validation rule
ValidateDependency(dependency map[string]interface{}, message string) *FieldBuilder

// Add a uniqueness validation rule
ValidateUnique(message string) *FieldBuilder

// Add a custom validation rule
ValidateCustom(params map[string]interface{}, message string) *FieldBuilder

// Add a dynamic validation rule
DynamicValidation(functionName string, message string) *DynamicFunctionBuilder
```

### Options Methods

```go
// Add static options to the field
WithStaticOptions(options []*Option) *FieldBuilder

// Add dynamic options to the field
WithDynamicOptions(source *DynamicSource) *FieldBuilder

// Add dependent options to the field
WithDependentOptions(dependentField string, valueMap map[string][]*Option) *FieldBuilder

// Add a single option to the field
AddOption(value interface{}, label string) *FieldBuilder

// Add multiple options to the field
AddOptions(options ...*Option) *FieldBuilder

// Add dynamic options from an API endpoint
WithOptionsFromAPI(endpoint, method, valuePath, labelPath string) *FieldBuilder

// Add refresh triggers to dynamic options
WithOptionsRefreshingOn(fieldIDs ...string) *FieldBuilder

// Add dynamic options from a config
WithDynamicOptionsConfig(config *OptionsConfig) *FieldBuilder
```

### Dynamic Function Methods

```go
// Add a dynamic function to the field
WithDynamicFunction(functionName string) *DynamicFunctionBuilder

// Add a dynamic value calculation to the field
DynamicValue(functionName string) *DynamicFunctionBuilder

// Add autocomplete functionality to text fields
AutocompleteField(functionName string) *DynamicFunctionBuilder

// Add live search capability to a field
LiveSearch(functionName string) *DynamicFunctionBuilder

// Set a dynamic data source for the field
DataSource(functionName string) *DynamicFunctionBuilder

// Add a dynamic formatter to the field
Formatter(functionName string) *DynamicFunctionBuilder

// Add a dynamic parser to the field
Parser(functionName string) *DynamicFunctionBuilder
```

## Specialized Field Builders

### GroupFieldBuilder

The `GroupFieldBuilder` provides methods for creating a group of related fields.

```go
// Create a new group field builder
NewGroupFieldBuilder(id string, label string) *GroupFieldBuilder

// Add a field to the group
AddField(field *Field) *GroupFieldBuilder

// Build and return the group field
Build() *Field
```

### ArrayFieldBuilder

The `ArrayFieldBuilder` provides methods for creating an array of repeating items.

```go
// Create a new array field builder
NewArrayFieldBuilder(id string, label string) *ArrayFieldBuilder

// Set the template for array items
ItemTemplate(field *Field) *ArrayFieldBuilder

// Add an object field template to the array
ObjectTemplate(id string, label string) *GroupFieldBuilder

// Add an object template with existing fields
ObjectTemplateWithFields(id string, label string, fields []*Field) *GroupFieldBuilder

// Set the minimum number of items
MinItems(min int) *ArrayFieldBuilder

// Set the maximum number of items
MaxItems(max int) *ArrayFieldBuilder

// Build and return the array field
Build() *Field
```

### OneOfFieldBuilder

The `OneOfFieldBuilder` provides methods for creating a field that allows selection of exactly one option.

```go
// Create a new oneOf field builder
NewOneOfFieldBuilder(id string, label string) *OneOfFieldBuilder

// Add an option to the oneOf field
AddOption(field *Field) *OneOfFieldBuilder

// Add a group option to the oneOf field
GroupOption(id string, label string) *GroupFieldBuilder

// Build and return the oneOf field
Build() *Field
```

### AnyOfFieldBuilder

The `AnyOfFieldBuilder` provides methods for creating a field that allows selection of multiple options.

```go
// Create a new anyOf field builder
NewAnyOfFieldBuilder(id string, label string) *AnyOfFieldBuilder

// Add an option to the anyOf field
AddOption(field *Field) *AnyOfFieldBuilder

// Add a group option to the anyOf field
GroupOption(id string, label string) *GroupFieldBuilder

// Build and return the anyOf field
Build() *Field
```

### APIFieldBuilder

The `APIFieldBuilder` provides methods for creating an API integration field.

```go
// Create a new API field builder
NewAPIFieldBuilder(id string, label string) *APIFieldBuilder

// Set the API endpoint
Endpoint(endpoint string) *APIFieldBuilder

// Set the HTTP method
Method(method string) *APIFieldBuilder

// Add an HTTP header
Header(key string, value string) *APIFieldBuilder

// Add a request parameter
Parameter(key string, value interface{}) *APIFieldBuilder

// Set a mapping from API response to form fields
ResponseMapping(mapping map[string]string) *APIFieldBuilder

// Add dynamic request handling
WithDynamicRequest(functionName string) *DynamicFunctionBuilder

// Add dynamic response handling
WithDynamicResponse(functionName string) *DynamicFunctionBuilder

// Build and return the API field
Build() *Field
```

### AuthFieldBuilder

The `AuthFieldBuilder` provides methods for creating an authentication field.

```go
// Create a new authentication field builder
NewAuthFieldBuilder(id string, label string) *AuthFieldBuilder

// Set the authentication type
AuthType(authType string) *AuthFieldBuilder

// Set the service ID for authentication
ServiceID(serviceID string) *AuthFieldBuilder

// Build and return the authentication field
Build() *Field
```

### BranchFieldBuilder

The `BranchFieldBuilder` provides methods for creating a workflow branch field.

```go
// Create a new branch field builder
NewBranchFieldBuilder(id string, label string) *BranchFieldBuilder

// Set the branch condition
Condition(condition *Condition) *BranchFieldBuilder

// Set the form to show when condition is true
TrueBranch(formID string) *BranchFieldBuilder

// Set the form to show when condition is false
FalseBranch(formID string) *BranchFieldBuilder

// Build and return the branch field
Build() *Field
```

### CustomFieldBuilder

The `CustomFieldBuilder` provides methods for creating a custom component field.

```go
// Create a new custom field builder
NewCustomFieldBuilder(id string, label string) *CustomFieldBuilder

// Set the custom component name
ComponentName(name string) *CustomFieldBuilder

// Set the custom component props
ComponentProps(props map[string]interface{}) *CustomFieldBuilder

// Build and return the custom field
Build() *Field
```

## Condition API

The `ConditionBuilder` provides a fluent API for creating conditions.

### Methods

```go
// Create a simple condition
When(field string) *ConditionBuilder

// Check if value equals
Equals(value interface{}) *ConditionBuilder

// Check if value doesn't equal
NotEquals(value interface{}) *ConditionBuilder

// Check if value is greater than
GreaterThan(value interface{}) *ConditionBuilder

// Check if value is greater than or equal
GreaterThanOrEquals(value interface{}) *ConditionBuilder

// Check if value is less than
LessThan(value interface{}) *ConditionBuilder

// Check if value is less than or equal
LessThanOrEquals(value interface{}) *ConditionBuilder

// Check if value contains substring
Contains(value interface{}) *ConditionBuilder

// Check if value starts with substring
StartsWith(value interface{}) *ConditionBuilder

// Check if value ends with substring
EndsWith(value interface{}) *ConditionBuilder

// Build and return the condition
Build() *Condition
```

### Factory Methods

```go
// Create a condition that checks if field exists and is not empty
Exists(field string) *ConditionBuilder

// Create a condition that requires all sub-conditions to be true
And(conditions ...*Condition) *ConditionBuilder

// Create a condition that requires any sub-condition to be true
Or(conditions ...*Condition) *ConditionBuilder

// Create a condition that negates another condition
Not(condition *Condition) *ConditionBuilder

// Create a condition based on a custom expression
WithExpression(expression string) *ConditionBuilder
```

## Validation API

The `ValidationBuilder` provides a fluent API for creating validation rules.

### Methods

```go
// Create a new validation builder
NewValidationBuilder() *ValidationBuilder

// Create a required validation rule
Required(message string) *ValidationRule

// Create a minimum length validation rule
MinLength(min float64, message string) *ValidationRule

// Create a maximum length validation rule
MaxLength(max float64, message string) *ValidationRule

// Create a pattern validation rule
Pattern(pattern string, message string) *ValidationRule

// Create a minimum value validation rule
Min(min float64, message string) *ValidationRule

// Create a maximum value validation rule
Max(max float64, message string) *ValidationRule

// Create an email validation rule
Email(message string) *ValidationRule

// Create a URL validation rule
URL(message string) *ValidationRule

// Create a file type validation rule
FileType(allowedTypes []string, message string) *ValidationRule

// Create a file size validation rule
FileSize(maxSize float64, message string) *ValidationRule

// Create an image dimensions validation rule
ImageDimensions(dimensions map[string]interface{}, message string) *ValidationRule

// Create a field dependency validation rule
Dependency(field string, operator string, value interface{}, message string) *ValidationRule

// Create a uniqueness validation rule
Unique(message string) *ValidationRule

// Create a custom validation rule
Custom(functionName string, params map[string]interface{}, message string) *ValidationRule
```

## Options API

The `OptionsBuilder` provides a fluent API for creating options configurations.

### Methods

```go
// Create a new options builder
NewOptionsBuilder() *OptionsBuilder

// Create a static options configuration
Static() *StaticOptionsBuilder

// Create a dynamic options configuration
Dynamic() *DynamicOptionsBuilder

// Create a dependent options configuration
Dependent(field string) *DependentOptionsBuilder

// Build and return the options configuration
Build() *OptionsConfig
```

### StaticOptionsBuilder

```go
// Add an option to the static options list
AddOption(value interface{}, label string) *StaticOptionsBuilder

// Add an option with an icon to the static options list
AddOptionWithIcon(value interface{}, label string, icon string) *StaticOptionsBuilder

// Add multiple options to the static options list
AddOptions(options ...*Option) *StaticOptionsBuilder
```

### DynamicOptionsBuilder

```go
// Configure options to be fetched from an API endpoint
FromAPI(endpoint string, method string) *DynamicOptionsBuilder

// Configure options with value and label paths
FromAPIWithPath(endpoint string, method string, valuePath string, labelPath string) *DynamicOptionsBuilder

// Add an HTTP header to the API request
WithHeader(key string, value string) *DynamicOptionsBuilder

// Add a parameter to the API request
WithParameter(key string, value interface{}) *DynamicOptionsBuilder

// Set the JSON path to the value in the response
WithValuePath(path string) *DynamicOptionsBuilder

// Set the JSON path to the label in the response
WithLabelPath(path string) *DynamicOptionsBuilder

// Set fields that trigger options refresh
RefreshOn(fieldIDs ...string) *DynamicOptionsBuilder

// Configure options to be generated by a custom function
FromFunction(functionName string) *DynamicOptionsBuilder

// Configure options to come from a dynamic function
WithFunctionOptions(functionName string) *DynamicOptionsFunctionBuilder
```

### DependentOptionsBuilder

```go
// Add options for a specific value of the dependent field
WhenEquals(value string) *DependentValueOptionsBuilder

// Set a custom expression for option filtering
WithExpression(expression string) *DependentOptionsBuilder
```

### Helper Functions

```go
// Create a new option
NewOption(value interface{}, label string) *Option

// Create a new option with an icon
NewOptionWithIcon(value interface{}, label string, icon string) *Option
```

## Dynamic Function API

The `DynamicFunctionBuilder` provides a fluent API for configuring dynamic functions.

### Methods

```go
// Add an argument to the dynamic function
WithArgument(name string, value interface{}) *DynamicFunctionBuilder

// Add multiple arguments to the dynamic function
WithArguments(args map[string]interface{}) *DynamicFunctionBuilder

// Add a field reference as an argument
WithFieldReference(argName string, fieldId string) *DynamicFunctionBuilder

// Add a data transformer to the dynamic function
WithTransformer(transformerName string) *DynamicFunctionBuilder

// Add a parameter to the transformer
WithTransformerParam(name string, value interface{}) *DynamicFunctionBuilder

// End the dynamic function configuration and return to the field builder
End() *FieldBuilder
```

### DynamicFunctionService

```go
// Create a new dynamic function service
NewDynamicFunctionService() *DynamicFunctionService

// Register a dynamic function
RegisterFunction(name string, fn DynamicFunction) 

// Register a data transformer
RegisterTransformer(name string, transformer DataTransformer) 

// Execute a dynamic function with the given arguments
ExecuteFunction(functionName string, args map[string]interface{}, formState map[string]interface{}) (interface{}, error)

// Apply a transformer to the given data
TransformData(transformerName string, data interface{}, params map[string]interface{}) (interface{}, error)

// Apply filtering to a list of options
FilterOptions(options []*Option, filterCriteria map[string]interface{}) []*Option

// Search and sort options based on criteria
SearchAndSort(options []*Option, searchParams map[string]interface{}) ([]*Option, error)
```

## API Handler

The `APIHandler` provides HTTP endpoints for form management.

### Methods

```go
// Create a new API handler
NewAPIHandler() *APIHandler

// Register a form props
RegisterSchema(props *FormSchema)

// Get a props by ID
GetSchema(id string) (*FormSchema, bool)

// Set the dynamic function service
SetDynamicFunctionService(service *DynamicFunctionService)

// Set up HTTP routes
SetupRoutes(mux *http.ServeMux)
```

### Handler Methods

```go
// Handle requests to list all forms
handleForms(w http.ResponseWriter, r *http.Request)

// Handle requests for a specific form
handleForm(w http.ResponseWriter, r *http.Request)

// Handle requests for field options
handleOptions(w http.ResponseWriter, r *http.Request)

// Handle form validation requests
handleValidate(w http.ResponseWriter, r *http.Request)

// Handle form submission
handleSubmit(w http.ResponseWriter, r *http.Request)

// Handle authentication requests
handleAuth(w http.ResponseWriter, r *http.Request)

// Handle requests to execute a dynamic function
handleDynamicFunction(w http.ResponseWriter, r *http.Request)

// Handle requests to get/update a dynamic field
handleDynamicField(w http.ResponseWriter, r *http.Request)

// Handle requests for dynamic field options with search/filter support
handleDynamicOptions(w http.ResponseWriter, r *http.Request)
```

## HTTP Endpoints

The `APIHandler` sets up the following HTTP endpoints:

### Form Management

- `GET /api/forms`: List all available forms
- `GET /api/forms/{formId}`: Get a specific form props

### Field Options

- `GET /api/options/{formId}/{fieldId}`: Get options for a field
- `POST /api/options/dynamic/{formId}/{fieldId}`: Get options with search/filter

### Form Validation and Submission

- `POST /api/validate/{formId}`: Validate form data
- `POST /api/submit/{formId}`: Submit form data

### Authentication

- `POST /api/auth/{authType}`: Authenticate for form submission

### Dynamic Functions

- `POST /api/function/{functionName}`: Execute a dynamic function
- `POST /api/field/dynamic/{formId}/{fieldId}`: Get/update a dynamic field

## Frontend API

The SmartForm React library provides components and hooks for rendering and managing forms.

### Components

```tsx
// Render a form
<SmartForm
  props={props}           // Form props
  state={formState}         // Form state
  errors={errors}           // Validation errors
  onChange={handleChange}   // Change handler
  onSubmit={handleSubmit}   // Submit handler
  config={config}           // Additional configuration
/>

// Render a single field
<SmartField
  field={field}             // Field props
  value={value}             // Field value
  error={error}             // Field error
  onChange={handleChange}   // Change handler
  config={config}           // Additional configuration
/>
```

### Hooks

```tsx
// Hook for managing form state, validation, and submission
const { 
  formState,        // Current form state
  errors,           // Validation errors
  touched,          // Fields that have been touched
  isValid,          // Whether the form is valid
  isDirty,          // Whether the form has been changed
  isSubmitting,     // Whether the form is submitting
  validateForm,     // Function to validate the form
  validateField,    // Function to validate a field
  setFieldValue,    // Function to set a field value
  setFieldTouched,  // Function to mark a field as touched
  resetForm,        // Function to reset the form
  handleChange,     // Change handler
  handleBlur,       // Blur handler
  handleSubmit      // Submit handler
} = useSmartForm(options);

// Hook for fetching a form props
const {
  props,          // Form props
  isLoading,       // Whether the props is loading
  error            // Error if fetching failed
} = useFormSchema(formId);

// Hook for managing dynamic options
const {
  options,         // Current options
  isLoading,       // Whether options are loading
  error,           // Error if fetching failed
  refresh          // Function to refresh options
} = useDynamicOptions(formId, fieldId, deps);
```

### Utility Functions

```tsx
// Register a custom field renderer
registerFieldType(type: string, component: React.ComponentType<FieldProps>);

// Register a custom validation rule
registerValidationType(type: string, validator: ValidationFunction);

// Format a form value based on field type and properties
formatValue(field: Field, value: any): any;

// Parse a form value based on field type and properties
parseValue(field: Field, value: any): any;
```