package examples

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/juicycleff/smartform/v1"
)

// TemplateResolutionExample demonstrates how to use template resolution in forms
func TemplateResolutionExample() {
	// Create a form with template expressions
	form := smartform.NewForm("user-profile", "User Profile").
		Description("Complete your profile with ${user.name}").
		RegisterVariable("user", map[string]interface{}{
			"name":       "John Doe",
			"age":        30,
			"isAdmin":    true,
			"department": "Engineering",
		}).
		RegisterVariable("company", map[string]interface{}{
			"name":    "TechCorp",
			"domain":  "techcorp.com",
			"founded": 2020,
		})

	// Add fields with template expressions
	form.TextField("greeting", "${if(gt(user.age, 18), 'Welcome Adult', 'Welcome Young User')}").
		Placeholder("Enter your greeting here").
		DefaultValue("Hello ${user.name} from ${company.name}!")

	form.TextField("email", "Email Address").
		Placeholder("${user.name}@${company.domain}").
		DefaultValue("${toLower(user.name)}@${company.domain}")

	form.TextField("department_info", "Department Information").
		DefaultValue("You work in ${user.department} department")

	form.NumberField("experience_years", "Years of Experience").
		DefaultValue("${subtract(2024, add(user.age, 22))}")

	form.CheckboxField("is_admin", "Administrator Access").
		DefaultValue("${user.isAdmin}")

	// Conditional field with template expressions
	form.TextField("admin_note", "Admin Note").
		VisibleWhen(&smartform.Condition{
			Type:       smartform.ConditionTypeExpression,
			Expression: "${user.isAdmin}",
		}).
		DefaultValue("${format('Admin privileges granted to %s', user.name)}")

	// Build the form
	schema := form.Build()

	// Example 1: Resolve form data with template expressions
	fmt.Println("=== Example 1: Resolving Form Data ===")

	formData := map[string]interface{}{
		"greeting":       "${concat('Hello ', user.name, '!')}",
		"custom_message": "${format('Welcome to %s, %s!', company.name, user.name)}",
		"user_summary":   "${format('User: %s, Age: %d, Department: %s', user.name, user.age, user.department)}",
		"nested_data": map[string]interface{}{
			"computed_field": "${if(user.isAdmin, 'Administrator', 'Regular User')}",
			"array_data": []interface{}{
				"${user.name}",
				"${company.name}",
				"${format('Founded in %d', company.founded)}",
			},
		},
	}

	resolvedData := schema.ResolveFormData(formData)
	printJSON("Resolved Form Data", resolvedData)

	// Example 2: Resolve field configurations
	fmt.Println("\n=== Example 2: Resolving Field Configurations ===")

	currentData := map[string]interface{}{
		"user_age":  25,
		"user_name": "Alice Smith",
	}

	for _, field := range schema.Fields {
		resolvedField := schema.ResolveFieldConfiguration(field, currentData)
		fmt.Printf("Field: %s\n", field.ID)
		fmt.Printf("  Original Label: %s\n", field.Label)
		fmt.Printf("  Resolved Label: %s\n", resolvedField.Label)
		if field.Placeholder != "" {
			fmt.Printf("  Original Placeholder: %s\n", field.Placeholder)
			fmt.Printf("  Resolved Placeholder: %s\n", resolvedField.Placeholder)
		}
		if field.DefaultValue != nil {
			fmt.Printf("  Original Default: %v\n", field.DefaultValue)
			fmt.Printf("  Resolved Default: %v\n", resolvedField.DefaultValue)
		}
		fmt.Println()
	}

	// Example 3: Resolve default values
	fmt.Println("=== Example 3: Resolving Default Values ===")

	defaults := schema.ResolveDefaultValues(currentData)
	printJSON("Resolved Default Values", defaults)

	// Example 4: Resolve individual field values
	fmt.Println("\n=== Example 4: Resolving Individual Field Values ===")

	testValues := map[string]interface{}{
		"template_string": "${format('Hello %s, you are %d years old', user.name, user.age)}",
		"conditional":     "${if(gt(user.age, 18), 'Adult', 'Minor')}",
		"calculation":     "${add(user.age, 10)}",
		"null_coalesce":   "${user.nickname ?? user.name}",
	}

	for fieldName, value := range testValues {
		result := schema.ResolveFieldValue(fieldName, value, currentData)
		fmt.Printf("Field: %s\n", fieldName)
		fmt.Printf("  Original: %v\n", value)
		fmt.Printf("  Resolved: %v\n", result.Value)
		fmt.Printf("  Success: %t\n", result.Resolved)
		if result.Error != nil {
			fmt.Printf("  Error: %v\n", result.Error)
		}
		fmt.Println()
	}

	// Example 5: Advanced resolution with options
	fmt.Println("=== Example 5: Advanced Resolution with Options ===")

	// Strict mode - will return errors for unresolved variables
	strictOptions := &smartform.ResolutionOptions{
		StrictMode:      true,
		DefaultOnError:  "[ERROR]",
		MaxDepth:        5,
		EnableRecursion: true,
	}

	dataWithErrors := map[string]interface{}{
		"valid_field":   "${user.name}",
		"invalid_field": "${nonexistent.variable}",
		"recursive":     "${user.name} - ${user.department}",
	}

	fmt.Println("With Strict Mode:")
	resolvedStrict := schema.ResolveFormData(dataWithErrors, strictOptions)
	printJSON("Strict Resolution", resolvedStrict)

	// Lenient mode - will use defaults for unresolved variables
	lenientOptions := &smartform.ResolutionOptions{
		StrictMode:      false,
		DefaultOnError:  "[DEFAULT]",
		MaxDepth:        10,
		EnableRecursion: false,
	}

	fmt.Println("\nWith Lenient Mode:")
	resolvedLenient := schema.ResolveFormData(dataWithErrors, lenientOptions)
	printJSON("Lenient Resolution", resolvedLenient)

	// Example 6: Conditional expressions
	fmt.Println("\n=== Example 6: Resolving Conditional Expressions ===")

	conditions := []*smartform.Condition{
		{
			Type:       smartform.ConditionTypeExpression,
			Expression: "${gt(user.age, 18)}",
		},
		{
			Type:       smartform.ConditionTypeExpression,
			Expression: "${and(user.isAdmin, gt(user.age, 25))}",
		},
		{
			Type:       smartform.ConditionTypeExpression,
			Expression: "${eq(user.department, 'Engineering')}",
		},
	}

	testData := map[string]interface{}{
		"user": map[string]interface{}{
			"age":        30,
			"isAdmin":    true,
			"department": "Engineering",
		},
	}

	for i, condition := range conditions {
		result, err := schema.ResolveConditionalExpression(condition, testData)
		fmt.Printf("Condition %d: %s\n", i+1, condition.Expression)
		fmt.Printf("  Result: %t\n", result)
		if err != nil {
			fmt.Printf("  Error: %v\n", err)
		}
		fmt.Println()
	}
}

// DynamicFormExample shows how to create forms that adapt based on resolved data
func DynamicFormExample() {
	fmt.Println("\n=== Dynamic Form Example ===")

	// Create a form that adapts based on user role
	form := smartform.NewForm("dynamic-form", "Dynamic Form").
		RegisterVariable("currentUser", map[string]interface{}{
			"role":       "admin",
			"department": "IT",
			"level":      "senior",
		})

	// Fields that change based on user role
	form.TextField("title", "${if(eq(currentUser.role, 'admin'), 'Administrator Panel', 'User Panel')}").
		HelpText("${format('Welcome %s user', currentUser.role)}")

	form.SelectField("access_level", "Access Level").
		AddOptions(smartform.NewOptionsBuilder().Static().
			AddOption("read", "${if(eq(currentUser.role, 'admin'), 'Read (Admin)', 'Read')}").
			AddOption("write", "${if(eq(currentUser.role, 'admin'), 'Write (Admin)', 'Write (Limited)')}").
			AddOption("admin", "${if(eq(currentUser.role, 'admin'), 'Full Admin Access', 'Not Available')}").
			Build().Static...)

	// Conditional fields based on resolved expressions
	form.TextField("admin_tools", "Admin Tools").
		VisibleWhen(&smartform.Condition{
			Type:       smartform.ConditionTypeExpression,
			Expression: "${eq(currentUser.role, 'admin')}",
		}).
		DefaultValue("${format('Admin tools for %s department', currentUser.department)}")

	schema := form.Build()

	// Simulate different user contexts
	userContexts := []map[string]interface{}{
		{
			"currentUser": map[string]interface{}{
				"role":       "admin",
				"department": "IT",
				"level":      "senior",
			},
		},
		{
			"currentUser": map[string]interface{}{
				"role":       "user",
				"department": "Sales",
				"level":      "junior",
			},
		},
	}

	for i, context := range userContexts {
		fmt.Printf("\nUser Context %d:\n", i+1)

		// Resolve field configurations for this context
		for _, field := range schema.Fields {
			resolvedField := schema.ResolveFieldConfiguration(field, context)
			fmt.Printf("  Field '%s': %s\n", field.ID, resolvedField.Label)

			// Check if field should be visible
			if field.Visible != nil {
				visible, _ := schema.ResolveConditionalExpression(field.Visible, context)
				fmt.Printf("    Visible: %t\n", visible)
			}

			if resolvedField.DefaultValue != nil {
				fmt.Printf("    Default: %v\n", resolvedField.DefaultValue)
			}
		}
	}
}

// printJSON is a helper function to print objects as formatted JSON
func printJSON(title string, data interface{}) {
	fmt.Printf("%s:\n", title)
	jsonData, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Printf("Error marshaling JSON: %v", err)
		return
	}
	fmt.Printf("%s\n", string(jsonData))
}

// RunAllExamples runs all template resolution examples
func RunAllExamples() {
	fmt.Println("Smart Form Template Resolution Examples")
	fmt.Println("=====================================")

	TemplateResolutionExample()
	DynamicFormExample()

	fmt.Println("\nAll examples completed!")
}
