package template

import (
	"errors"
	"fmt"
	"math"
	"reflect"
	"strconv" // Ensure strconv is imported
	"strings"
	"time"
)

// RegisterStandardFunctions registers all standard functions with the registry
func (vr *VariableRegistry) RegisterStandardFunctions() {
	// Existing functions
	vr.RegisterFunction("if", funcIf)
	vr.RegisterFunction("eq", funcEquals)
	vr.RegisterFunction("ne", funcNotEquals)
	vr.RegisterFunction("gt", funcGreaterThan)
	vr.RegisterFunction("lt", funcLessThan)
	vr.RegisterFunction("format", funcFormat)

	// Math functions
	vr.RegisterFunction("add", funcAdd)
	vr.RegisterFunction("subtract", funcSubtract)
	vr.RegisterFunction("multiply", funcMultiply)
	vr.RegisterFunction("divide", funcDivide)
	vr.RegisterFunction("mod", funcModulo)
	vr.RegisterFunction("round", funcRound)

	// String functions
	vr.RegisterFunction("concat", funcConcat)
	vr.RegisterFunction("length", funcLength)
	vr.RegisterFunction("substring", funcSubstring)
	vr.RegisterFunction("toLower", funcToLower)
	vr.RegisterFunction("toUpper", funcToUpper)
	vr.RegisterFunction("trim", funcTrim)

	// Array functions
	vr.RegisterFunction("join", funcJoin)
	vr.RegisterFunction("first", funcFirst)
	vr.RegisterFunction("last", funcLast)
	vr.RegisterFunction("count", funcCount)

	// Type conversion
	vr.RegisterFunction("toString", funcToString)
	vr.RegisterFunction("toNumber", funcToNumber) // Ensure this uses the updated toNumber
	vr.RegisterFunction("toBool", funcToBool)

	// Null handling
	vr.RegisterFunction("default", funcDefault)
	vr.RegisterFunction("coalesce", funcCoalesce)

	// Date functions
	vr.RegisterFunction("now", funcNow)
	vr.RegisterFunction("formatDate", funcFormatDate)
	vr.RegisterFunction("addDays", funcAddDays)

	// Logical operators
	vr.RegisterFunction("and", funcAnd)
	vr.RegisterFunction("or", funcOr)
	vr.RegisterFunction("gte", funcGreaterThanOrEqual)
	vr.RegisterFunction("lte", funcLessThanOrEqual)
}

func funcAdd(args []interface{}) (interface{}, error) {
	if len(args) < 2 {
		return nil, errors.New("add requires at least 2 arguments")
	}

	// Convert arguments to numbers
	result := 0.0
	for _, arg := range args {
		num, err := toNumber(arg) // Uses the updated toNumber
		if err != nil {
			return nil, err
		}
		result += num
	}

	return result, nil
}

func funcSubtract(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("subtract requires exactly 2 arguments")
	}

	a, err := toNumber(args[0]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	b, err := toNumber(args[1]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	return a - b, nil
}

func funcMultiply(args []interface{}) (interface{}, error) {
	if len(args) < 2 {
		return nil, errors.New("multiply requires at least 2 arguments")
	}

	result := 1.0
	for _, arg := range args {
		num, err := toNumber(arg) // Uses the updated toNumber
		if err != nil {
			return nil, err
		}
		result *= num
	}

	return result, nil
}

func funcDivide(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("divide requires exactly 2 arguments")
	}

	a, err := toNumber(args[0]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	b, err := toNumber(args[1]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	if b == 0 {
		return nil, errors.New("division by zero")
	}

	return a / b, nil
}

func funcModulo(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("mod requires exactly 2 arguments")
	}

	a, err := toNumber(args[0]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	b, err := toNumber(args[1]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	if b == 0 {
		return nil, errors.New("modulo by zero")
	}

	return math.Mod(a, b), nil
}

func funcRound(args []interface{}) (interface{}, error) {
	if len(args) < 1 || len(args) > 2 {
		return nil, errors.New("round requires 1 or 2 arguments")
	}

	num, err := toNumber(args[0]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	decimals := 0
	if len(args) == 2 {
		d, err := toNumber(args[1]) // Uses the updated toNumber
		if err != nil {
			return nil, err
		}
		decimals = int(d)
	}

	shift := math.Pow(10, float64(decimals))
	return math.Round(num*shift) / shift, nil
}

func funcConcat(args []interface{}) (interface{}, error) {
	if len(args) < 1 {
		return "", nil
	}

	var sb strings.Builder
	for _, arg := range args {
		sb.WriteString(fmt.Sprintf("%v", arg))
	}

	return sb.String(), nil
}

func funcLength(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("length requires exactly 1 argument")
	}

	switch v := args[0].(type) {
	case string:
		return len(v), nil
	case []interface{}:
		return len(v), nil
	case map[string]interface{}:
		return len(v), nil
	default:
		return nil, errors.New("cannot get length of this type")
	}
}

func funcSubstring(args []interface{}) (interface{}, error) {
	if len(args) < 2 || len(args) > 3 {
		return nil, errors.New("substring requires 2 or 3 arguments")
	}

	str, ok := args[0].(string)
	if !ok {
		str = fmt.Sprintf("%v", args[0])
	}

	start, err := toNumber(args[1]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	startIndex := int(start)
	if startIndex < 0 {
		startIndex = 0
	}

	if len(args) == 2 {
		// Only start index provided
		if startIndex >= len(str) {
			return "", nil
		}
		return str[startIndex:], nil
	}

	// Both start and end provided
	end, err := toNumber(args[2]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	endIndex := int(end)
	if endIndex > len(str) {
		endIndex = len(str)
	}

	if startIndex >= endIndex {
		return "", nil
	}

	return str[startIndex:endIndex], nil
}

func funcToLower(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("toLower requires exactly 1 argument")
	}

	str, ok := args[0].(string)
	if !ok {
		str = fmt.Sprintf("%v", args[0])
	}

	return strings.ToLower(str), nil
}

func funcToUpper(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("toUpper requires exactly 1 argument")
	}

	str, ok := args[0].(string)
	if !ok {
		str = fmt.Sprintf("%v", args[0])
	}

	return strings.ToUpper(str), nil
}

func funcTrim(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("trim requires exactly 1 argument")
	}

	str, ok := args[0].(string)
	if !ok {
		str = fmt.Sprintf("%v", args[0])
	}

	return strings.TrimSpace(str), nil
}

func funcJoin(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("join requires exactly 2 arguments")
	}

	array, ok := args[0].([]interface{})
	if !ok {
		return nil, errors.New("first argument must be an array")
	}

	separator, ok := args[1].(string)
	if !ok {
		separator = fmt.Sprintf("%v", args[1])
	}

	strArray := make([]string, len(array))
	for i, item := range array {
		strArray[i] = fmt.Sprintf("%v", item)
	}

	return strings.Join(strArray, separator), nil
}

func funcFirst(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("first requires exactly 1 argument")
	}

	array, ok := args[0].([]interface{})
	if !ok {
		return nil, errors.New("argument must be an array")
	}

	if len(array) == 0 {
		return nil, nil
	}

	return array[0], nil
}

func funcLast(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("last requires exactly 1 argument")
	}

	array, ok := args[0].([]interface{})
	if !ok {
		return nil, errors.New("argument must be an array")
	}

	if len(array) == 0 {
		return nil, nil
	}

	return array[len(array)-1], nil
}

func funcCount(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("count requires exactly 1 argument")
	}

	array, ok := args[0].([]interface{})
	if !ok {
		return nil, errors.New("argument must be an array")
	}

	return len(array), nil
}

func funcToString(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("toString requires exactly 1 argument")
	}

	return fmt.Sprintf("%v", args[0]), nil
}

func funcToNumber(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("toNumber requires exactly 1 argument")
	}

	num, err := toNumber(args[0]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	return num, nil
}

func funcToBool(args []interface{}) (interface{}, error) {
	if len(args) != 1 {
		return nil, errors.New("toBool requires exactly 1 argument")
	}

	switch v := args[0].(type) {
	case bool:
		return v, nil
	case int:
		return v != 0, nil
	case float64:
		return v != 0, nil
	case string:
		lower := strings.ToLower(v)
		return lower == "true" || lower == "yes" || lower == "1", nil
	default:
		return false, nil
	}
}

func funcDefault(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("default requires exactly 2 arguments")
	}

	if args[0] == nil {
		return args[1], nil
	}

	// Check for empty string
	if str, ok := args[0].(string); ok && str == "" {
		return args[1], nil
	}

	return args[0], nil
}

func funcCoalesce(args []interface{}) (interface{}, error) {
	if len(args) < 1 {
		return nil, errors.New("coalesce requires at least 1 argument")
	}

	for _, arg := range args {
		if arg != nil {
			// For strings, check if it's empty
			if str, ok := arg.(string); ok && str == "" {
				continue
			}
			return arg, nil
		}
	}

	// If all values are nil/empty, return the last one
	return args[len(args)-1], nil
}

func funcNow(args []interface{}) (interface{}, error) {
	return time.Now(), nil
}

func funcFormatDate(args []interface{}) (interface{}, error) {
	if len(args) < 1 || len(args) > 2 {
		return nil, errors.New("formatDate requires 1 or 2 arguments")
	}

	var t time.Time
	var format string

	// Handle the date argument
	switch v := args[0].(type) {
	case time.Time:
		t = v
	case string:
		var err error
		// Try some common formats
		formats := []string{time.RFC3339, time.RFC1123, "2006-01-02", "2006-01-02 15:04:05"}
		for _, f := range formats {
			t, err = time.Parse(f, v)
			if err == nil {
				break
			}
		}
		if err != nil {
			return nil, errors.New("invalid date format")
		}
	default:
		return nil, errors.New("first argument must be a date")
	}

	// Handle the format argument
	if len(args) == 2 {
		var ok bool
		format, ok = args[1].(string)
		if !ok {
			return nil, errors.New("format must be a string")
		}
	} else {
		// Default format
		format = "2006-01-02"
	}

	return t.Format(format), nil
}

func funcAddDays(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("addDays requires exactly 2 arguments")
	}

	var t time.Time

	// Handle the date argument
	switch v := args[0].(type) {
	case time.Time:
		t = v
	case string:
		var err error
		// Try some common formats
		formats := []string{time.RFC3339, time.RFC1123, "2006-01-02", "2006-01-02 15:04:05"}
		for _, f := range formats {
			t, err = time.Parse(f, v)
			if err == nil {
				break
			}
		}
		if err != nil {
			return nil, errors.New("invalid date format")
		}
	default:
		return nil, errors.New("first argument must be a date")
	}

	// Handle the days argument
	days, err := toNumber(args[1]) // Uses the updated toNumber
	if err != nil {
		return nil, err
	}

	// Add days
	return t.AddDate(0, 0, int(days)), nil
}

func funcAnd(args []interface{}) (interface{}, error) {
	if len(args) < 1 {
		return true, nil // Empty AND is true
	}

	for _, arg := range args {
		// Convert arg to boolean
		var boolVal bool

		switch v := arg.(type) {
		case bool:
			boolVal = v
		case int:
			boolVal = v != 0
		case float64:
			boolVal = v != 0
		case string:
			boolVal = v != ""
		case nil:
			boolVal = false
		default:
			boolVal = true // Non-nil, non-empty values are truthy
		}

		if !boolVal {
			return false, nil // Short-circuit
		}
	}

	return true, nil
}

func funcOr(args []interface{}) (interface{}, error) {
	if len(args) < 1 {
		return false, nil // Empty OR is false
	}

	for _, arg := range args {
		// Convert arg to boolean
		var boolVal bool

		switch v := arg.(type) {
		case bool:
			boolVal = v
		case int:
			boolVal = v != 0
		case float64:
			boolVal = v != 0
		case string:
			boolVal = v != ""
		case nil:
			boolVal = false
		default:
			boolVal = true // Non-nil, non-empty values are truthy
		}

		if boolVal {
			return true, nil // Short-circuit
		}
	}

	return false, nil
}

// Helper function to convert various types to float64
func toNumber(value interface{}) (float64, error) {
	switch v := value.(type) {
	case int:
		return float64(v), nil
	case int32:
		return float64(v), nil
	case int64:
		return float64(v), nil
	case float32:
		return float64(v), nil
	case float64:
		return v, nil
	case string:
		// Attempt to parse the string to a float64
		f, err := strconv.ParseFloat(v, 64)
		if err == nil {
			return f, nil
		}
		// If string parsing fails, it's an error.
		return 0, fmt.Errorf("string value '%s' is not numeric and cannot be converted to a number", v)
	default:
		// For any other types that are not directly handled and not string,
		// try reflection to see if they are fundamentally numeric kinds.
		rv := reflect.ValueOf(value)
		switch rv.Kind() {
		case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
			return float64(rv.Int()), nil
		case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
			return float64(rv.Uint()), nil
		case reflect.Float32, reflect.Float64:
			return rv.Float(), nil
		default:
			return 0, fmt.Errorf("value %v (type %T) is not numeric and cannot be converted to a number", value, value)
		}
	}
}

// toNumberReflect is no longer needed as its logic is merged into toNumber.
// You can remove it or comment it out if it's defined elsewhere in your functions.go.
/*
func toNumberReflect(v interface{}) (float64, error) {
	rv := reflect.ValueOf(v)
	switch rv.Kind() {
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		return float64(rv.Int()), nil
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		return float64(rv.Uint()), nil
	case reflect.Float32, reflect.Float64:
		return rv.Float(), nil
	default:
		return 0, fmt.Errorf("value %v (type %T) is not numeric", v, v)
	}
}
*/

func funcIf(args []interface{}) (interface{}, error) {
	if len(args) != 3 {
		return nil, errors.New("if function requires 3 arguments: condition, trueValue, falseValue")
	}

	condition, ok := args[0].(bool)
	if !ok {
		if args[0] == nil {
			condition = false
		} else {
			// Try to convert to bool
			switch v := args[0].(type) {
			case int:
				condition = v != 0
			case float64:
				condition = v != 0
			case string:
				condition = v != ""
			default:
				return nil, errors.New("condition must be a boolean")
			}
		}
	}

	if condition {
		return args[1], nil
	}

	return args[2], nil
}

func funcEquals(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("eq function requires 2 arguments")
	}

	// Handle numeric comparison for mixed types (int/float)
	if isNumber(args[0]) && isNumber(args[1]) {
		num1, err := toNumber(args[0]) // Uses the updated toNumber
		if err != nil {
			return nil, err
		}
		num2, err := toNumber(args[1]) // Uses the updated toNumber
		if err != nil {
			return nil, err
		}
		return num1 == num2, nil
	}

	// Default comparison
	return args[0] == args[1], nil
}

func funcNotEquals(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("ne function requires 2 arguments")
	}

	// Handle numeric comparison for mixed types (int/float)
	// This makes `ne` consistent with `eq` for numbers
	if isNumber(args[0]) && isNumber(args[1]) {
		num1, err := toNumber(args[0])
		if err != nil {
			// If conversion fails for one, they are likely not equal in a numeric sense
			// but this could be debated. Fallback to general inequality.
			return args[0] != args[1], nil
		}
		num2, err := toNumber(args[1])
		if err != nil {
			return args[0] != args[1], nil
		}
		return num1 != num2, nil
	}

	return args[0] != args[1], nil
}

func funcGreaterThan(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("gt function requires exactly 2 arguments")
	}

	n1, err1 := toNumber(args[0])
	n2, err2 := toNumber(args[1])

	if err1 == nil && err2 == nil {
		return n1 > n2, nil
	}

	// 2) Fallback string comparison if both are strings and numeric conversion failed for at least one
	//    (or if they were strings to begin with and numeric conversion was not applicable/desired by type system)
	if s1, ok1 := args[0].(string); ok1 {
		if s2, ok2 := args[1].(string); ok2 {
			return s1 > s2, nil
		}
	}

	// 3) No valid comparison found
	return nil, fmt.Errorf("incomparable types for gt: %T and %T (after attempting numeric conversion)", args[0], args[1])
}

func funcLessThan(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("lt function requires 2 arguments")
	}

	// 1) Numeric comparison: convert both to float64
	n1, err1 := toNumber(args[0]) // Uses the updated toNumber
	n2, err2 := toNumber(args[1]) // Uses the updated toNumber

	if err1 == nil && err2 == nil {
		return n1 < n2, nil
	}

	// 2) Fallback string comparison
	if s1, ok1 := args[0].(string); ok1 {
		if s2, ok2 := args[1].(string); ok2 {
			return s1 < s2, nil
		}
	}
	return nil, fmt.Errorf("incomparable types for lt: %T and %T (after attempting numeric conversion)", args[0], args[1])
}

func funcFormat(args []interface{}) (interface{}, error) {
	if len(args) < 1 {
		return nil, errors.New("format function requires at least 1 argument")
	}

	format, ok := args[0].(string)
	if !ok {
		return nil, errors.New("first argument to format function must be a string")
	}

	// Convert arguments to appropriate types for formatting
	formattedArgs := make([]interface{}, len(args)-1)
	for i, arg := range args[1:] {
		// Handle common type conversions
		switch v := arg.(type) {
		case float64:
			// If format contains %d, convert float to int
			if strings.Contains(format, "%d") {
				formattedArgs[i] = int(v)
			} else {
				formattedArgs[i] = v
			}
		default:
			formattedArgs[i] = v
		}
	}

	return fmt.Sprintf(format, formattedArgs...), nil
}

// And implement these functions
func funcGreaterThanOrEqual(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("gte function requires 2 arguments")
	}

	n1, err1 := toNumber(args[0]) // Uses the updated toNumber
	n2, err2 := toNumber(args[1]) // Uses the updated toNumber

	if err1 == nil && err2 == nil {
		return n1 >= n2, nil
	}
	if s1, ok1 := args[0].(string); ok1 {
		if s2, ok2 := args[1].(string); ok2 {
			return s1 >= s2, nil
		}
	}
	return nil, fmt.Errorf("incomparable types for gte: %T and %T (after attempting numeric conversion)", args[0], args[1])
}

func funcLessThanOrEqual(args []interface{}) (interface{}, error) {
	if len(args) != 2 {
		return nil, errors.New("lte function requires 2 arguments")
	}

	// Try to convert both to numbers
	n1, err1 := toNumber(args[0]) // Uses the updated toNumber
	n2, err2 := toNumber(args[1]) // Uses the updated toNumber

	if err1 == nil && err2 == nil {
		return n1 <= n2, nil
	}

	// Compare based on type
	if s1, ok1 := args[0].(string); ok1 {
		if s2, ok2 := args[1].(string); ok2 {
			return s1 <= s2, nil
		}
	}

	return nil, fmt.Errorf("incomparable types for lte: %T and %T (after attempting numeric conversion)", args[0], args[1])
}
