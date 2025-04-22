import {
    createForm,
    createFormRenderer,
    when,
    createOption
} from '../src';

/**
 * This example demonstrates creating a contact form with SmartForm
 */

// Create a contact form
const contactForm = createForm('contact-form', 'Contact Us')
    .description('Please fill out this form to contact us')

    // Basic personal information
    .textField('name', 'Full Name')
    .required(true)
    .placeholder('Enter your full name')
    .validateRequired('Please enter your name')
    .validateMinLength(2, 'Name must be at least 2 characters')
    .build()

    .emailField('email', 'Email Address')
    .required(true)
    .placeholder('Enter your email address')
    .validateRequired('Please enter your email')
    .validateEmail('Please enter a valid email address')
    .build()

    .textField('phone', 'Phone Number')
    .placeholder('Enter your phone number (optional)')
    .build()

    // Inquiry details
    .selectField('subject', 'Subject')
    .required(true)
    .addOption('general', 'General Inquiry')
    .addOption('support', 'Technical Support')
    .addOption('billing', 'Billing Question')
    .addOption('feedback', 'Feedback')
    .addOption('other', 'Other')
    .validateRequired('Please select a subject')
    .build()

    // Show order number field for support and billing inquiries
    .textField('order-number', 'Order Number')
    .visibleWhenAnyMatch([
        when('subject').equals('support').build(),
        when('subject').equals('billing').build()
    ])
    .placeholder('Enter your order number if applicable')
    .helpText('You can find your order number in your confirmation email')
    .build()

    // Show product field for support inquiries
    .selectField('product', 'Product')
    .visibleWhenEquals('subject', 'support')
    .required(true)
    .addOption('smartform-core', 'SmartForm Core')
    .addOption('smartform-react', 'SmartForm React')
    .addOption('smartform-vue', 'SmartForm Vue')
    .addOption('smartform-angular', 'SmartForm Angular')
    .validateRequired('Please select a product')
    .build()

    // Show other subject field when "Other" is selected
    .textField('other-subject', 'Please specify')
    .visibleWhenEquals('subject', 'other')
    .required(true)
    .placeholder('Please describe your inquiry')
    .validateRequired('Please specify your subject')
    .build()

    // Message
    .textareaField('message', 'Message')
    .required(true)
    .placeholder('Enter your message')
    .validateRequired('Please enter a message')
    .validateMinLength(10, 'Message must be at least 10 characters')
    .build()

    // Preferred contact method
    .radioField('contact-method', 'Preferred Contact Method')
    .required(true)
    .addOption('email', 'Email')
    .addOption('phone', 'Phone')
    .validateRequired('Please select a preferred contact method')
    .build()

    // Show phone validation when phone is selected
    .textField('phone-confirm', 'Confirm Phone Number')
    .visibleWhenEquals('contact-method', 'phone')
    .required(true)
    .placeholder('Confirm your phone number')
    .validateRequired('Please confirm your phone number')
    .validateDependency('phone', 'eq', '${phone-confirm}', 'Phone numbers do not match')
    .build()

    // Marketing consent
    .checkboxField('marketing', 'Subscribe to Newsletter')
    .defaultValue(false)
    .helpText('We\'ll send you occasional updates and offers')
    .build()

    .build();

// Create a renderer for the form
const renderer = createFormRenderer(contactForm);

// Render the form
const formJson = renderer.renderJSON();
console.log(formJson);

// Render the form with context (e.g., when subject is already selected)
const context = {
    subject: 'support',
    'contact-method': 'email'
};

const contextJson = renderer.renderJSONWithContext(context);
console.log(contextJson);

// Export the form
export default contactForm;