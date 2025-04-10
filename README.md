# SmartForm

SmartForm is a powerful, flexible, and performance-optimized dynamic form framework for building complex, interactive forms with conditional logic, field dependencies, and advanced validation. Built with Go on the backend and React/TypeScript for the frontend, SmartForm provides a comprehensive solution for creating sophisticated form experiences without writing custom code.

[![Go Reference](https://pkg.go.dev/badge/github.com/juicycleff/smartform/v1.svg)](https://pkg.go.dev/github.com/juicycleff/smartform/v1)
[![Go Report Card](https://goreportcard.com/badge/github.com/juicycleff/smartform/v1)](https://goreportcard.com/report/github.com/juicycleff/smartform/v1)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Fluent Builder API**: Construct complex forms with an intuitive, chainable API
- **Conditional Rendering**: Show or hide fields based on values of other fields
- **Dynamic Field Enablement**: Enable or disable fields conditionally
- **Advanced Validation**: Built-in and custom validation rules with dependency support
- **Dynamic Options**: Load options from API endpoints or custom functions
- **Field Dependencies**: Create cascading select fields and other dependent fields
- **Rich Field Types**: Support for over 25 field types, from basic inputs to complex components
- **Form Grouping**: Organize forms with nested fields, arrays, and conditional branches
- **Authentication Integration**: Built-in support for various auth strategies
- **API Integration**: Connect forms directly to API endpoints
- **Extensible Architecture**: Add custom field types, validation rules, and functions
- **Performance Optimized**: Efficient rendering and validation with proper caching

## Structure

- Go library (root): Main Go package
- `frontend/core`: TypeScript core library
- `frontend/react`: React components library


## Installation

### Backend (Go)

```bash
go get github.com/juicycleff/smartform/v1
```

### Frontend (React/TypeScript)

```bash
npm install @juicycleff/smartform-react
# or
yarn add @juicycleff/smartform-react
```

## Quick Start

### Backend (Go)

```go
package main

import (
	"net/http"

	"github.com/juicycleff/smartform/v1"
)

func main() {
	// Create an API handler
	handler := smartform.NewAPIHandler()

	// Create a simple contact form
	contactForm := smartform.NewForm("contact", "Contact Us")
		.Description("Send us your questions or feedback")
		.TextField("name", "Your Name")
			.Required(true)
			.Placeholder("John Doe")
			.Build()
		.EmailField("email", "Email Address")
			.Required(true)
			.ValidateEmail("Please enter a valid email address")
			.Build()
		.TextareaField("message", "Message")
			.Required(true)
			.ValidateMinLength(10, "Message must be at least 10 characters long")
			.Build()
		.Build()

	// Register the form schema
	handler.RegisterSchema(contactForm)

	// Set up routes
	mux := http.NewServeMux()
	handler.SetupRoutes(mux)

	// Start the server
	http.ListenAndServe(":8080", mux)
}
```

### Frontend (React/TypeScript)

```tsx
import React, { useState, useEffect } from 'react';
import { SmartForm, useSmartForm } from '@juicycleff/smartform-react';

function ContactFormPage() {
  const [formSchema, setFormSchema] = useState(null);
  const { formState, errors, handleSubmit } = useSmartForm();

  useEffect(() => {
    // Fetch the form schema from the server
    fetch('/api/forms/contact')
      .then(res => res.json())
      .then(schema => setFormSchema(schema));
  }, []);

  const onSubmit = async (data) => {
    // Submit the form data to the server
    const response = await fetch('/api/submit/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log(result);
  };

  if (!formSchema) return <div>Loading form...</div>;

  return (
    <div className="container">
      <h1>Contact Us</h1>
      <SmartForm 
        schema={formSchema} 
        onSubmit={handleSubmit(onSubmit)} 
        errors={errors}
      />
    </div>
  );
}

export default ContactFormPage;
```

## Core Concepts

### Form Schema

A form schema defines the structure and behavior of a form, including its fields, validation rules, and conditional logic.

### Fields

Fields are the building blocks of forms. SmartForm provides a wide variety of field types:

- Basic fields: text, textarea, number, email, password, etc.
- Selection fields: select, multiselect, checkbox, radio, switch, etc.
- Date/time fields: date, time, datetime
- Media fields: file, image
- Complex fields: group, array, oneOf, anyOf
- Special fields: rich text, color picker, rating, slider
- Integration fields: API, authentication, workflow branches
- Layout fields: section, hidden
- Custom fields: extend with your own components

### Conditions

Conditions control the visibility and enablement of fields based on the values of other fields or custom expressions.

### Validation

Validation rules ensure data integrity and provide immediate feedback to users.

### Options

Options define the available choices for selection fields, with support for static, dynamic, and dependent options.

## Examples

### Conditional Form

```go
// Create a form with conditional fields
registrationForm := smartform.NewForm("registration", "Registration Form")
    .TextField("name", "Full Name")
        .Required(true)
        .Build()
    .EmailField("email", "Email Address")
        .Required(true)
        .ValidateEmail("Please enter a valid email address")
        .Build()
    .RadioField("accountType", "Account Type")
        .Required(true)
        .AddOption("personal", "Personal Account")
        .AddOption("business", "Business Account")
        .Build()
    .TextField("companyName", "Company Name")
        .VisibleWhenEquals("accountType", "business")
        .Required(true)
        .Build()
    .TextField("taxId", "Tax ID")
        .VisibleWhenEquals("accountType", "business")
        .Build()
    .Build()
```

### Dynamic Options

```go
// Create a form with dynamic dependent options
addressForm := smartform.NewForm("address", "Address Information")
    .SelectField("country", "Country")
        .Required(true)
        .WithOptionsFromAPI("/api/countries", "GET", "id", "name")
        .Build()
    .SelectField("state", "State/Province")
        .Required(true)
        .WithOptionsFromAPI("/api/states/${country}", "GET", "id", "name")
        .WithOptionsRefreshingOn("country")
        .Build()
    .SelectField("city", "City")
        .Required(true)
        .WithOptionsFromAPI("/api/cities/${state}", "GET", "id", "name")
        .WithOptionsRefreshingOn("state")
        .Build()
    .Build()
```

### Advanced Validation

```go
// Create a form with advanced validation
paymentForm := smartform.NewForm("payment", "Payment Information")
    .TextField("cardNumber", "Card Number")
        .Required(true)
        .ValidatePattern("^[0-9]{16}$", "Card number must be 16 digits")
        .Formatter("formatCardNumber")
            .WithArgument("format", "xxxx-xxxx-xxxx-xxxx")
            .End()
        .Build()
    .TextField("cardHolder", "Cardholder Name")
        .Required(true)
        .Build()
    .TextField("expiryMonth", "Expiry Month (MM)")
        .Required(true)
        .ValidatePattern("^(0[1-9]|1[0-2])$", "Month must be between 01-12")
        .Build()
    .TextField("expiryYear", "Expiry Year (YY)")
        .Required(true)
        .ValidatePattern("^[0-9]{2}$", "Year must be 2 digits")
        .Build()
    .TextField("cvv", "CVV")
        .Required(true)
        .ValidatePattern("^[0-9]{3,4}$", "CVV must be 3 or 4 digits")
        .Build()
    .DynamicValidation("validateExpiry", "Card is expired")
        .WithArgument("month", "${expiryMonth}")
        .WithArgument("year", "${expiryYear}")
        .End()
    .Build()
```

## API Documentation

For detailed API documentation, please refer to the [official documentation](https://github.com/juicycleff/smartform/v1/docs).


### TypeScript Core

```bash
# Install the core library
npm install @xraph/smartform-core
```

### React Components

```bash
# Install the React library
npm install @xraph/smartform-react
```

## Development

### Prerequisites

- Go 1.20 or higher
- Node.js 18 or higher
- npm or yarn

### Setup

1. Clone the repository
2. Install Go dependencies: `go mod download`
3. Install frontend dependencies:
   - `cd frontend/core && npm install`
   - `cd frontend/react && npm install`

### Build

- Go: `make build`
- TypeScript Core: `cd frontend/core && npm run build`
- React: `cd frontend/react && npm run build`

### Test

- Go: `make test`
- TypeScript Core: `cd frontend/core && npm test`
- React: `cd frontend/react && npm test`



## Releasing

This project uses GitHub Actions for releases:

1. Update version numbers in Go code and package.json files
2. Create and push a new tag: `git tag v1.0.0 && git push origin v1.0.0`
3. GitHub Actions will automatically:
   - Create a GitHub release with Go binaries
   - Publish the TypeScript and React packages to npm

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.