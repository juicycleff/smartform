package template

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetValueByPath(t *testing.T) {
	// Create a complex nested data structure
	data := map[string]interface{}{
		"user": map[string]interface{}{
			"name":   "John",
			"scores": []interface{}{85, 92, 78},
			"addresses": []interface{}{
				map[string]interface{}{
					"type":    "home",
					"street":  "123 Main St",
					"city":    "Anytown",
					"zipCode": "12345",
				},
				map[string]interface{}{
					"type":    "work",
					"street":  "456 Business Ave",
					"city":    "Commerce City",
					"zipCode": "67890",
				},
			},
			"contacts": map[string]interface{}{
				"email": "john@example.com",
				"phone": map[string]interface{}{
					"home": "555-1234",
					"work": "555-5678",
				},
			},
		},
		"settings": map[string]interface{}{
			"theme":         "dark",
			"notifications": true,
		},
	}

	tests := []struct {
		name     string
		path     string
		expected interface{}
	}{
		{
			name:     "Simple field access",
			path:     "user.name",
			expected: "John",
		},
		{
			name:     "Array access",
			path:     "user.scores[0]",
			expected: float64(85), // JSON numbers are parsed as float64
		},
		{
			name:     "Array access with nested object",
			path:     "user.addresses[0].street",
			expected: "123 Main St",
		},
		{
			name:     "Last array element",
			path:     "user.addresses[1].city",
			expected: "Commerce City",
		},
		{
			name:     "Nested map access",
			path:     "user.contacts.phone.work",
			expected: "555-5678",
		},
		{
			name:     "Root level field",
			path:     "settings.theme",
			expected: "dark",
		},
		{
			name:     "Nonexistent field",
			path:     "user.age",
			expected: nil,
		},
		{
			name:     "Nonexistent nested field",
			path:     "user.contacts.fax",
			expected: nil,
		},
		{
			name:     "Invalid array index",
			path:     "user.scores[10]",
			expected: nil,
		},
		{
			name:     "Array access on non-array",
			path:     "user.name[0]",
			expected: nil,
		},
		{
			name:     "Empty path",
			path:     "",
			expected: nil,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			result := getValueByPath(data, test.path)
			assert.Equal(t, test.expected, result)
		})
	}
}
