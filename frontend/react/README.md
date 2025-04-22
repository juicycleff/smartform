# SmartForm React

A powerful, fully-typed React library for rendering and validating dynamic forms based on the SmartForm props.

## Features

- 🔄 **Conditional Logic** - Show/hide fields based on form values
- ✅ **Validation** - Comprehensive validation system with custom rules
- 🧩 **Dependencies** - Smart dependency tracking between fields
- ⚡ **Performance** - Optimized rendering with selective updates
- 🔍 **Debug Mode** - Built-in debugging with field state visualization
- 🎨 **Shadcn UI Integration** - Built-in support for Shadcn UI components
- 🧰 **Extensible** - Easily add custom field types and renderers
- 📋 **Form State** - Complete form state management with dirty/touched tracking

## Installation

```bash
npm install @xraph/smartform-react @xraph/smartform-core
# or
yarn add @xraph/smartform-react @xraph/smartform-core
```

## Basic Usage

```tsx
import React from 'react';
import { SmartForm } from '@xraph/smartform-react';
import type { FormSchema } from '@xraph/smartform-core';

// Define your form props
const props: FormSchema = {
  id: 'contact-form',
  title: 'Contact Form',
  fields: [
    {
      id: 'name',
      type: 'text',
      label: 'Your Name',
      required: true,
    },
    {
      id: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      validationRules: [
        {
          type: 'email',
          message: 'Please enter a valid email address',
        },
      ],
    },
    {
      id: 'message',
      type: 'textarea',
      label: 'Message',
      required: true,
    },
  ],
};

const ContactForm = () => {
  const handleSubmit = (values) => {
    console.log('Form submitted with values:', values);
  };

  return (
    <SmartForm
      props={props}
      onSubmit={handleSubmit}
      renderer="shadcn" // Use Shadcn UI components
      debug={true} // Enable debug mode
    >
      <button type="submit">Submit</button>
    </SmartForm>
  );
};

export default ContactForm;
```

## Using