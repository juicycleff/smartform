# Template Resolution System

The Smart Form library includes a powerful template resolution system that allows you to use dynamic expressions in form inputs, field configurations, and conditional logic. This system resolves template expressions like `${variable}` and `${function(args)}` into actual values using the current form state and registered variables.

## Features

- **Variable Resolution**: Access registered variables and form data using dot notation
- **Function Calls**: Use built-in functions for calculations, formatting, and logic
- **Nested Object Support**: Resolve templates in nested objects and arrays
- **Conditional Expressions**: Dynamic field visibility and requirements
- **Field Configuration**: Dynamic labels, placeholders, and help text
- **Default Values**: Template-based default values
- **Error Handling**: Configurable error handling with fallback values
- **Performance**: Efficient resolution with caching and circular dependency detection

## Basic Usage

### 1. Register Variables

First, register variables in your form schema:

```go
form := smartform.NewForm("user-form", "User Registration").
    RegisterVariable("user", map[string]interface{}{
        "name": "John Doe",
        "age":  30,
        "role": "admin",
    }).
    RegisterVariable("company", "TechCorp").
    RegisterVariable("config", map[string]interface{}{
        "domain": "example.com",
        "year":   2024,
    })
```

### 2. Use Templates in Fields

Add fields with template expressions:

```go
// Simple variable substitution
form.TextField("greeting", "Welcome").
    DefaultValue("Hello ${user.name}!")

// Function calls
form.TextField("email", "Email").
    Placeholder("${user.name}@${config.domain}").
    DefaultValue("${toLower(user.name)}@${config.domain}")

// Conditional expressions
form.TextField("admin_field", "Admin Tools").
    Visible(&smartform.Condition{
        Type:       smartform.ConditionTypeExpression,
        Condition: "${eq(user.role, 'admin')}",
    })
```

### 3. Resolve Form Data

Resolve template expressions in form data:

```go
schema := form.Build()

formData := map[string]interface{}{
    "custom_greeting": "${format('Welcome %s to %s!', user.name, company)}",
    "calculated_age":  "${add(user.age, 1)}",
    "nested_data": map[string]interface{}{
        "user_info": "${format('User: %s, Role: %s', user.name, user.role)}",
    },
}

resolvedData := schema.ResolveFormData(formData)
// resolvedData["custom_greeting"] = "Welcome John Doe to TechCorp!"
// resolvedData["calculated_age"] = 31
```

## Template Syntax

### Variable Access

```go
// Simple variable
"${user.name}"

// Nested property
"${user.address.city}"

// Array access
"${users[0].name}"

// Null coalescing
"${user.nickname ?? user.name}"
```

### Function Calls

```go
// String functions
"${concat(user.firstName, ' ', user.lastName)}"
"${format('Hello %s, you are %d years old', user.name, user.age)}"
"${toUpper(user.name)}"

// Math functions
"${add(user.age, 10)}"
"${multiply(price, quantity)}"
"${round(average, 2)}"

// Conditional functions
"${if(gt(user.age, 18), 'Adult', 'Minor')}"
"${eq(user.status, 'active')}"

// Date functions
"${formatDate(now(), '2006-01-02')}"
"${addDays(startDate, 30)}"
```

### Complex Expressions

```go
// Nested conditions
"${if(and(gt(user.age, 18), eq(user.status, 'verified')), 'Full Access', 'Limited Access')}"

// Array operations  
"${join(user.skills, ', ')}"
"${first(user.addresses).city}"

// String manipulation
"${substring(user.id, 0, 8)}"
"${trim(user.input)}"
```

## Resolution Methods

### ResolveFormData

Resolves all template expressions in a form data object:

```go
resolvedData := schema.ResolveFormData(formData, options)
```

### ResolveFieldValue

Resolves a single field value:

```go
result := schema.ResolveFieldValue("fieldId", "${user.name}", formData)
if result.Resolved {
    fmt.Printf("Resolved value: %v", result.Value)
} else {
    fmt.Printf("Error: %v", result.Error)
}
```

### ResolveFieldConfiguration

Resolves templates in field configuration (labels, placeholders, etc.):

```go
resolvedField := schema.ResolveFieldConfiguration(field, formData)
```

### ResolveDefaultValues

Resolves default values for all fields:

```go
defaults := schema.ResolveDefaultValues(formData)
```

### ResolveConditionalExpression

Resolves conditional expressions for field visibility:

```go
condition := &smartform.Condition{
    Type:       smartform.ConditionTypeExpression,
    Condition: "${gt(user.age, 18)}",
}

isVisible, err := schema.ResolveConditionalExpression(condition, formData)
```

## Resolution Options

Configure resolution behavior with `ResolutionOptions`:

```go
options := &smartform.ResolutionOptions{
    StrictMode:      false,                // Error on unresolved variables
    DefaultOnError:  "[DEFAULT]",          // Default value for errors
    MaxDepth:        10,                   // Maximum resolution depth
    PreserveNulls:   false,                // Preserve null values
    EnableRecursion: false,                // Allow recursive resolution
}

resolvedData := schema.ResolveFormData(formData, options)
```

### Strict vs Lenient Mode

**Strict Mode** (`StrictMode: true`):
- Returns errors for unresolved variables
- Fails fast on template errors
- Use for validation and debugging

**Lenient Mode** (`StrictMode: false`):
- Uses fallback values for unresolved variables
- Continues processing despite errors
- Use for production with graceful degradation

## Advanced Features

### Recursive Resolution

Enable recursive resolution for templates that resolve to templates:

```go
// Register a variable that contains a template
form.RegisterVariable("template", "${user.name} from ${company}")

// This will be resolved recursively
formData := map[string]interface{}{
    "field": "${template}",
}

options := &smartform.ResolutionOptions{
    EnableRecursion: true,
}

resolved := schema.ResolveFormData(formData, options)
// resolved["field"] = "John Doe from TechCorp"
```

### Context-Aware Resolution

Access different contexts during resolution:

```go
// Form data context
"${fieldValue}"  // Access other field values

// Field context
"${currentField}"  // Current field ID
"${fieldType}"     // Current field type

// Global variables
"${user.name}"     // Registered variables
"${config.setting}" // Global configuration
```

### Circular Dependency Detection

The resolver automatically detects and prevents circular dependencies:

```go
// This would be detected and prevented
form.RegisterVariable("a", "${b}")
form.RegisterVariable("b", "${a}")
```

## Error Handling

### Resolution Results

Check resolution results for errors:

```go
result := schema.ResolveFieldValue("field", "${invalid.var}", formData)
if !result.Resolved {
    log.Printf("Resolution failed: %v", result.Error)
    // Use result.Value as fallback (original value or default)
}
```

### Error Recovery

Configure error recovery strategies:

```go
// Use default values
options := &smartform.ResolutionOptions{
    StrictMode:     false,
    DefaultOnError: "[ERROR]",
}

// Or handle errors programmatically
resolvedData := schema.ResolveFormData(formData, options)
for key, value := range resolvedData {
    if str, ok := value.(string); ok && str == "[ERROR]" {
        // Handle error case
        resolvedData[key] = getDefaultValue(key)
    }
}
```

## Performance Considerations

### Caching

The template engine automatically caches parsed expressions:

```go
// First evaluation parses and caches
result1 := schema.ResolveFieldValue("field", "${user.name}", data1)

// Subsequent evaluations use cached version
result2 := schema.ResolveFieldValue("field", "${user.name}", data2)
```

### Optimization Tips

1. **Minimize Deep Nesting**: Avoid overly complex nested objects
2. **Use Simple Expressions**: Complex expressions are slower to evaluate
3. **Cache Resolved Values**: Store frequently used resolved values
4. **Batch Operations**: Resolve multiple fields together when possible

```go
// Good: Batch resolution
resolvedData := schema.ResolveFormData(allFormData)

// Less efficient: Individual resolution
for field, value := range formData {
    resolved := schema.ResolveFieldValue(field, value, formData)
}
```

## Integration Examples

### Dynamic Form Labels

```go
form.TextField("user_input", "${format('Enter your %s', fieldType)}").
    Placeholder("${format('Type your %s here', fieldType)}")
```

### Conditional Field Visibility

```go
form.TextField("admin_panel", "Admin Panel").
    Visible(&smartform.Condition{
        Type:       smartform.ConditionTypeExpression,
        Condition: "${and(eq(user.role, 'admin'), user.verified)}",
    })
```

### Dynamic Default Values

```go
form.TextField("full_name", "Full Name").
    DefaultValue("${concat(user.firstName, ' ', user.lastName)}")

form.EmailField("email", "Email").
    DefaultValue("${format('%s@%s', toLower(user.username), company.domain)}")
```

### Calculated Fields

```go
form.NumberField("total_price", "Total Price").
    DefaultValue("${multiply(quantity, unitPrice)}")

form.TextField("order_summary", "Order Summary").
    DefaultValue("${format('Order for %s: %d items at $%.2f each', customer.name, quantity, unitPrice)}")
```

## Best Practices

1. **Use Descriptive Variable Names**: `user.profile.email` vs `u.p.e`
2. **Validate Template Expressions**: Test templates during development
3. **Handle Missing Variables**: Always provide fallback values
4. **Document Template Variables**: Maintain documentation of available variables
5. **Test Edge Cases**: Test with empty, null, and invalid values
6. **Monitor Performance**: Profile template resolution in production
7. **Use Type-Safe Variables**: Ensure variable types match expected usage

## Common Patterns

### User Personalization

```go
form.RegisterVariable("user", getCurrentUser()).
    TextField("welcome", "Welcome").
    DefaultValue("${format('Welcome back, %s!', user.displayName)}")
```

### Multi-Language Support

```go
form.RegisterVariable("i18n", getTranslations()).
    TextField("title", "${i18n.form.title}").
    HelpText("${i18n.form.help}")
```

### Dynamic Validation Messages

```go
form.TextField("age", "Age").
    ValidationRules([]*smartform.ValidationRule{
        {
            Type:    smartform.ValidationTypeMin,
            Message: "${format('Age must be at least %d', config.minAge)}",
            Parameters: 18,
        },
    })
```

This template resolution system provides powerful dynamic capabilities for your forms while maintaining performance and reliability. Use it to create adaptive, personalized form experiences that respond to user context and application state.
