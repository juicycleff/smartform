package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/juicycleff/smartform/v1"
)

func main() {
	// Create API handler
	handler := smartform.NewAPIHandler()

	// Register example forms
	registerContactFormWithBuilder(handler)
	registerUserProfileFormWithBuilder(handler)

	// Set up HTTP server
	mux := http.NewServeMux()
	handler.SetupRoutes(mux)

	// Serve static files
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/", fs)

	// Start server
	log.Println("Starting server on :8080...")
	log.Fatal(http.ListenAndServe(":8089", mux))
}

// registerContactFormWithBuilder registers a contact form using the builder pattern
func registerContactFormWithBuilder(handler *smartform.APIHandler) {
	// Create form schema using the builder pattern
	form := smartform.NewForm("contact", "Contact Us")
	form.Description("Send us a message and we'll get back to you as soon as possible.")

	// Create a validation builder for reuse
	v := smartform.NewValidationBuilder()

	form.GroupField("address", "Address").
		AddField(form.TextareaField("line1", "Line 1").Build())

	// Add name field
	form.TextField("name", "Full Name").
		Required(true).
		Placeholder("John Doe").
		AddValidation(v.MinLength(2, "Name must be at least 2 characters long"))

	// Add email field
	form.EmailField("email", "Email Address").
		Required(true).
		Placeholder("john.doe@example.com").
		AddValidation(v.Email("Please enter a valid email address"))

	// Add phone field
	form.TextField("phone", "Phone Number").
		Required(false).
		Placeholder("(123) 456-7890").
		AddValidation(v.Pattern("^[0-9\\-\\+\\s\\(\\)]+$", "Please enter a valid phone number"))

	// Add subject field with options
	form.SelectField("subject", "Subject").
		Required(true).
		AddOption("general", "General Inquiry").
		AddOption("support", "Technical Support").
		AddOption("billing", "Billing Question").
		AddOption("feedback", "Feedback")

	// Add message field
	form.TextareaField("message", "Message").
		Required(true).
		Placeholder("Your message here...").
		AddValidation(v.MinLength(10, "Message must be at least 10 characters long"))

	// Add priority field with visibility condition
	form.RadioField("priority", "Priority").
		VisibleWhenEquals("subject", "support").
		AddOption("low", "Low").
		AddOption("medium", "Medium").
		AddOption("high", "High")

	// Add attachment field
	form.FileField("attachment", "Attachment").
		Required(false).
		AddValidation(v.FileSize(5*1024*1024, "File size must be less than 5MB"))

	// Add newsletter checkbox
	form.CheckboxField("subscribe", "Subscribe to newsletter").
		Required(false).
		DefaultValue(false)

	// Register the form schema
	handler.RegisterSchema(form.Build())

	// Optionally print the form schema JSON for debugging
	formSchema := form.Build()
	jsonData, _ := json.MarshalIndent(formSchema, "", "  ")
	fmt.Println("Contact Form Schema:", string(jsonData))
}

// registerUserProfileFormWithBuilder registers a user profile form using the builder pattern
func registerUserProfileFormWithBuilder(handler *smartform.APIHandler) {
	// Create form schema using the builder pattern
	form := smartform.NewForm("userprofile", "User Profile")
	form.Description("Manage your user profile information.")

	// Create condition and validation builders for reuse
	v := smartform.NewValidationBuilder()

	// Personal Information Section
	form.SectionField("personalInfo", "Personal Information")

	// Add first name field
	form.TextField("firstName", "First Name").
		Required(true).
		Placeholder("John")

	// Add last name field
	form.TextField("lastName", "Last Name").
		Required(true).
		Placeholder("Doe")

	// Add date of birth field with custom validation
	form.DateField("birthDate", "Date of Birth").
		Required(true).
		AddValidation(v.Custom("validateAge", map[string]interface{}{
			"minAge": 18,
		}, "You must be at least 18 years old"))

	// Contact Information Section
	form.SectionField("contactInfo", "Contact Information")

	// Add email field
	form.EmailField("email", "Email Address").
		Required(true).
		AddValidation(v.Email("Please enter a valid email address"))

	// Add phone field
	form.TextField("phone", "Phone Number").
		Required(false)

	// Add address group with nested fields
	addressGroup := form.GroupField("address", "Address")

	addressGroup.TextField("street", "Street Address").
		Required(true)

	addressGroup.TextField("city", "City").
		Required(true)

	// Using dynamic options for state dropdown
	addressGroup.SelectField("state", "State").
		Required(true).
		WithOptionsFromAPI("/api/data/states", "GET", "code", "name")

	addressGroup.TextField("zip", "ZIP Code").
		Required(true).
		AddValidation(v.Pattern("^\\d{5}(-\\d{4})?$", "Please enter a valid ZIP code"))

	// Dynamic options for country dropdown
	addressGroup.SelectField("country", "Country").
		Required(true).
		WithOptionsFromAPI("/api/data/countries", "GET", "code", "name")

	// Preferences Section
	form.SectionField("preferences", "Preferences")

	// Theme selection with static options
	form.SelectField("theme", "Theme").
		AddOption("light", "Light").
		AddOption("dark", "Dark").
		AddOption("system", "System Default")

	// Notifications with multiple select
	form.MultiSelectField("notifications", "Notifications").
		AddOption("email", "Email").
		AddOption("sms", "SMS").
		AddOption("push", "Push Notifications")

	// Language selection
	form.SelectField("language", "Language").
		AddOption("en", "English").
		AddOption("es", "Spanish").
		AddOption("fr", "French").
		AddOption("de", "German").
		AddOption("zh", "Chinese")

	// Register the form schema
	handler.RegisterSchema(form.Build())
}

// Example of using the condition builder separately
func createAdvancedCondition() *smartform.Condition {
	// Create a complex condition:
	// (status == "active" AND role == "admin") OR (department == "IT" AND level >= 3)

	condition := smartform.Or(
		smartform.And(
			smartform.When("status").Equals("active").Build(),
			smartform.When("role").Equals("admin").Build(),
		).Build(),
		smartform.And(
			smartform.When("department").Equals("IT").Build(),
			smartform.When("level").GreaterThanOrEquals(3).Build(),
		).Build(),
	).Build()

	return condition
}

// Example of using the options builder separately
func createDynamicOptions() *smartform.OptionsConfig {
	// Create dynamic options that refresh when countryField changes
	options := smartform.NewOptionsBuilder().
		Dynamic().
		FromAPI("/api/data/cities", "GET").
		WithParameter("country", "${countryField}").
		WithValuePath("id").
		WithLabelPath("name").
		RefreshOn("countryField").
		Build()

	return options
}

// Example of using the dependent options builder
func createDependentOptions() *smartform.OptionsConfig {
	// Create options that depend on the value of categoryField
	options := smartform.NewOptionsBuilder().
		Dependent("categoryField").
		WhenEquals("electronics").
		AddOption("phones", "Phones").
		AddOption("computers", "Computers").
		AddOption("accessories", "Accessories").
		End().
		WhenEquals("clothing").
		AddOption("shirts", "Shirts").
		AddOption("pants", "Pants").
		AddOption("shoes", "Shoes").
		End().
		Build()

	return options
}
