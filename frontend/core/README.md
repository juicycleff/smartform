# SmartForm TypeScript Core Library

A comprehensive TypeScript library for building dynamic, conditional forms with validation and complex field dependencies. SmartForm can be used with any frontend framework, but is designed to be particularly easy to integrate with React, Vue, and Angular.

## Features

- **Fluent Builder API**: Easy-to-use builder pattern for creating complex forms
- **Conditional Rendering**: Show/hide fields based on values of other fields
- **Field Dependencies**: Field options can depend on values of other fields
- **Validation**: Comprehensive field validation with custom rules
- **Dynamic Data**: Support for dynamic data loading and processing
- **Authentication Fields**: Built-in support for various authentication strategies
- **Workflow Integration**: Branch fields for workflow integration
- **Performance Optimized**: Efficient rendering and validation algorithms

## Installation

```bash
npm install @smartform/core
```

## Basic Usage

Here's a simple example of creating a form with SmartForm:

```typescript
import { createForm, FieldType } from '@smartform/core';

// Create a new form
const form = createForm('contact-form', 'Contact Us')
  .description('Please fill out this form to contact us')
  
  // Add a text field
  .textField('name', 'Full Name')
    .required(true)
    .placeholder('Enter your full name')
    .validateRequired('Please enter your name')
    .validateMinLength(2, 'Name must be at least 2 characters')
    .build()
  
  // Add an email field
  .emailField('email', 'Email Address')
    .required(true)
    .placeholder('Enter your email address')
    .validateRequired('Please enter your email')
    .validateEmail('Please enter a valid email address')
    .build()
  
  // Add a select field with static options
  .selectField('subject', 'Subject')
    .required(true)
    .addOption('general', 'General Inquiry')
    .addOption('support', 'Technical Support')
    .addOption('billing', 'Billing Question')
    .addOption('other', 'Other')
    .build()
  
  // Add a textarea field that's only visible when 'other' is selected
  .textareaField('other-subject', 'Please specify')
    .visibleWhenEquals('subject', 'other')
    .required(true)
    .placeholder('Please describe your inquiry')
    .build()
  
  // Add a textarea for the message
  .textareaField('message', 'Message')
    .required(true)
    .placeholder('Enter your message')
    .validateRequired('Please enter a message')
    .validateMinLength(10, 'Message must be at least 10 characters')
    .build()
  
  // Build the form
  .build();

// Convert the form to JSON
const formJson = JSON.stringify(form, null, 2);
```

## Conditional Fields

SmartForm makes it easy to create conditional fields that depend on other fields:

```typescript
import { createForm, when } from '@smartform/core';

const form = createForm('conditional-form', 'Conditional Form Example')
  .selectField('employment', 'Employment Status')
    .addOption('employed', 'Employed')
    .addOption('self-employed', 'Self-Employed')
    .addOption('unemployed', 'Unemployed')
    .addOption('student', 'Student')
    .build()
  
  // This field is only visible when employment is 'employed'
  .textField('company', 'Company Name')
    .visibleWhenEquals('employment', 'employed')
    .required(true)
    .build()
  
  // This field is only visible when employment is 'self-employed'
  .textField('business', 'Business Name')
    .visibleWhenEquals('employment', 'self-employed')
    .required(true)
    .build()
  
  // This field is visible for both employed and self-employed (using 'or' condition)
  .numberField('income', 'Annual Income')
    .visibleWhenAnyMatch([
      when('employment').equals('employed').build(),
      when('employment').equals('self-employed').build()
    ])
    .required(true)
    .build()
  
  .build();
```

## Dynamic Options

You can create fields with options that depend on the values of other fields:

```typescript
import { createForm } from '@smartform/core';

const form = createForm('location-form', 'Location')
  .selectField('country', 'Country')
    .required(true)
    .withOptionsFromAPI('/api/countries', 'GET', 'iso', 'name')
    .build()
  
  // State/Province depends on the selected country
  .selectField('state', 'State/Province')
    .required(true)
    .withOptionsFromAPI('/api/states/${country}', 'GET', 'code', 'name')
    .withOptionsRefreshingOn(['country'])
    .build()
  
  // City depends on the selected state
  .selectField('city', 'City')
    .required(true)
    .withOptionsFromAPI('/api/cities?state=${state}&country=${country}', 'GET', 'id', 'name')
    .withOptionsRefreshingOn(['state'])
    .build()
  
  .build();
```

## Field Groups and Arrays

SmartForm supports field groups and arrays for complex data structures:

```typescript
import { createForm } from '@smartform/core';

const form = createForm('contact-form', 'Contact Information')
  // Basic contact information
  .textField('name', 'Full Name')
    .required(true)
    .build()
  
  .emailField('email', 'Email')
    .required(true)
    .build()
  
  // Address as a group field
  .groupField('address', 'Address')
    .textField('street', 'Street')
      .required(true)
      .build()
    
    .textField('city', 'City')
      .required(true)
      .build()
    
    .textField('state', 'State/Province')
      .required(true)
      .build()
    
    .textField('postal', 'Postal/Zip Code')
      .required(true)
      .build()
    
    .selectField('country', 'Country')
      .required(true)
      .withOptionsFromAPI('/api/countries', 'GET', 'iso', 'name')
      .build()
    .build()
  
  // Phone numbers as an array field
  .arrayField('phones', 'Phone Numbers')
    .objectTemplate('phone', '')
      .selectField('type', 'Type')
        .addOption('home', 'Home')
        .addOption('work', 'Work')
        .addOption('mobile', 'Mobile')
        .build()
      
      .textField('number', 'Number')
        .required(true)
        .build()
      .build()
    .minItems(1)
    .maxItems(5)
    .build()
  
  .build();
```

## Validation

SmartForm provides comprehensive validation capabilities:

```typescript
import { createForm } from '@smartform/core';

const form = createForm('registration-form', 'Register')
  .textField('username', 'Username')
    .required(true)
    .validateRequired('Username is required')
    .validateMinLength(3, 'Username must be at least 3 characters')
    .validateMaxLength(20, 'Username cannot be more than 20 characters')
    .validatePattern('^[a-zA-Z0-9_]+$', 'Username can only contain letters, numbers, and underscores')
    .validateUnique('This username is already taken')
    .build()
  
  .passwordField('password', 'Password')
    .required(true)
    .validateRequired('Password is required')
    .validateMinLength(8, 'Password must be at least 8 characters')
    .validatePattern('(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])', 'Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .build()
  
  .passwordField('confirm-password', 'Confirm Password')
    .required(true)
    .validateRequired('Please confirm your password')
    .validateDependency('password', 'eq', '${confirm-password}', 'Passwords do not match')
    .build()
  
  .build();
```

## Dynamic Field Properties

Fields can have dynamic properties based on custom functions:

```typescript
import { createForm } from '@smartform/core';

const form = createForm('dynamic-form', 'Dynamic Form')
  .numberField('quantity', 'Quantity')
    .required(true)
    .min(1)
    .build()
  
  .numberField('price', 'Price')
    .required(true)
    .min(0)
    .build()
  
  // Total is calculated based on quantity and price
  .numberField('total', 'Total')
    .dynamicValue('calculateTotal')
      .withFieldReference('quantity', 'quantity')
      .withFieldReference('price', 'price')
      .end()
    .build()
  
  .build();
```

## Authentication Fields

SmartForm provides specialized fields for different authentication strategies:

```typescript
import { createForm, AuthStrategy } from '@smartform/core';

// Create an OAuth2 authentication form
const oauthForm = createAuthForm('oauth-form', 'Sign in with Google', AuthStrategy.OAUTH2)
  .oauthField('google-auth', 'Google Authentication')
    .clientId('your-client-id')
    .authorizationUrl('https://accounts.google.com/o/oauth2/auth')
    .tokenUrl('https://accounts.google.com/o/oauth2/token')
    .scopes(['profile', 'email'])
    .redirectUri('https://your-app.com/callback')
    .responseType('code')
    .state(true)
    .pkce(true)
    .build()
  .build();

// Create a basic authentication form
const basicAuthForm = createAuthForm('basic-auth-form', 'Sign In', AuthStrategy.BASIC)
  .basicAuthField('basic-auth', 'Sign In')
    .usernameField('Username', 'Enter your username')
    .passwordField('Password', 'Enter your password')
    .rememberMe('Keep me signed in', false)
    .build()
  .build();
```

## API Integration

Integrate with APIs directly in your forms:

```typescript
import { createForm } from '@smartform/core';

const form = createForm('api-form', 'API Integration Example')
  .textField('search', 'Search')
    .build()
  
  // API field that loads data based on search
  .apiField('search-results', 'Search Results')
    .endpoint('https://api.example.com/search')
    .method('GET')
    .parameter('q', '${search}')
    .withDynamicResponse('processSearchResults')
      .withFieldReference('query', 'search')
      .end()
    .build()
  
  .build();
```

## Form Renderer

SmartForm includes a renderer that can handle contextual rendering:

```typescript
import { createFormRenderer } from '@smartform/core';

// Create a renderer for the form
const renderer = createFormRenderer(form);

// Render the form with context values
const context = {
  country: 'US',
  employment: 'employed'
};

const renderedForm = renderer.renderJSONWithContext(context);
```

## License

MIT