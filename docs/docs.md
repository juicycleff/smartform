# SmartForm Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Components](#backend-components)
    - [Form Schema](#form-schema)
    - [Fields](#fields)
    - [Conditions](#conditions)
    - [Validation Rules](#validation-rules)
    - [Options Configuration](#options-configuration)
    - [API Handler](#api-handler)
    - [Dynamic Functions](#dynamic-functions)
3. [Frontend Integration](#frontend-integration)
4. [Advanced Usage](#advanced-usage)
    - [Complex Form Building](#complex-form-building)
    - [Custom Field Types](#custom-field-types)
    - [Dynamic Function Integration](#dynamic-function-integration)
    - [Advanced Validation](#advanced-validation)
    - [Conditional Logic](#conditional-logic)
    - [API Integration](#api-integration)
    - [Authentication Strategies](#authentication-strategies)
5. [Performance Optimization](#performance-optimization)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

## Architecture Overview

SmartForm follows a clean, layered architecture that separates form definition, validation, rendering, and API handling. The backend is written in Go and provides a robust API for defining and managing forms, while the frontend is built with React and TypeScript to render the forms and handle user interactions.

```
┌───────────────────┐     ┌───────────────────────┐     ┌────────────────────┐
│  Form Definition  │     │   Form Rendering &    │     │   API Endpoints    │
│  (Go Builders)    │────▶│   Validation Engine   │────▶│   (HTTP Handlers)  │
└───────────────────┘     └───────────────────────┘     └────────────────────┘
                                                                  │
                                                                  ▼
┌───────────────────┐     ┌───────────────────────┐     ┌────────────────────┐
│  React Components │     │  SmartForm React SDK  │     │   API Integration  │
│  (UI Rendering)   │◀────│  (Frontend Library)   │◀────│   (Fetch/Axios)    │
└───────────────────┘     └───────────────────────┘     └────────────────────┘
```

## Backend Components

### Form Schema

The `FormSchema` is the root object that defines a form. It contains metadata about the form and a collection of fields.

```go
// Create a new form schema
form := smartform.NewForm("contact", "Contact Us Form")
    .Description("Send us your feedback or questions")
    .Property("submitLabel", "Send Message")
    .Build()
```

Key properties:
- `ID`: Unique identifier for the form
- `Title`: Display title for the form
- `Description`: Optional description text
- `Fields`: Array of field definitions
- `Properties`: Custom properties for extending functionality

### Fields

Fields are the building blocks of forms. Each field has a type, label, and various properties that control its behavior.

```go
// Add a text field to a form
form.TextField("name", "Your Name")
    .Required(true)
    .Placeholder("Enter your full name")
    .HelpText("Please provide your first and last name")
    .ValidateMinLength(2, "Name must be at least 2 characters")
    .Build()
```

Common field properties:
- `ID`: Unique identifier for the field
- `Type`: The field type (text, select, checkbox, etc.)
- `Label`: Display label for the field
- `Required`: Whether the field is required
- `Placeholder`: Placeholder text
- `HelpText`: Help text to display with the field
- `DefaultValue`: Initial value for the field
- `ValidationRules`: Array of validation rules
- `Visible`: Condition controlling field visibility
- `Enabled`: Condition controlling field enablement
- `Order`: Position in the form (lower values appear first)
- `Properties`: Custom properties for extending functionality

### Conditions

Conditions control the visibility and enablement of fields based on other field values or custom expressions.

```go
// Simple condition - show field when another field equals a value
field.VisibleWhenEquals("accountType", "business")

// Complex condition - show field when multiple conditions are met
field.VisibleWhenAllMatch(
    smartform.When("age").GreaterThanOrEquals(18).Build(),
    smartform.Exists("email").Build()
)

// Custom expression condition
field.VisibleWithExpression("data.age >= 18 && data.country == 'US'")
```

Condition types:
- `simple`: Compare a field value with a fixed value
- `exists`: Check if a field exists and is not empty
- `and`: Logical AND of multiple conditions
- `or`: Logical OR of multiple conditions
- `not`: Logical NOT of a condition
- `expression`: Custom expression using a simple expression language

Operators for simple conditions:
- `eq`: Equal to
- `neq`: Not equal to
- `gt`: Greater than
- `gte`: Greater than or equal to
- `lt`: Less than
- `lte`: Less than or equal to
- `contains`: String contains
- `startsWith`: String starts with
- `endsWith`: String ends with

### Validation Rules

Validation rules ensure that field values meet specific criteria. SmartForm provides a wide range of built-in validation types and supports custom validation functions.

```go
// Add validation rules to a field
field.ValidateRequired("This field is required")
    .ValidateMinLength(5, "Must be at least 5 characters")
    .ValidatePattern("^[a-zA-Z0-9]+$", "Only alphanumeric characters allowed")
```

Built-in validation types:
- `required`: Field must not be empty
- `minLength`: String must have a minimum length
- `maxLength`: String must have a maximum length
- `pattern`: String must match a regular expression
- `min`: Number must be greater than or equal to a value
- `max`: Number must be less than or equal to a value
- `email`: String must be a valid email address
- `url`: String must be a valid URL
- `fileType`: File must be of a specific type
- `fileSize`: File must not exceed a specific size
- `imageDimensions`: Image must have specific dimensions
- `dependency`: Field value depends on another field
- `unique`: Field value must be unique
- `custom`: Custom validation function

### Options Configuration

Options define the available choices for selection fields (select, multiselect, radio, etc.). SmartForm supports static, dynamic, and dependent options.

```go
// Static options
field.AddOption("1", "Option 1")
    .AddOption("2", "Option 2")
    .AddOption("3", "Option 3")

// Dynamic options from API
field.WithOptionsFromAPI(
    "/api/options",         // Endpoint
    "GET",                  // Method
    "id",                   // Value path in response
    "name"                  // Label path in response
)

// Dependent options
field.WithDependentOptions("parentField", map[string][]*smartform.Option{
    "1": {
        smartform.NewOption("a", "Option A"),
        smartform.NewOption("b", "Option B"),
    },
    "2": {
        smartform.NewOption("c", "Option C"),
        smartform.NewOption("d", "Option D"),
    },
})
```

Options configuration types:
- `static`: Fixed list of options defined in the form
- `dynamic`: Options loaded from an API endpoint or function
- `dependent`: Options depend on the value of another field

### API Handler

The `APIHandler` provides HTTP endpoints for rendering forms, fetching options, validating data, and submitting forms.

```go
// Create an API handler
handler := smartform.NewAPIHandler()

// Register a form schema
handler.RegisterSchema(myForm)

// Set up routes on an HTTP server
mux := http.NewServeMux()
handler.SetupRoutes(mux)
```

API endpoints:
- `GET /api/forms`: List all available forms
- `GET /api/forms/{formId}`: Get a specific form schema
- `GET /api/options/{formId}/{fieldId}`: Get options for a field
- `POST /api/validate/{formId}`: Validate form data
- `POST /api/submit/{formId}`: Submit form data
- `POST /api/auth/{authType}`: Authenticate for form submission
- `POST /api/function/{functionName}`: Execute a dynamic function
- `POST /api/field/dynamic/{formId}/{fieldId}`: Get/update a dynamic field
- `POST /api/options/dynamic/{formId}/{fieldId}`: Get options with search/filter

### Dynamic Functions

Dynamic functions allow for custom logic in forms, enabling features like calculated fields, dynamic validation, and complex option filtering.

```go
// Create a dynamic function service
funcService := smartform.NewDynamicFunctionService()

// Register a function to calculate a field value
funcService.RegisterFunction("calculateTotal", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
    quantity, _ := args["quantity"].(float64)
    price, _ := args["price"].(float64)
    return quantity * price, nil
})

// Add a dynamic calculated field to a form
form.NumberField("total", "Total")
    .DynamicValue("calculateTotal")
    .WithArgument("quantity", "${quantity}")
    .WithArgument("price", "${price}")
    .End()
    .Build()

// Set the dynamic function service on the API handler
handler.SetDynamicFunctionService(funcService)
```

Uses for dynamic functions:
- Calculated fields
- Custom validation
- Dynamic option filtering
- Field formatting and parsing
- API request/response handling
- Search and autocomplete functionality

## Frontend Integration

SmartForm provides a React library for rendering forms defined with the Go backend. The library handles field rendering, validation, conditional logic, and form submission.

```tsx
import { SmartForm, useSmartForm } from '@xraph/smartform-react';

function MyFormComponent() {
  const { formState, errors, handleChange, handleSubmit } = useSmartForm();
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    // Fetch the form schema from the server
    fetch('/api/forms/myForm')
      .then(res => res.json())
      .then(data => setSchema(data));
  }, []);

  if (!schema) return <div>Loading...</div>;

  return (
    <SmartForm
      schema={schema}
      state={formState}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit(data => {
        // Submit form data to the server
        fetch('/api/submit/myForm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      })}
    />
  );
}
```

## Advanced Usage

### Complex Form Building

SmartForm supports complex form structures with nested fields, arrays, and conditional branches.

#### Nested Fields (Groups)

```go
// Create a form with nested fields
form.GroupField("address", "Address Information")
    .TextField("street", "Street Address")
        .Required(true)
        .Build()
    .TextField("city", "City")
        .Required(true)
        .Build()
    .TextField("state", "State/Province")
        .Required(true)
        .Build()
    .TextField("postalCode", "Postal Code")
        .Required(true)
        .Build()
    .Build()
```

#### Array Fields

```go
// Create a form with an array of items
form.ArrayField("contacts", "Additional Contacts")
    .ObjectTemplate("contact", "Contact")
        .TextField("name", "Contact Name")
            .Required(true)
            .Build()
        .EmailField("email", "Email Address")
            .Required(true)
            .ValidateEmail("Please enter a valid email address")
            .Build()
        .TextField("phone", "Phone Number")
            .Build()
        .Build()
    .MinItems(1)
    .MaxItems(5)
    .Build()
```

#### OneOf and AnyOf Fields

```go
// Create a form with a oneOf field (user must select exactly one option)
form.OneOfField("paymentMethod", "Payment Method")
    .GroupOption("creditCard", "Credit Card")
        .TextField("cardNumber", "Card Number")
            .Required(true)
            .Build()
        .TextField("cardHolder", "Cardholder Name")
            .Required(true)
            .Build()
        .TextField("expiryDate", "Expiry Date")
            .Required(true)
            .Build()
        .TextField("cvv", "CVV")
            .Required(true)
            .Build()
        .Build()
    .GroupOption("bankTransfer", "Bank Transfer")
        .TextField("accountName", "Account Name")
            .Required(true)
            .Build()
        .TextField("accountNumber", "Account Number")
            .Required(true)
            .Build()
        .TextField("bankCode", "Bank Code")
            .Required(true)
            .Build()
        .Build()
    .Build()
```

### Custom Field Types

You can extend SmartForm with custom field types by implementing the frontend rendering components.

```tsx
// Register a custom field renderer in your React application
import { registerFieldType } from '@xraph/smartform-react';

// Create a custom field component
function RatingField({ field, value, onChange, errors }) {
  return (
    <div className="rating-field">
      <label>{field.label}</label>
      <div className="stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={star <= value ? 'active' : ''}
            onClick={() => onChange(field.id, star)}
          >
            ★
          </span>
        ))}
      </div>
      {errors && <div className="error">{errors.message}</div>}
    </div>
  );
}

// Register the custom field type
registerFieldType('rating', RatingField);
```

### Dynamic Function Integration

Dynamic functions can be used for complex field interactions and calculations.

```go
// Register a dynamic function to calculate shipping cost
funcService.RegisterFunction("calculateShipping", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
    country, _ := args["country"].(string)
    weight, _ := args["weight"].(float64)
    
    var rate float64
    switch country {
    case "US":
        rate = 5.0
    case "CA":
        rate = 7.5
    default:
        rate = 15.0
    }
    
    return weight * rate, nil
})

// Add a calculated shipping field to a form
form.NumberField("shippingCost", "Shipping Cost")
    .DynamicValue("calculateShipping")
    .WithArgument("country", "${shippingAddress.country}")
    .WithArgument("weight", "${weight}")
    .End()
    .Property("readOnly", true)
    .Property("format", "currency")
    .Build()
```

### Advanced Validation

SmartForm supports complex validation scenarios with cross-field validation and custom validation functions.

```go
// Register a custom validation function
funcService.RegisterFunction("validatePasswordStrength", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
    password, _ := args["password"].(string)
    
    // Check password strength
    hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
    hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
    hasDigit := regexp.MustCompile(`[0-9]`).MatchString(password)
    hasSpecial := regexp.MustCompile(`[^A-Za-z0-9]`).MatchString(password)
    
    return hasUpper && hasLower && hasDigit && hasSpecial, nil
})

// Add a password field with custom validation
form.PasswordField("password", "Password")
    .Required(true)
    .ValidateMinLength(8, "Password must be at least 8 characters")
    .DynamicValidation("validatePasswordStrength", "Password must include uppercase, lowercase, digit, and special character")
    .WithArgument("password", "${password}")
    .End()
    .Build()

// Add a confirm password field with cross-field validation
form.PasswordField("confirmPassword", "Confirm Password")
    .Required(true)
    .ValidateDependency(map[string]interface{}{
        "field": "password",
        "operator": "eq",
        "value": "${confirmPassword}",
    }, "Passwords do not match")
    .Build()
```

### Conditional Logic

SmartForm provides a flexible conditions system for controlling field visibility and enablement.

```go
// Create a complex condition with multiple rules
condition := smartform.And(
    smartform.When("age").GreaterThanOrEquals(18).Build(),
    smartform.Or(
        smartform.When("country").Equals("US").Build(),
        smartform.When("country").Equals("CA").Build()
    ).Build()
).Build()

// Use the condition to control field visibility
form.TextField("ssn", "Social Security Number")
    .VisibleWhen(condition)
    .Build()
```

### API Integration

SmartForm can integrate with external APIs for dynamic data and form submission.

```go
// Create an API field that fetches and submits data
form.APIField("products", "Product Information")
    .Endpoint("/api/products")
    .Method("GET")
    .Header("Content-Type", "application/json")
    .Parameter("category", "${category}")
    .ResponseMapping(map[string]string{
        "id": "productId",
        "name": "productName",
        "price": "productPrice",
    })
    .WithDynamicResponse("processProductResponse")
    .WithArgument("formatPrice", true)
    .End()
    .Build()
```

### Authentication Strategies

SmartForm supports various authentication methods for API integrations.

```go
// Create an authentication field for OAuth
form.AuthField("apiAccess", "API Access")
    .AuthType("oauth")
    .ServiceID("salesforce")
    .Property("authUrl", "https://login.salesforce.com/services/oauth2/authorize")
    .Property("tokenUrl", "https://login.salesforce.com/services/oauth2/token")
    .Property("clientId", "your-client-id")
    .Property("scope", "api refresh_token")
    .Property("callbackUrl", "https://your-app.com/oauth/callback")
    .Build()
```

## Performance Optimization

SmartForm includes several features to optimize performance:

1. **Option Caching**: Dynamic options are cached for a configurable time period
2. **Conditional Rendering**: Only visible fields are rendered
3. **Dynamic Evaluation**: Conditions are evaluated only when their dependent fields change
4. **Server-Side Processing**: Heavy validation and processing happens on the server
5. **Batch Processing**: API requests can be batched for efficiency

## Deployment

### Server Deployment

Deploy the Go backend using standard Go deployment practices:

```bash
# Build the server
go build -o smartform-server

# Run the server
./smartform-server -port=8080
```

### Frontend Deployment

Deploy the React frontend using your preferred method:

```bash
# Build the React application
npm run build

# Serve the built assets
npx serve -s build
```

## Troubleshooting

### Common Issues

1. **Field Not Appearing**: Check visibility conditions and ensure dependent fields have values
2. **Validation Not Working**: Ensure validation rules are properly configured
3. **Options Not Loading**: Check API endpoint and network connectivity
4. **Dynamic Functions Not Working**: Verify function registration and argument passing
5. **API Integration Issues**: Check authentication, headers, and request format

### Debugging

Enable debug mode for detailed logging:

```go
// Enable debug mode on the API handler
handler.Property("debug", true)
```

## FAQ

### Can I use SmartForm with other frontend frameworks?

Yes, while we provide a React library, you can use the API endpoints with any frontend framework. The schemas are returned as JSON and can be consumed by any client.

### How do I add custom field types?

On the backend, you can use the `FieldTypeCustom` type and specify a `componentName` property. On the frontend, register a renderer for that component name.

### Can I use SmartForm with a database?

Yes, SmartForm is database-agnostic. You can implement your own storage layer to save and load form definitions and submissions.

### Is SmartForm suitable for large forms?

Yes, SmartForm is designed to handle large, complex forms efficiently. The conditional rendering and field dependency features help manage complexity and improve performance.

### How do I implement file uploads?

SmartForm includes `FileField` and `ImageField` types that support file uploads. Implement your own storage backend for the uploaded files.