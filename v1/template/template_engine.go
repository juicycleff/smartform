package template

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"sync"
)

// TemplateEngine handles parsing and evaluating template expressions
type TemplateEngine struct {
	variableRegistry *VariableRegistry
	expressionCache  map[string]*TemplateExpression
	cacheMutex       sync.RWMutex
}

// NewTemplateEngine creates a new template engine
func NewTemplateEngine() *TemplateEngine {
	return &TemplateEngine{
		variableRegistry: NewVariableRegistry(),
		expressionCache:  make(map[string]*TemplateExpression),
	}
}

// VariableRegistry manages variables and functions for templating
type VariableRegistry struct {
	variables map[string]interface{}
	functions map[string]TemplateFunction
	mutex     sync.RWMutex
}

// NewVariableRegistry creates a new variable registry with standard functions
func NewVariableRegistry() *VariableRegistry {
	registry := &VariableRegistry{
		variables: make(map[string]interface{}),
		functions: make(map[string]TemplateFunction),
	}

	// Register standard functions
	registry.RegisterStandardFunctions()

	return registry
}

// RegisterVariable registers a variable in the registry
func (vr *VariableRegistry) RegisterVariable(name string, value interface{}) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()
	vr.variables[name] = value
}

// GetVariable retrieves a variable from the registry using dot notation
func (vr *VariableRegistry) GetVariable(path string) (interface{}, bool) {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()

	parts := strings.Split(path, ".")
	if len(parts) == 0 {
		return nil, false
	}

	var current interface{}
	var ok bool

	// Get the root object
	if current, ok = vr.variables[parts[0]]; !ok {
		return nil, false
	}

	// Navigate through the parts
	for i := 1; i < len(parts); i++ {
		switch v := current.(type) {
		case map[string]interface{}:
			if current, ok = v[parts[i]]; !ok {
				return nil, false
			}
		default:
			return nil, false
		}
	}

	return current, true
}

// TemplateFunction represents a function that can be called in templates
type TemplateFunction func(args []interface{}) (interface{}, error)

// RegisterFunction registers a function in the registry
func (vr *VariableRegistry) RegisterFunction(name string, fn TemplateFunction) {
	vr.mutex.Lock()
	defer vr.mutex.Unlock()
	vr.functions[name] = fn
}

// GetFunction retrieves a function from the registry
func (vr *VariableRegistry) GetFunction(name string) (TemplateFunction, bool) {
	vr.mutex.RLock()
	defer vr.mutex.RUnlock()
	fn, ok := vr.functions[name]
	return fn, ok
}

// TemplateExpression represents a parsed template expression
type TemplateExpression struct {
	Raw   string
	Parts []TemplatePart
}

// SetVariableRegistry parses a template expression
func (te *TemplateEngine) SetVariableRegistry(reg *VariableRegistry) {
	te.variableRegistry = reg
}

// GetVariableRegistry parses a template expression
func (te *TemplateEngine) GetVariableRegistry() *VariableRegistry {
	return te.variableRegistry
}

// ParseTemplateExpression parses a template expression
func (te *TemplateEngine) ParseTemplateExpression(expression string) (*TemplateExpression, error) {
	// Check cache first
	te.cacheMutex.RLock()
	if expr, ok := te.expressionCache[expression]; ok {
		te.cacheMutex.RUnlock()
		return expr, nil
	}
	te.cacheMutex.RUnlock()

	// Parse the expression
	expr := &TemplateExpression{
		Raw: expression,
	}

	// Simple regex for ${...} expressions
	re := regexp.MustCompile(`\${([^}]+)}`)
	matches := re.FindAllStringSubmatchIndex(expression, -1)

	if len(matches) == 0 {
		// No template expressions, just return the text
		expr.Parts = []TemplatePart{&TextPart{Text: expression}}
	} else {
		lastEnd := 0
		for _, match := range matches {
			// Add text before the match
			if match[0] > lastEnd {
				expr.Parts = append(expr.Parts, &TextPart{Text: expression[lastEnd:match[0]]})
			}

			// Parse the expression inside ${}
			exprText := expression[match[2]:match[3]]
			part, err := te.parseExpressionPart(exprText)
			if err != nil {
				return nil, err
			}
			expr.Parts = append(expr.Parts, part)

			lastEnd = match[1]
		}

		// Add any trailing text
		if lastEnd < len(expression) {
			expr.Parts = append(expr.Parts, &TextPart{Text: expression[lastEnd:]})
		}
	}

	// Cache the result
	te.cacheMutex.Lock()
	te.expressionCache[expression] = expr
	te.cacheMutex.Unlock()

	return expr, nil
}

// EvaluateExpression evaluates a template expression
func (te *TemplateEngine) EvaluateExpression(expression string, context map[string]interface{}) (interface{}, error) {
	expr, err := te.ParseTemplateExpression(expression)
	if err != nil {
		return nil, err
	}

	if len(expr.Parts) == 1 {
		// Simple expression
		return expr.Parts[0].Evaluate(te.variableRegistry, context)
	}

	// Compound expression, concatenate parts
	var result strings.Builder
	for _, part := range expr.Parts {
		value, err := part.Evaluate(te.variableRegistry, context)
		if err != nil {
			return nil, err
		}
		result.WriteString(fmt.Sprintf("%v", value))
	}

	return result.String(), nil
}

// EvaluateExpressionAsString evaluates a template expression and returns it as a string
func (te *TemplateEngine) EvaluateExpressionAsString(expression string, context map[string]interface{}) (string, error) {
	result, err := te.EvaluateExpression(expression, context)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%v", result), nil
}

// GetExpressionSuggestions returns variable and function suggestions relevant to a partial expression
func (te *TemplateEngine) GetExpressionSuggestions(partialExpr string) []*VariableSuggestion {
	// Get all suggestions
	allSuggestions := te.variableRegistry.GenerateVariableSuggestions()

	// If the expression is empty, return everything
	if partialExpr == "" {
		return allSuggestions
	}

	// If the expression starts with ${, remove it
	if strings.HasPrefix(partialExpr, "${") {
		partialExpr = partialExpr[2:]
	}

	// Handle function parameters context
	if strings.Contains(partialExpr, "(") {
		parenIndex := strings.LastIndex(partialExpr, "(")
		lastCommaIndex := strings.LastIndex(partialExpr, ",")

		// If we're inside function parameters and after a comma, filter based on the parameter context
		if lastCommaIndex > parenIndex {
			// We're typing a parameter, return all variables
			paramPrefix := strings.TrimSpace(partialExpr[lastCommaIndex+1:])
			return filterSuggestionsByPrefix(allSuggestions, paramPrefix)
		}

		// If we're just after the opening parenthesis, return all variables
		if parenIndex == len(partialExpr)-1 {
			return filterSuggestionsByType(allSuggestions, "", false)
		}

		// We're typing the first parameter, filter by the prefix
		paramPrefix := strings.TrimSpace(partialExpr[parenIndex+1:])
		return filterSuggestionsByPrefix(allSuggestions, paramPrefix)
	}

	// NEW ORDER: Handle array indexing with trailing dot first (e.g., "items[0].")
	// This regex specifically targets patterns like "name[index]."
	arrayPropAccessRegex := regexp.MustCompile(`^(.+\[\d+\])\.$`)
	if arrayPropMatches := arrayPropAccessRegex.FindStringSubmatch(partialExpr); len(arrayPropMatches) > 0 {
		baseArrayIndexPath := arrayPropMatches[1] // e.g., "customer.orders[0]"
		elementSuggestions := make([]*VariableSuggestion, 0)

		// Find properties of the array element
		for _, s := range allSuggestions {
			// Suggest "customer.orders[0].id", "customer.orders[0].amount" etc.
			if strings.HasPrefix(s.Expr, baseArrayIndexPath+".") && !strings.Contains(s.Expr[len(baseArrayIndexPath)+1:], ".") {
				elementSuggestions = append(elementSuggestions, s)
			}
		}
		// Always add a fallback suggestion
		elementSuggestions = append(elementSuggestions, &VariableSuggestion{
			Expr:        baseArrayIndexPath + ".property", // e.g., customer.orders[0].property
			Type:        "any",
			Description: "Array element property",
			IsNested:    true,
		})
		return elementSuggestions
	}

	// Handle dot notation (e.g., "customer.")
	if strings.HasSuffix(partialExpr, ".") {
		objectPath := strings.TrimSuffix(partialExpr, ".")
		objectSuggestions := make([]*VariableSuggestion, 0)

		// Find the object and return its properties
		for _, s := range allSuggestions {
			if s.Expr == objectPath && (s.Type == "object" || strings.HasPrefix(s.Type, "array<")) {
				// For objects, find all its direct properties from s.Children
				if s.Type == "object" && s.Children != nil {
					for _, child := range s.Children {
						childExpr := objectPath + "." + child
						for _, cs := range allSuggestions { // Find the fully resolved child suggestion
							if cs.Expr == childExpr {
								objectSuggestions = append(objectSuggestions, cs)
							}
						}
					}
				}

				// For arrays, add array access suggestions
				if s.ArrayInfo != nil {
					exampleAccess := s.ArrayInfo.SampleAccess
					// Add a suggestion for accessing array elements
					objectSuggestions = append(objectSuggestions, &VariableSuggestion{
						Expr:        exampleAccess,
						Type:        strings.TrimPrefix(s.ArrayInfo.ItemType, "array<"),
						Description: fmt.Sprintf("Array element access example (use specific index) %s", objectPath),
						IsNested:    true,
					})
				}
				return objectSuggestions // Return directly as per original logic for this block
			}
		}
	}

	// Default: filter suggestions by the partial expression as a prefix
	return filterSuggestionsByPrefix(allSuggestions, partialExpr)
}

// filterSuggestionsByPrefix returns suggestions that match the given prefix
func filterSuggestionsByPrefix(suggestions []*VariableSuggestion, prefix string) []*VariableSuggestion {
	if prefix == "" {
		return suggestions
	}

	filtered := make([]*VariableSuggestion, 0)
	for _, s := range suggestions {
		if strings.HasPrefix(s.Expr, prefix) {
			filtered = append(filtered, s)
		}
	}

	return filtered
}

// filterSuggestionsByType returns suggestions of the specified type
func filterSuggestionsByType(suggestions []*VariableSuggestion, typeName string, isFunction bool) []*VariableSuggestion {
	filtered := make([]*VariableSuggestion, 0)
	for _, s := range suggestions {
		if (typeName == "" || s.Type == typeName || strings.HasPrefix(s.Type, typeName)) && s.IsFunction == isFunction {
			filtered = append(filtered, s)
		}
	}

	return filtered
}

// splitFunctionArgs splits function arguments by comma while respecting parentheses and quotes
func (te *TemplateEngine) splitFunctionArgs(argsStr string) ([]string, error) {
	var args []string
	var currentArg strings.Builder
	parenCount := 0
	inSingleQuote := false
	inDoubleQuote := false
	escaped := false

	for i := 0; i < len(argsStr); i++ {
		char := argsStr[i]

		// Handle escape sequences in quotes
		if escaped {
			currentArg.WriteByte(char)
			escaped = false
			continue
		}

		if char == '\\' && (inSingleQuote || inDoubleQuote) {
			escaped = true
			currentArg.WriteByte(char)
			continue
		}

		// Handle quotes
		if char == '\'' && !inDoubleQuote {
			inSingleQuote = !inSingleQuote
			currentArg.WriteByte(char)
		} else if char == '"' && !inSingleQuote {
			inDoubleQuote = !inDoubleQuote
			currentArg.WriteByte(char)
		} else if char == '(' && !inSingleQuote && !inDoubleQuote {
			parenCount++
			currentArg.WriteByte(char)
		} else if char == ')' && !inSingleQuote && !inDoubleQuote {
			parenCount--
			currentArg.WriteByte(char)
		} else if char == ',' && parenCount == 0 && !inSingleQuote && !inDoubleQuote {
			args = append(args, currentArg.String())
			currentArg.Reset()
		} else {
			currentArg.WriteByte(char)
		}
	}

	// Check for unclosed quotes or parentheses
	if inSingleQuote || inDoubleQuote || parenCount != 0 {
		return nil, fmt.Errorf("unclosed quotes or parentheses in function arguments: %s", argsStr)
	}

	// Add the last argument if there is one
	if currentArg.Len() > 0 {
		args = append(args, currentArg.String())
	}

	return args, nil
}

// New helper function to find top-level '?' and ':'
func findTopLevelTernaryOperators(expression string) (questionIndex, colonIndex int) {
	parenLevel := 0
	qIdx := -1
	cIdx := -1
	inSingleQuote := false
	inDoubleQuote := false
	escaped := false

	for i, char := range expression {
		if escaped {
			escaped = false
			continue
		}
		if char == '\\' && (inSingleQuote || inDoubleQuote) {
			escaped = true
			continue
		}
		if char == '\'' && !inDoubleQuote {
			inSingleQuote = !inSingleQuote
			continue
		} else if char == '"' && !inSingleQuote {
			inDoubleQuote = !inDoubleQuote
			continue
		}

		if !inSingleQuote && !inDoubleQuote {
			if char == '(' {
				parenLevel++
			} else if char == ')' {
				parenLevel--
			} else if char == '?' && parenLevel == 0 && qIdx == -1 {
				qIdx = i
			} else if char == ':' && parenLevel == 0 && qIdx != -1 && cIdx == -1 {
				// Found first colon after first question mark at level 0
				cIdx = i
				// Break after finding the first valid top-level ?: pair for this precedence rule.
				break
			}
		}
	}
	if qIdx != -1 && cIdx != -1 && cIdx > qIdx {
		return qIdx, cIdx
	}
	return -1, -1
}

// Renamed original parseTernaryExpression to parseTernaryExpressionCore
// and it now takes pre-calculated indices.
func (te *TemplateEngine) parseTernaryExpressionCore(expression string, questionIndex int, colonIndex int) (TemplatePart, error) {
	condition := strings.TrimSpace(expression[:questionIndex])
	trueValue := strings.TrimSpace(expression[questionIndex+1 : colonIndex])
	falseValue := strings.TrimSpace(expression[colonIndex+1:])

	// Helper to check if parentheses are balanced for stripping
	areParenthesesBalanced := func(s string) bool {
		balance := 0
		for _, r := range s {
			if r == '(' {
				balance++
			}
			if r == ')' {
				balance--
			}
			if balance < 0 {
				return false
			}
		}
		return balance == 0
	}

	// Remove surrounding parentheses if they exist and are balanced for the segment
	if strings.HasPrefix(trueValue, "(") && strings.HasSuffix(trueValue, ")") {
		tempTrue := trueValue[1 : len(trueValue)-1]
		if areParenthesesBalanced(tempTrue) {
			trueValue = strings.TrimSpace(tempTrue)
		}
	}
	if strings.HasPrefix(falseValue, "(") && strings.HasSuffix(falseValue, ")") {
		tempFalse := falseValue[1 : len(falseValue)-1]
		if areParenthesesBalanced(tempFalse) {
			falseValue = strings.TrimSpace(tempFalse)
		}
	}

	condPart, err := te.parseExpressionPart(condition)
	if err != nil {
		return nil, fmt.Errorf("parsing ternary condition '%s': %w", condition, err)
	}

	truePart, err := te.parseExpressionPart(trueValue)
	if err != nil {
		return nil, fmt.Errorf("parsing ternary trueValue '%s': %w", trueValue, err)
	}

	falsePart, err := te.parseExpressionPart(falseValue)
	if err != nil {
		return nil, fmt.Errorf("parsing ternary falseValue '%s': %w", falseValue, err)
	}

	return &FunctionPart{Name: "if", Args: []TemplatePart{condPart, truePart, falsePart}}, nil
}

// This function is no longer directly called in the main chain if parseTernaryExpressionCore is used.
// Keep its logic for reference or integrate into parseTernaryExpressionCore.
// For this fix, parseTernaryExpressionCore is the one to use.
/*
func (te *TemplateEngine) parseTernaryExpression(expression string) (TemplatePart, error) {
    // Original robust scanning logic was here. It's now in findTopLevelTernaryOperators
    // and parseTernaryExpressionCore uses the result.
    qIdx, cIdx := findTopLevelTernaryOperators(expression)
    if qIdx != -1 && cIdx != -1 {
        return te.parseTernaryExpressionCore(expression, qIdx, cIdx)
    }
    return nil, fmt.Errorf("invalid ternary expression: %s (could not find top-level '?' and ':')", expression)
}
*/

func (te *TemplateEngine) parseExpressionPart(expression string) (TemplatePart, error) {
	expression = strings.TrimSpace(expression)

	// 1. Literals
	if stringValue, isString := parseStringLiteral(expression); isString {
		return &LiteralPart{Value: stringValue}, nil
	}
	if value, isLiteral := parseNumericLiteral(expression); isLiteral {
		return &LiteralPart{Value: value}, nil
	}

	// 2. Ternary Operator (HIGHER PRECEDENCE)
	qIdx, cIdx := findTopLevelTernaryOperators(expression)
	if qIdx != -1 && cIdx != -1 {
		return te.parseTernaryExpressionCore(expression, qIdx, cIdx)
	}
	// If not a top-level ternary structure, continue to other parsing rules.

	// 3. Null-coalescing operator (??)
	// This also needs careful precedence, ensure it splits on top-level '??'
	if strings.Contains(expression, "??") {
		// Find top-level '??' similar to how ternary is found.
		// For simplicity, using original logic; robust precedence needs full parser.
		parts := strings.SplitN(expression, "??", 2) // Assuming SplitN is sufficient for top-level here
		if len(parts) == 2 {                         // A more robust check for top-level '??' would be better
			left := strings.TrimSpace(parts[0])
			right := strings.TrimSpace(parts[1]) // Note: original used strings.Join for multiple '??'

			// To handle `a ?? b ?? c` correctly, need to parse right-associatively or find first top-level `??`
			// Sticking to the existing logic for now, which might parse `(a ?? b) ?? c` if not careful
			// The provided NullCoalescePart is binary.

			leftPart, leftErr := te.parseExpressionPart(left)
			if leftErr != nil {
				leftPart = &LiteralPart{Value: nil}
			}
			rightPart, err := te.parseExpressionPart(right)
			if err != nil {
				return nil, err
			}
			return &NullCoalescePart{Left: leftPart, Right: rightPart}, nil
		}
	}

	// 4. Preprocess expressions with comparison operators that have no surrounding spaces.
	// This loop aims to add spaces, e.g., "a>b" becomes "a > b".
	// The recursive call means the modified expression is re-parsed from the top.
	for _, op := range []string{">=", "<=", "==", "!=", ">", "<"} { // Order matters: >= before >
		if strings.Contains(expression, op) && !strings.Contains(expression, " "+op+" ") && !strings.Contains(expression, op+" ") && !strings.Contains(expression, " "+op) {
			// Check more carefully to avoid adding spaces if one side already has it.
			// This simple replace might still be problematic if `op` is part of a literal or variable name.
			// A proper lexer would avoid this.
			// For "a>b", becomes "a > b".
			// If original logic: strings.Replace(expression, op, " "+op+" ", 1)
			// This could be an area for bugs if not handled carefully.
			// Let's use a regex for safer replacement or ensure this logic is extremely robust.
			// Given the current issue, let's assume this preprocessing step might need review
			// but the primary fix is the Ternary > Comparison precedence.
			// The current implementation uses a recursive call.

			// Original Preprocessing Block (ensure it's robust or simplify/remove if causing issues)
			// It's safer to make this modify the 'expression' string and let subsequent parsers handle it,
			// rather than immediate recursive return.
			// For now, to minimize changes, we'll keep its structure but acknowledge its risks.
			if strings.Contains(expression, op) && !strings.Contains(expression, " "+op+" ") { // Original condition
				processedExpr := strings.Replace(expression, op, " "+op+" ", 1)
				// Check if anything changed to prevent infinite loops on bad Replace
				if processedExpr != expression {
					part, err := te.parseExpressionPart(processedExpr) // Recursive call
					if err == nil {
						return part, nil
					}
					// If parsing fails, continue with the original expression (as per original code)
				}
			}
		}
	}

	// 5. Comparison Operators (e.g., >, <, ==) - Use REGEX for robustness
	// REMOVE THE OLD `operators` LOOP that used symbols like `>` without spaces.
	comparisonRegex := regexp.MustCompile(`^(.*?)(\s*(?:>=|<=|==|!=|>|<)\s*)(.*)$`) // Ensure operator is captured
	if matches := comparisonRegex.FindStringSubmatch(expression); len(matches) == 4 {
		leftExpr := strings.TrimSpace(matches[1])
		operator := strings.TrimSpace(matches[2]) // This is the operator like ">", "=="
		rightExpr := strings.TrimSpace(matches[3])

		if leftExpr != "" && rightExpr != "" { // Ensure operands are not empty
			leftPart, err := te.parseExpressionPart(leftExpr)
			if err != nil {
				return nil, fmt.Errorf("parsing comparison left operand '%s': %w", leftExpr, err)
			}

			rightPart, err := te.parseExpressionPart(rightExpr)
			if err != nil {
				return nil, fmt.Errorf("parsing comparison right operand '%s': %w", rightExpr, err)
			}

			var funcName string
			switch operator {
			case ">":
				funcName = "gt"
			case "<":
				funcName = "lt"
			case ">=":
				funcName = "gte"
			case "<=":
				funcName = "lte"
			case "==":
				funcName = "eq"
			case "!=":
				funcName = "ne"
			default:
				return nil, fmt.Errorf("unsupported comparison operator: %s", operator)
			}
			return &FunctionPart{Name: funcName, Args: []TemplatePart{leftPart, rightPart}}, nil
		}
	}

	// 6. Check for loop expressions: forEach(...)
	if strings.HasPrefix(expression, "forEach(") && strings.HasSuffix(expression, ")") {
		argsStr := expression[8 : len(expression)-1]
		args, err := te.splitFunctionArgs(argsStr)
		if err != nil {
			return nil, err
		}
		if len(args) < 3 {
			return nil, errors.New("forEach requires at least 3 arguments: itemVar, collection, body")
		}
		itemVar := strings.TrimSpace(args[0])
		indexVar := ""
		collectionIndex := 1
		if len(args) >= 4 && !strings.Contains(args[1], "(") && !strings.Contains(args[1], "${") && !isOperator(args[1]) { // Added !isOperator
			indexVar = strings.TrimSpace(args[1])
			collectionIndex = 2
		}
		if collectionIndex >= len(args)-1 {
			return nil, errors.New("forEach missing collection or body")
		}
		collection, err := te.parseExpressionPart(strings.TrimSpace(args[collectionIndex]))
		if err != nil {
			return nil, err
		}
		body, err := te.parseExpressionPart(strings.TrimSpace(args[collectionIndex+1]))
		if err != nil {
			return nil, err
		}
		return &ForEachPart{ItemVar: itemVar, IndexVar: indexVar, Collection: collection, Body: body}, nil
	}

	// 7. Check for function call `name(...)`
	// Ensure this doesn't clash with forEach if forEach wasn't caught.
	// Regex for a function call: optional spaces, name, optional spaces, '(', args, ')'
	funcCallRegex := regexp.MustCompile(`^([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)$`)
	funcMatches := funcCallRegex.FindStringSubmatch(expression)
	if len(funcMatches) == 3 && !strings.HasPrefix(expression, "forEach(") {
		funcName := funcMatches[1]
		argsStr := funcMatches[2] // This is everything between the outermost parentheses

		// Parse function arguments
		if len(strings.TrimSpace(argsStr)) == 0 { // No arguments
			return &FunctionPart{Name: funcName, Args: []TemplatePart{}}, nil
		}
		funcArgs, err := te.splitFunctionArgs(argsStr)
		if err != nil {
			return nil, err
		}
		parsedArgs := make([]TemplatePart, len(funcArgs))
		for i, arg := range funcArgs {
			part, errP := te.parseExpressionPart(strings.TrimSpace(arg))
			if errP != nil {
				return nil, errP
			}
			parsedArgs[i] = part
		}
		return &FunctionPart{Name: funcName, Args: parsedArgs}, nil
	}

	// 8. Default to VariablePart
	if expression == "" { // Avoid creating VariablePart with empty path if everything else failed
		return nil, errors.New("empty expression part")
	}
	return &VariablePart{Path: expression}, nil
}

// Helper for forEach argument parsing
func isOperator(s string) bool {
	trimmed := strings.TrimSpace(s)
	switch trimmed {
	case ">", "<", ">=", "<=", "==", "!=", "&&", "||", "+", "-", "*", "/", "%", "?", ":", "??":
		return true
	}
	return false
}
