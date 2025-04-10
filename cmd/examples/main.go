package main

import (
	"fmt"
	"log"
	"math"
	"net/http"
	"strings"
	"time"

	"github.com/juicycleff/smartform/v1"
)

func main() {
	// Create API handler
	handler := smartform.NewAPIHandler()

	// Create and configure dynamic function service
	dynamicFunctionService := smartform.NewDynamicFunctionService()
	registerDynamicFunctions(dynamicFunctionService)
	registerDataTransformers(dynamicFunctionService)

	// Set the dynamic function service
	handler.SetDynamicFunctionService(dynamicFunctionService)

	// Register example forms
	registerDynamicOrderForm(handler)
	registerDynamicProductCatalog(handler)
	registerDataProcessingForm(handler)

	// Set up HTTP server
	mux := http.NewServeMux()
	handler.SetupRoutes(mux)

	// Serve static files
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/", fs)

	// Start server
	log.Println("Starting server on :8089...")
	log.Fatal(http.ListenAndServe(":8089", mux))
}

// registerDynamicFunctions registers example dynamic functions
func registerDynamicFunctions(service *smartform.DynamicFunctionService) {
	// Calculate tax based on country and state
	service.RegisterFunction("calculateTax", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
		// Extract arguments
		country, _ := args["country"].(string)
		state, _ := args["state"].(string)
		amount, _ := args["amount"].(float64)

		// Simple tax calculation logic
		var taxRate float64 = 0.0

		switch strings.ToUpper(country) {
		case "US":
			switch strings.ToUpper(state) {
			case "CA":
				taxRate = 0.0725 // 7.25% California base rate
			case "NY":
				taxRate = 0.04 // 4% New York base rate
			case "TX":
				taxRate = 0.0625 // 6.25% Texas base rate
			default:
				taxRate = 0.05 // Default US rate
			}
		case "UK":
			taxRate = 0.20 // 20% VAT
		case "DE":
			taxRate = 0.19 // 19% VAT in Germany
		default:
			taxRate = 0.10 // Default international rate
		}

		tax := amount * taxRate
		tax = math.Round(tax*100) / 100 // Round to 2 decimal places

		return tax, nil
	})

	// Generate time slots based on date
	service.RegisterFunction("generateTimeSlots", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
		// Extract arguments
		dateStr, _ := args["date"].(string)
		durationMinutes, _ := args["durationMinutes"].(float64)
		if durationMinutes == 0 {
			durationMinutes = 30 // Default to 30-minute slots
		}

		// Parse date
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return nil, fmt.Errorf("invalid date format: %v", err)
		}

		// Generate time slots
		slots := []map[string]interface{}{}

		// Start at 9 AM
		startTime := time.Date(date.Year(), date.Month(), date.Day(), 9, 0, 0, 0, time.Local)

		// End at 5 PM
		endTime := time.Date(date.Year(), date.Month(), date.Day(), 17, 0, 0, 0, time.Local)

		// Check if date is in the past
		now := time.Now()
		if date.Before(now) && now.Day() == date.Day() && now.Month() == date.Month() && now.Year() == date.Year() {
			// If today, start from current time (rounded up to next slot)
			currentMinutes := now.Hour()*60 + now.Minute()
			slotMinutes := int(durationMinutes)
			nextSlotMinutes := ((currentMinutes + slotMinutes - 1) / slotMinutes) * slotMinutes
			if nextSlotMinutes < 24*60 { // Ensure we don't overflow to next day
				startHour := nextSlotMinutes / 60
				startMinute := nextSlotMinutes % 60
				startTime = time.Date(date.Year(), date.Month(), date.Day(), startHour, startMinute, 0, 0, time.Local)
			}
		}

		// Generate slots
		duration := time.Duration(durationMinutes) * time.Minute
		for t := startTime; t.Before(endTime); t = t.Add(duration) {
			timeStr := t.Format("15:04")
			slots = append(slots, map[string]interface{}{
				"value": timeStr,
				"label": timeStr,
			})
		}

		return slots, nil
	})

	// Search products
	service.RegisterFunction("searchProducts", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
		// Extract arguments
		query, _ := args["query"].(string)
		category, _ := args["category"].(string)

		// Simplified product database
		products := []map[string]interface{}{
			{
				"id":       "p001",
				"name":     "Laptop Pro",
				"category": "electronics",
				"price":    1299.99,
				"brand":    "TechBrand",
				"stock":    15,
			},
			{
				"id":       "p002",
				"name":     "Smartphone X",
				"category": "electronics",
				"price":    899.99,
				"brand":    "PhoneCorp",
				"stock":    42,
			},
			{
				"id":       "p003",
				"name":     "Desk Chair",
				"category": "furniture",
				"price":    199.99,
				"brand":    "ComfortZone",
				"stock":    8,
			},
			{
				"id":       "p004",
				"name":     "Coffee Table",
				"category": "furniture",
				"price":    249.99,
				"brand":    "HomeStyle",
				"stock":    5,
			},
			{
				"id":       "p005",
				"name":     "Wireless Headphones",
				"category": "electronics",
				"price":    159.99,
				"brand":    "AudioTech",
				"stock":    30,
			},
		}

		// Filter results
		results := []map[string]interface{}{}

		for _, product := range products {
			nameStr, _ := product["name"].(string)
			productCategory, _ := product["category"].(string)

			// Apply category filter
			if category != "" && productCategory != category {
				continue
			}

			// Apply search query
			if query != "" && !strings.Contains(strings.ToLower(nameStr), strings.ToLower(query)) {
				continue
			}

			// Add to results
			results = append(results, map[string]interface{}{
				"value": product["id"],
				"label": product["name"],
				"price": product["price"],
				"brand": product["brand"],
				"stock": product["stock"],
			})
		}

		return results, nil
	})

	// Validate product quantity
	service.RegisterFunction("validateQuantity", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
		// Extract arguments
		productId, _ := args["productId"].(string)
		quantity, _ := args["quantity"].(float64)

		// Simplified stock check
		productStock := map[string]int{
			"p001": 15,
			"p002": 42,
			"p003": 8,
			"p004": 5,
			"p005": 30,
		}

		stock, exists := productStock[productId]
		if !exists {
			return false, fmt.Errorf("product not found")
		}

		// Check if quantity is valid
		return quantity > 0 && quantity <= float64(stock), nil
	})

	// Calculate order totals
	service.RegisterFunction("calculateOrderTotal", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
		// Extract items from form state
		items, ok := formState["items"].([]interface{})
		if !ok {
			return nil, fmt.Errorf("items not found in form state")
		}

		// Calculate subtotal
		subtotal := 0.0
		for _, item := range items {
			itemMap, ok := item.(map[string]interface{})
			if !ok {
				continue
			}

			price, _ := itemMap["price"].(float64)
			quantity, _ := itemMap["quantity"].(float64)
			subtotal += price * quantity
		}

		// Get shipping and tax from args
		shipping, _ := args["shipping"].(float64)
		taxRate, _ := args["taxRate"].(float64)

		// Calculate tax
		tax := subtotal * taxRate

		// Calculate total
		total := subtotal + shipping + tax

		// Round to 2 decimal places
		subtotal = math.Round(subtotal*100) / 100
		tax = math.Round(tax*100) / 100
		total = math.Round(total*100) / 100

		// Return order summary
		return map[string]interface{}{
			"subtotal": subtotal,
			"shipping": shipping,
			"tax":      tax,
			"total":    total,
		}, nil
	})

	// Get city options based on state
	service.RegisterFunction("getCitiesByState", func(args map[string]interface{}, formState map[string]interface{}) (interface{}, error) {
		// Extract state
		state, _ := args["state"].(string)

		// Simplified city database
		cities := map[string][]map[string]interface{}{
			"CA": {
				{"value": "la", "label": "Los Angeles"},
				{"value": "sf", "label": "San Francisco"},
				{"value": "sd", "label": "San Diego"},
				{"value": "sj", "label": "San Jose"},
			},
			"NY": {
				{"value": "nyc", "label": "New York City"},
				{"value": "buf", "label": "Buffalo"},
				{"value": "roc", "label": "Rochester"},
				{"value": "syr", "label": "Syracuse"},
			},
			"TX": {
				{"value": "hou", "label": "Houston"},
				{"value": "aus", "label": "Austin"},
				{"value": "dal", "label": "Dallas"},
				{"value": "san", "label": "San Antonio"},
			},
		}

		stateCities, exists := cities[state]
		if !exists {
			return []map[string]interface{}{}, nil
		}

		return stateCities, nil
	})
}

// registerDataTransformers registers example data transformers
func registerDataTransformers(service *smartform.DynamicFunctionService) {
	// Format currency
	service.RegisterTransformer("formatCurrency", func(data interface{}, params map[string]interface{}) (interface{}, error) {
		// Extract parameters
		currency, _ := params["currency"].(string)
		if currency == "" {
			currency = "USD"
		}

		// Format value
		value, ok := data.(float64)
		if !ok {
			return data, nil
		}

		switch currency {
		case "USD":
			return fmt.Sprintf("$%.2f", value), nil
		case "EUR":
			return fmt.Sprintf("€%.2f", value), nil
		case "GBP":
			return fmt.Sprintf("£%.2f", value), nil
		default:
			return fmt.Sprintf("%.2f %s", value, currency), nil
		}
	})

	// Filter options
	service.RegisterTransformer("filterOptions", func(data interface{}, params map[string]interface{}) (interface{}, error) {
		// Extract options
		options, ok := data.([]map[string]interface{})
		if !ok {
			return data, nil
		}

		// Extract filter criteria
		minPrice, hasMinPrice := params["minPrice"].(float64)
		maxPrice, hasMaxPrice := params["maxPrice"].(float64)
		brands, hasBrands := params["brands"].([]interface{})

		// Filter results
		results := []map[string]interface{}{}

		for _, option := range options {
			price, hasPrice := option["price"].(float64)
			brand, hasBrand := option["brand"].(string)

			// Apply price filters
			if hasMinPrice && hasPrice && price < minPrice {
				continue
			}
			if hasMaxPrice && hasPrice && price > maxPrice {
				continue
			}

			// Apply brand filter
			if hasBrands && hasBrand {
				brandMatch := false
				for _, b := range brands {
					if brandStr, ok := b.(string); ok && brandStr == brand {
						brandMatch = true
						break
					}
				}
				if !brandMatch {
					continue
				}
			}

			// Add to results
			results = append(results, option)
		}

		return results, nil
	})

	// Format date
	service.RegisterTransformer("formatDate", func(data interface{}, params map[string]interface{}) (interface{}, error) {
		// Extract parameters
		format, _ := params["format"].(string)
		if format == "" {
			format = "2006-01-02"
		}

		// Format value
		dateStr, ok := data.(string)
		if !ok {
			return data, nil
		}

		// Parse date
		date, err := time.Parse("2006-01-02", dateStr)
		if err != nil {
			return data, nil
		}

		// Format date
		return date.Format(format), nil
	})
}

// registerDynamicOrderForm registers an order form with dynamic functions
func registerDynamicOrderForm(handler *smartform.APIHandler) {
	// Create form schema using the builder pattern
	form := smartform.NewForm("dynamicOrder", "Dynamic Order Form")
	form.Description("Place an order with dynamic calculations")

	// Create validation builder
	v := smartform.NewValidationBuilder()

	// Customer Information Section
	form.SectionField("customerSection", "Customer Information")

	// Add name field
	form.TextField("name", "Full Name").Required(true)

	// Add email field
	form.EmailField("email", "Email Address").
		Required(true).
		ValidateEmail("Please enter a valid email address")

	// Add country field with dynamic city options
	form.SelectField("country", "Country").
		Required(true).
		AddOption("US", "United States").
		AddOption("CA", "Canada").
		AddOption("UK", "United Kingdom").
		AddOption("DE", "Germany")

	// Add state field with dynamic options
	form.SelectField("state", "State/Province").
		Required(true).
		VisibleWhenEquals("country", "US").
		WithDynamicOptions(
			smartform.NewOptionsBuilder().
				Dynamic().
				FromAPIWithPath("/api/data/states", "GET", "code", "name").
				// WithParameter("code", "name").
				RefreshOn("country").
				GetDynamicSource(),
		)

	// Add city field with dynamic function-based options
	form.SelectField("city", "City").
		Required(true).
		VisibleWhenEquals("country", "US").
		WithDynamicOptions(
			smartform.NewOptionsBuilder().
				Dynamic().
				WithFunctionOptions("getCitiesByState").
				WithFieldReference("state", "state").
				WithSearchSupport().
				WithPagination(10).
				End().
				RefreshOn("state").
				GetDynamicSource(),
		)

	// Order Items Section
	form.SectionField("orderSection", "Order Items")

	// Product search with dynamic function
	form.SelectField("product", "Product").
		Required(true).
		LiveSearch("searchProducts").
		WithTransformer("filterOptions").
		WithTransformerParam("minPrice", 100).
		End()

	// Quantity with dynamic validation
	form.NumberField("quantity", "Quantity").
		Required(true).
		DefaultValue(1).
		DynamicValidation("validateQuantity", "Quantity exceeds available stock").
		WithFieldReference("productId", "product").
		End()

	// Add price field with dynamic value
	form.NumberField("price", "Price").
		Required(true).
		DynamicValue("getProductPrice").
		WithFieldReference("productId", "product").
		End().
		Formatter("formatCurrency").
		WithArgument("currency", "USD").
		End()

	// Add to order button
	form.CustomField("addToOrderBtn", "").
		Required(false).
		Property("componentType", "button").
		Property("label", "Add to Order").
		Property("action", "addToOrder").
		Property("color", "primary")

	// Order items array
	itemsArray := form.ArrayField("items", "Order Items")

	// Configure array item template
	itemGroup := itemsArray.ObjectTemplate("item", "")

	itemGroup.HiddenField("productId", "").
		Required(true)

	itemGroup.TextField("productName", "Product").
		Required(true).
		Property("readOnly", true)

	itemGroup.NumberField("quantity", "Quantity").
		Required(true).
		ValidateMin(1, "Quantity must be at least 1")

	itemGroup.NumberField("price", "Price").
		Required(true).
		Property("readOnly", true)

	itemGroup.NumberField("total", "Total").
		Required(true).
		Property("readOnly", true).
		DynamicValue("calculateLineTotal").
		WithFieldReference("price", "price").
		WithFieldReference("quantity", "quantity").
		End()

	// Order Summary Section
	form.SectionField("summarySection", "Order Summary")

	// Subtotal with dynamic calculation
	form.NumberField("subtotal", "Subtotal").
		Required(false).
		Property("readOnly", true).
		DynamicValue("calculateSubtotal").
		WithArgument("items", "${items}").
		End().
		Formatter("formatCurrency").
		WithArgument("currency", "USD").
		End()

	// Shipping options
	form.RadioField("shipping", "Shipping Method").
		Required(true).
		AddOption(9.99, "Standard Shipping ($9.99)").
		AddOption(19.99, "Express Shipping ($19.99)").
		AddOption(0, "Free Shipping (Orders over $100)")

	// Tax with dynamic calculation
	form.NumberField("tax", "Tax").
		Required(false).
		Property("readOnly", true).
		DynamicValue("calculateTax").
		WithFieldReference("country", "country").
		WithFieldReference("state", "state").
		WithFieldReference("amount", "subtotal").
		End().
		Formatter("formatCurrency").
		WithArgument("currency", "USD").
		End()

	// Total with dynamic calculation
	form.NumberField("total", "Total").
		Required(false).
		Property("readOnly", true).
		DynamicValue("calculateOrderTotal").
		WithArgument("shipping", "${shipping}").
		WithArgument("taxRate", 0.08).
		End().
		Formatter("formatCurrency").
		WithArgument("currency", "USD").
		End()

	// Payment Information Section
	form.SectionField("paymentSection", "Payment Information")

	// Payment method
	form.RadioField("paymentMethod", "Payment Method").
		Required(true).
		AddOption("creditCard", "Credit Card").
		AddOption("paypal", "PayPal")

	// Credit card fields
	form.TextField("cardNumber", "Card Number").
		Required(true).
		VisibleWhenEquals("paymentMethod", "creditCard").
		ValidatePattern("^[0-9]{16}$", "Please enter a valid 16-digit card number")

	// Expiration date
	form.TextField("expiration", "Expiration Date (MM/YY)").
		Required(true).
		VisibleWhenEquals("paymentMethod", "creditCard").
		ValidatePattern("^(0[1-9]|1[0-2])\\/([0-9]{2})$", "Please enter a valid expiration date (MM/YY)")

	// CVV
	form.TextField("cvv", "CVV").
		Required(true).
		VisibleWhenEquals("paymentMethod", "creditCard").
		ValidatePattern("^[0-9]{3,4}$", "Please enter a valid CVV")

	// Accept terms
	form.CheckboxField("terms", "I accept the terms and conditions").
		Required(true).
		AddValidation(v.Custom("validateRequired", map[string]interface{}{
			"value": true,
		}, "You must accept the terms and conditions"))

	// Register schema
	handler.RegisterSchema(form.Build())
}

// registerDynamicProductCatalog registers a product catalog form with search and filtering
func registerDynamicProductCatalog(handler *smartform.APIHandler) {
	// Create form schema using the builder pattern
	form := smartform.NewForm("productCatalog", "Product Catalog")
	form.Description("Search and filter our product catalog")

	// Search Section
	form.SectionField("searchSection", "Search and Filter")

	// Search field
	form.TextField("search", "Search Products").
		Required(false).
		Placeholder("Enter product name...")

	// Category filter
	form.SelectField("category", "Category").
		Required(false).
		AddOption("", "All Categories").
		AddOption("electronics", "Electronics").
		AddOption("furniture", "Furniture").
		AddOption("clothing", "Clothing").
		AddOption("books", "Books")

	// Price range filters
	form.NumberField("minPrice", "Min Price").
		Required(false).
		ValidateMin(0, "Minimum price cannot be negative")

	form.NumberField("maxPrice", "Max Price").
		Required(false).
		ValidateMin(0, "Maximum price cannot be negative").
		DynamicValidation("validatePriceRange", "Maximum price must be greater than minimum price").
		WithFieldReference("minPrice", "minPrice").
		End()

	// Brand filter with dynamic options
	form.MultiSelectField("brands", "Brands").
		Required(false).
		WithDynamicOptions(
			smartform.NewOptionsBuilder().
				Dynamic().
				WithFunctionOptions("getBrands").
				WithFieldReference("category", "category").
				WithSearchSupport().
				End().
				RefreshOn("category").
				GetDynamicSource(),
		)

	// Add search button
	form.CustomField("searchBtn", "").
		Required(false).
		Property("componentType", "button").
		Property("label", "Search").
		Property("action", "searchProducts").
		Property("color", "primary")

	// Results Section
	form.SectionField("resultsSection", "Product Results")

	// Products array
	productsArray := form.ArrayField("products", "")
	productsArray.Property("dynamicSource", true)
	productsArray.Property("sourceFunction", "searchProducts")
	productsArray.Property("sourceParams", map[string]interface{}{
		"query":    "${search}",
		"category": "${category}",
		"minPrice": "${minPrice}",
		"maxPrice": "${maxPrice}",
		"brands":   "${brands}",
	})

	// Configure product item template
	productGroup := productsArray.ObjectTemplate("product", "")

	productGroup.HiddenField("id", "")

	productGroup.TextField("name", "Product Name").
		Property("readOnly", true)

	productGroup.TextField("brand", "Brand").
		Property("readOnly", true)

	productGroup.NumberField("price", "Price").
		Property("readOnly", true).
		Formatter("formatCurrency").
		WithArgument("currency", "USD").
		End()

	productGroup.NumberField("stock", "In Stock").
		Property("readOnly", true)

	productGroup.CustomField("addToCartBtn", "").
		Property("componentType", "button").
		Property("label", "Add to Cart").
		Property("action", "addToCart").
		Property("color", "primary").
		Property("size", "small")

	// Pagination controls
	form.NumberField("page", "Page").
		Required(false).
		DefaultValue(1).
		Property("controlType", "pagination").
		Property("totalPages", "${totalPages}")

	// Register schema
	handler.RegisterSchema(form.Build())
}

// registerDataProcessingForm registers a data processing form with file upload and dynamic processing
func registerDataProcessingForm(handler *smartform.APIHandler) {
	// Create form schema using the builder pattern
	form := smartform.NewForm("dataProcessing", "Data Processing Tool")
	form.Description("Upload and process data files with custom transformations")

	// Data Source Section
	form.SectionField("dataSourceSection", "Data Source")

	// Data source type
	form.RadioField("dataSourceType", "Data Source Type").
		Required(true).
		AddOption("file", "File Upload").
		AddOption("api", "API Connection").
		AddOption("database", "Database Connection")

	// File upload field
	form.FileField("dataFile", "Data File").
		Required(true).
		VisibleWhenEquals("dataSourceType", "file").
		AddValidation(smartform.NewValidationBuilder().FileType(
			[]string{"csv", "json", "xlsx", "xls"},
			"Please upload a CSV, JSON, or Excel file",
		))

	// API connection fields
	apiGroup := form.GroupField("apiConnection", "API Connection")
	apiGroup.VisibleWhenEquals("dataSourceType", "api")

	apiGroup.TextField("apiUrl", "API URL").
		Required(true).
		Placeholder("https://api.example.com/data")

	apiGroup.SelectField("apiMethod", "Method").
		Required(true).
		AddOption("GET", "GET").
		AddOption("POST", "POST").
		AddOption("PUT", "PUT")

	apiGroup.TextField("apiKey", "API Key").
		Required(false)

	apiGroup.TextareaField("apiHeaders", "Headers").
		Required(false).
		Placeholder("Content-Type: application/json\nAccept: application/json")

	apiGroup.TextareaField("apiBody", "Request Body").
		Required(false).
		VisibleWhenNotEquals("apiMethod", "GET")

	// Database connection fields
	dbGroup := form.GroupField("dbConnection", "Database Connection")
	dbGroup.VisibleWhenEquals("dataSourceType", "database")

	dbGroup.TextField("dbHost", "Host").
		Required(true)

	dbGroup.NumberField("dbPort", "Port").
		Required(true)

	dbGroup.TextField("dbName", "Database Name").
		Required(true)

	dbGroup.TextField("dbUser", "Username").
		Required(true)

	dbGroup.PasswordField("dbPassword", "Password").
		Required(true)

	dbGroup.SelectField("dbType", "Database Type").
		Required(true).
		AddOption("mysql", "MySQL").
		AddOption("postgres", "PostgreSQL").
		AddOption("sqlserver", "SQL Server").
		AddOption("mongodb", "MongoDB")

	dbGroup.TextareaField("dbQuery", "Query").
		Required(true).
		VisibleWhenNotEquals("dbType", "mongodb")

	dbGroup.TextareaField("dbAggregation", "Aggregation Pipeline").
		Required(true).
		VisibleWhenEquals("dbType", "mongodb")

	// Data Preview Section
	form.SectionField("dataPreviewSection", "Data Preview")

	// Data preview with dynamic function
	form.CustomField("dataPreview", "Data Preview").
		Required(false).
		Property("componentType", "dataGrid").
		DataSource("previewData").
		WithFieldReference("dataSourceType", "dataSourceType").
		WithFieldReference("dataFile", "dataFile").
		WithFieldReference("apiConnection", "apiConnection").
		WithFieldReference("dbConnection", "dbConnection").
		End()

	// Data Processing Section
	form.SectionField("dataProcessingSection", "Data Processing")

	// Select columns
	form.MultiSelectField("columns", "Select Columns").
		Required(false).
		WithDynamicOptions(
			smartform.NewOptionsBuilder().
				Dynamic().
				WithFunctionOptions("getDataColumns").
				WithFieldReference("dataSourceType", "dataSourceType").
				WithFieldReference("dataFile", "dataFile").
				WithFieldReference("apiConnection", "apiConnection").
				WithFieldReference("dbConnection", "dbConnection").
				End().
				RefreshOn("dataSourceType", "dataFile", "apiConnection", "dbConnection").
				GetDynamicSource(),
		)

	// Add filtering
	filterArray := form.ArrayField("filters", "Filters")

	// Configure filter item template
	filterGroup := filterArray.ObjectTemplate("filter", "")

	filterGroup.SelectField("column", "Column").
		Required(true).
		WithDynamicOptions(
			smartform.NewOptionsBuilder().
				Dynamic().
				WithFunctionOptions("getDataColumns").
				WithFieldReference("dataSourceType", "dataSourceType").
				WithFieldReference("dataFile", "dataFile").
				WithFieldReference("apiConnection", "apiConnection").
				WithFieldReference("dbConnection", "dbConnection").
				End().
				GetDynamicSource(),
		)

	filterGroup.SelectField("operator", "Operator").
		Required(true).
		AddOption("equals", "Equals").
		AddOption("notEquals", "Not Equals").
		AddOption("contains", "Contains").
		AddOption("greaterThan", "Greater Than").
		AddOption("lessThan", "Less Than").
		AddOption("between", "Between")

	filterGroup.TextField("value", "Value").
		Required(true).
		VisibleWhenNotEquals("operator", "between")

	filterGroup.TextField("minValue", "Minimum Value").
		Required(true).
		VisibleWhenEquals("operator", "between")

	filterGroup.TextField("maxValue", "Maximum Value").
		Required(true).
		VisibleWhenEquals("operator", "between")

	// Add transformations
	transformArray := form.ArrayField("transformations", "Transformations")

	// Configure transformation item template
	transformGroup := transformArray.ObjectTemplate("transformation", "")

	transformGroup.SelectField("type", "Transformation Type").
		Required(true).
		AddOption("sort", "Sort Data").
		AddOption("aggregate", "Aggregate").
		AddOption("calculate", "Calculate Field").
		AddOption("format", "Format Field").
		AddOption("filter", "Filter Rows")

	transformGroup.SelectField("column", "Column").
		Required(true).
		VisibleWhenAnyMatch(
			smartform.When("type").Equals("sort").Build(),
			smartform.When("type").Equals("format").Build(),
		).
		WithDynamicOptions(
			smartform.NewOptionsBuilder().
				Dynamic().
				WithFunctionOptions("getDataColumns").
				WithFieldReference("dataSourceType", "dataSourceType").
				WithFieldReference("dataFile", "dataFile").
				WithFieldReference("apiConnection", "apiConnection").
				WithFieldReference("dbConnection", "dbConnection").
				End().
				GetDynamicSource(),
		)

	transformGroup.SelectField("sortDirection", "Sort Direction").
		Required(true).
		VisibleWhenEquals("type", "sort").
		AddOption("asc", "Ascending").
		AddOption("desc", "Descending")

	transformGroup.SelectField("aggregateFunction", "Aggregate Function").
		Required(true).
		VisibleWhenEquals("type", "aggregate").
		AddOption("sum", "Sum").
		AddOption("avg", "Average").
		AddOption("min", "Minimum").
		AddOption("max", "Maximum").
		AddOption("count", "Count")

	transformGroup.SelectField("aggregateColumn", "Aggregate Column").
		Required(true).
		VisibleWhenEquals("type", "aggregate").
		WithDynamicOptions(
			smartform.NewOptionsBuilder().
				Dynamic().
				WithFunctionOptions("getDataColumns").
				WithFieldReference("dataSourceType", "dataSourceType").
				WithFieldReference("dataFile", "dataFile").
				WithFieldReference("apiConnection", "apiConnection").
				WithFieldReference("dbConnection", "dbConnection").
				End().
				GetDynamicSource(),
		)

	transformGroup.SelectField("groupByColumn", "Group By").
		Required(false).
		VisibleWhenEquals("type", "aggregate").
		WithDynamicOptions(
			smartform.NewOptionsBuilder().
				Dynamic().
				WithFunctionOptions("getDataColumns").
				WithFieldReference("dataSourceType", "dataSourceType").
				WithFieldReference("dataFile", "dataFile").
				WithFieldReference("apiConnection", "apiConnection").
				WithFieldReference("dbConnection", "dbConnection").
				End().
				GetDynamicSource(),
		)

	transformGroup.TextField("newColumnName", "New Column Name").
		Required(true).
		VisibleWhenEquals("type", "calculate")

	transformGroup.TextareaField("formula", "Formula").
		Required(true).
		VisibleWhenEquals("type", "calculate").
		Placeholder("e.g., column1 * column2")

	transformGroup.SelectField("formatType", "Format Type").
		Required(true).
		VisibleWhenEquals("type", "format").
		AddOption("date", "Date Format").
		AddOption("number", "Number Format").
		AddOption("text", "Text Transformation")

	transformGroup.TextField("formatPattern", "Format Pattern").
		Required(true).
		VisibleWhenEquals("type", "format").
		Placeholder("e.g., MM/dd/yyyy for dates, #,##0.00 for numbers")

	// Output Settings Section
	form.SectionField("outputSection", "Output Settings")

	// Output format
	form.SelectField("outputFormat", "Output Format").
		Required(true).
		AddOption("csv", "CSV").
		AddOption("json", "JSON").
		AddOption("xlsx", "Excel").
		AddOption("html", "HTML Table")

	// Include headers
	form.CheckboxField("includeHeaders", "Include Headers").
		Required(false).
		DefaultValue(true).
		VisibleWhenEquals("outputFormat", "csv")

	// File name
	form.TextField("outputFileName", "File Name").
		Required(true).
		Placeholder("output_data")

	// Process data button
	form.CustomField("processBtn", "").
		Required(false).
		Property("componentType", "button").
		Property("label", "Process Data").
		Property("action", "processData").
		Property("color", "primary")

	// Results Preview
	form.CustomField("resultsPreview", "Results Preview").
		Required(false).
		Property("componentType", "dataGrid").
		DataSource("processedData").
		WithFieldReference("dataSourceType", "dataSourceType").
		WithFieldReference("dataFile", "dataFile").
		WithFieldReference("apiConnection", "apiConnection").
		WithFieldReference("dbConnection", "dbConnection").
		WithFieldReference("columns", "columns").
		WithFieldReference("filters", "filters").
		WithFieldReference("transformations", "transformations").
		End()

	// Download button
	form.CustomField("downloadBtn", "").
		Required(false).
		VisibleWhenExists("resultsPreview").
		Property("componentType", "button").
		Property("label", "Download Results").
		Property("action", "downloadResults").
		Property("color", "success")

	// Register schema
	handler.RegisterSchema(form.Build())
}
