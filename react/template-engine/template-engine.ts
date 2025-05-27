import { parseLiteral, parseStringLiteral } from './literals'
import {
  ForEachPart,
  FunctionPart,
  LiteralPart,
  NullCoalescePart,
  TextPart,
  VariablePart,
} from './template-parts'
// template-engine.ts
import type {
  TemplateContext,
  TemplateExpression,
  TemplatePart,
  VariableRegistry,
  VariableSuggestion,
} from './types'
import { VariableRegistry as ConcreteVariableRegistry } from './variable-registry' // Concrete class for instantiation

export class TemplateEngine {
  private variableRegistry: VariableRegistry
  private expressionCache: Map<string, TemplateExpression>

  constructor(variableRegistry?: VariableRegistry) {
    this.variableRegistry = variableRegistry || new ConcreteVariableRegistry()
    this.expressionCache = new Map<string, TemplateExpression>()
  }

  public setVariableRegistry(reg: VariableRegistry): void {
    this.variableRegistry = reg
  }

  public getVariableRegistry(): VariableRegistry {
    return this.variableRegistry
  }

  public parseTemplateExpression(expression: string): TemplateExpression {
    if (this.expressionCache.has(expression)) {
      return this.expressionCache.get(expression)!
    }

    const expr: TemplateExpression = {
      raw: expression,
      parts: [],
    }

    // Regex for ${...} expressions
    const re = /\${([^}]+)}/g // Added 'g' flag for multiple matches
    let matches: any
    let lastEnd = 0

    // FindAllStringSubmatchIndex equivalent logic
    const allMatches = []
    let matchArr: any

    while ((matchArr = re.exec(expression)) !== null) {
      allMatches.push({
        fullMatch: matchArr[0],
        group: matchArr[1],
        indexStart: matchArr.index,
        indexEnd: re.lastIndex,
      })
    }

    if (allMatches.length === 0) {
      expr.parts.push(new TextPart(expression))
    } else {
      for (const match of allMatches) {
        // Add text before the match
        if (match.indexStart > lastEnd) {
          expr.parts.push(
            new TextPart(expression.substring(lastEnd, match.indexStart)),
          )
        }

        // Parse the expression inside ${}
        const exprText = match.group // expression.substring(match.indices[2], match.indices[3]);
        try {
          const part = this.parseExpressionPart(exprText)
          expr.parts.push(part)
        } catch (err) {
          throw new Error(
            `Error parsing expression part "${exprText}": ${
              (err as Error).message
            }`,
          )
        }
        lastEnd = match.indexEnd
      }

      // Add any trailing text
      if (lastEnd < expression.length) {
        expr.parts.push(new TextPart(expression.substring(lastEnd)))
      }
    }

    this.expressionCache.set(expression, expr)
    return expr
  }

  public async evaluateExpression(
    expressionString: string,
    context: TemplateContext,
  ): Promise<any> {
    const expr = this.parseTemplateExpression(expressionString)

    if (expr.parts.length === 1) {
      return expr.parts[0].evaluate(this.variableRegistry, context)
    }

    let result = ''
    for (const part of expr.parts) {
      const value = await part.evaluate(this.variableRegistry, context)
      result += String(value) // Ensure string concatenation
    }
    return result
  }

  public async evaluateExpressionAsString(
    expressionString: string,
    context: TemplateContext,
  ): Promise<string> {
    const result = await this.evaluateExpression(expressionString, context)
    return String(result)
  }

  private findTopLevelTernaryOperators(expression: string): {
    questionIndex: number
    colonIndex: number
  } {
    // From template_engine.go
    let parenLevel = 0
    let qIdx = -1
    let cIdx = -1
    let inSingleQuote = false
    let inDoubleQuote = false
    let escaped = false

    for (let i = 0; i < expression.length; i++) {
      const char = expression[i]
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\' && (inSingleQuote || inDoubleQuote)) {
        escaped = true
        continue
      }
      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote
      } else if (!inSingleQuote && !inDoubleQuote) {
        if (char === '(') parenLevel++
        else if (char === ')') parenLevel--
        else if (char === '?' && parenLevel === 0 && qIdx === -1) qIdx = i
        else if (
          char === ':' &&
          parenLevel === 0 &&
          qIdx !== -1 &&
          cIdx === -1
        ) {
          cIdx = i
          break
        }
      }
    }
    if (qIdx !== -1 && cIdx !== -1 && cIdx > qIdx) {
      return { questionIndex: qIdx, colonIndex: cIdx }
    }
    return { questionIndex: -1, colonIndex: -1 }
  }

  private parseTernaryExpressionCore(
    expression: string,
    questionIndex: number,
    colonIndex: number,
  ): FunctionPart {
    // From template_engine.go
    const condition = expression.substring(0, questionIndex).trim()
    let trueValue = expression.substring(questionIndex + 1, colonIndex).trim()
    let falseValue = expression.substring(colonIndex + 1).trim()

    // Simplified parenthesis stripping, Go version is more robust with areParenthesesBalanced
    if (trueValue.startsWith('(') && trueValue.endsWith(')')) {
      trueValue = trueValue.substring(1, trueValue.length - 1).trim()
    }
    if (falseValue.startsWith('(') && falseValue.endsWith(')')) {
      falseValue = falseValue.substring(1, falseValue.length - 1).trim()
    }

    const condPart = this.parseExpressionPart(condition)
    const truePart = this.parseExpressionPart(trueValue)
    const falsePart = this.parseExpressionPart(falseValue)

    return new FunctionPart('if', [condPart, truePart, falsePart]) // Ternary as an 'if' function call
  }

  // splitFunctionArgs from Go, adapted
  private splitFunctionArgs(argsStr: string): string[] {
    const args: string[] = []
    let currentArg = ''
    let parenCount = 0
    let inSingleQuote = false
    let inDoubleQuote = false
    let escaped = false

    for (let i = 0; i < argsStr.length; i++) {
      const char = argsStr[i]

      if (escaped) {
        currentArg += char
        escaped = false
        continue
      }
      if (char === '\\' && (inSingleQuote || inDoubleQuote)) {
        escaped = true
        currentArg += char
        continue
      }

      if (char === "'" && !inDoubleQuote) {
        inSingleQuote = !inSingleQuote
        currentArg += char
      } else if (char === '"' && !inSingleQuote) {
        inDoubleQuote = !inDoubleQuote
        currentArg += char
      } else if (char === '(' && !inSingleQuote && !inDoubleQuote) {
        parenCount++
        currentArg += char
      } else if (char === ')' && !inSingleQuote && !inDoubleQuote) {
        parenCount--
        currentArg += char
      } else if (
        char === ',' &&
        parenCount === 0 &&
        !inSingleQuote &&
        !inDoubleQuote
      ) {
        args.push(currentArg.trim())
        currentArg = ''
      } else {
        currentArg += char
      }
    }
    if (inSingleQuote || inDoubleQuote || parenCount !== 0) {
      throw new Error(
        `Unclosed quotes or parentheses in function arguments: ${argsStr}`,
      )
    }
    if (currentArg.trim().length > 0 || args.length > 0 || argsStr === '') {
      // Handle empty args or last arg
      if (argsStr !== '' || currentArg.trim().length > 0) {
        // Add if argsStr wasn't empty or currentArg has content
        args.push(currentArg.trim())
      } else if (args.length === 0 && argsStr === '') {
        // if argsStr is empty string, it means one empty argument "" for the function
        // This case depends on how func("") should be handled.
        // If it implies no arguments, this should not push. If it implies one empty string arg, it should.
        // The Go code's behavior for `foo()` vs `foo("")` would dictate this.
        // Current Go logic for `len(strings.TrimSpace(argsStr)) == 0` suggests `foo()` = no args.
        // Let's assume empty string for args means no args if only whitespace.
      }
    }
    // Filter out potentially empty strings if argsStr was just " , "
    return args.filter(
      arg =>
        arg.length > 0 ||
        (args.length === 1 && arg.length === 0 && argsStr.length > 0),
    )
  }

  private parseExpressionPart(expression: string): TemplatePart {
    expression = expression.trim()
    if (expression === '') {
      throw new Error('Empty expression part')
    }

    // 1. Literals
    const strLit = parseStringLiteral(expression)
    if (strLit.isString) {
      return new LiteralPart(strLit.value)
    }
    const lit = parseLiteral(expression) // Handles numeric, boolean, null
    if (lit.isLiteral) {
      return new LiteralPart(lit.value)
    }

    // 2. Ternary Operator (HIGHER PRECEDENCE)
    const { questionIndex, colonIndex } =
      this.findTopLevelTernaryOperators(expression)
    if (questionIndex !== -1 && colonIndex !== -1) {
      return this.parseTernaryExpressionCore(
        expression,
        questionIndex,
        colonIndex,
      )
    }

    // 3. Null-coalescing operator (??)
    // A proper top-level split is needed here too, similar to ternary.
    // This simplified version splits at the first '??'.
    // For `a ?? b ?? c`, this would parse as `(a ?? b) ?? c`. Go impl might be similar.
    const nullCoalesceIndex = expression.indexOf('??') // Needs top-level check
    if (nullCoalesceIndex !== -1) {
      // Basic split, a robust solution would find top-level '??'
      // similar to findTopLevelTernaryOperators
      let level = 0
      let splitAt = -1
      for (let i = 0; i < expression.length - 1; i++) {
        if (expression[i] === '(') level++
        else if (expression[i] === ')') level--
        else if (
          expression[i] === '?' &&
          expression[i + 1] === '?' &&
          level === 0
        ) {
          splitAt = i
          break
        }
      }

      if (splitAt !== -1) {
        const left = expression.substring(0, splitAt).trim()
        const right = expression.substring(splitAt + 2).trim()
        if (left && right) {
          // Ensure both parts are non-empty
          const leftPart = this.parseExpressionPart(left)
          const rightPart = this.parseExpressionPart(right)
          return new NullCoalescePart(leftPart, rightPart)
        }
      }
    }

    // 4. Preprocessing for comparison operators (Skipped for direct TS port, rely on spaced operators or robust regex)
    // The Go code has a step to add spaces around operators like ">" if missing.
    // `a>b` -> `a > b`. This is fragile. It's better to write expressions with spaces.
    // For this TS port, we'll assume expressions are well-formed or the regex handles it.

    // 5. Comparison Operators (e.g., >, <, ==)
    // Regex to capture (left operand) (operator) (right operand)
    const comparisonRegex = /^(.*?)(\s*(?:>=|<=|==|!=|>|<)\s*)(.*)$/
    const compMatch = expression.match(comparisonRegex)
    if (compMatch && compMatch[1].trim() !== '' && compMatch[3].trim() !== '') {
      const leftExpr = compMatch[1].trim()
      const operator = compMatch[2].trim()
      const rightExpr = compMatch[3].trim()

      const leftPart = this.parseExpressionPart(leftExpr)
      const rightPart = this.parseExpressionPart(rightExpr)

      let funcName = ''
      switch (operator) {
        case '>':
          funcName = 'gt'
          break
        case '<':
          funcName = 'lt'
          break
        case '>=':
          funcName = 'gte'
          break
        case '<=':
          funcName = 'lte'
          break
        case '==':
          funcName = 'eq'
          break
        case '!=':
          funcName = 'ne'
          break
        default:
          throw new Error(`Unsupported comparison operator: ${operator}`)
      }
      return new FunctionPart(funcName, [leftPart, rightPart])
    }

    // 6. Check for loop expressions: forEach(...)
    const forEachRegex = /^forEach\s*\((.*)\)$/
    const forEachMatch = expression.match(forEachRegex)
    if (forEachMatch) {
      const argsStr = forEachMatch[1]
      const args = this.splitFunctionArgs(argsStr) // Re-use robust arg splitter
      if (args.length < 3)
        throw new Error(
          'forEach requires at least 3 arguments: itemVar, collection, body',
        )

      const itemVar = args[0].trim()
      let indexVar: string | undefined
      let collectionArgIndex = 1

      // Check for indexVar: forEach(item, index, collection, body)
      // This logic from Go is a bit heuristic.
      // `!strings.Contains(args[1], "(") && !strings.Contains(args[1], "${") && !isOperator(args[1])`
      // A simple identifier check might be ` /^[a-zA-Z_]\w*$/.test(args[1].trim()) `
      if (args.length >= 4 && /^[a-zA-Z_]\w*$/.test(args[1].trim())) {
        indexVar = args[1].trim()
        collectionArgIndex = 2
      }
      if (collectionArgIndex >= args.length - 1) {
        // args.length must be at least collectionArgIndex + 2 (for collection and body)
        throw new Error('forEach missing collection or body')
      }

      const collectionPart = this.parseExpressionPart(
        args[collectionArgIndex].trim(),
      )
      const bodyPart = this.parseExpressionPart(
        args[collectionArgIndex + 1].trim(),
      )
      return new ForEachPart(itemVar, collectionPart, bodyPart, indexVar)
    }

    // 7. Function call `name(...)`
    const funcCallRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*)\)$/
    const funcMatch = expression.match(funcCallRegex)
    if (funcMatch) {
      const funcName = funcMatch[1]
      const argsStr = funcMatch[2].trim()
      let parsedArgs: TemplatePart[] = []

      if (argsStr.length > 0) {
        const funcArgStrings = this.splitFunctionArgs(argsStr)
        parsedArgs = funcArgStrings.map(argStr =>
          this.parseExpressionPart(argStr),
        )
      }
      return new FunctionPart(funcName, parsedArgs)
    }

    // 8. Default to VariablePart
    // Ensure it's a valid variable path (e.g. not containing invalid characters outside of known syntax)
    // Basic check: if it contains spaces or operators not handled above, it's likely an error.
    // For simplicity, if nothing else matches, assume it's a variable path.
    if (
      expression.match(/^[a-zA-Z0-9_$.[\]()\s"']+[a-zA-Z0-9_\])"']?$/) &&
      !expression.includes('??') &&
      !expression.includes('? :')
    ) {
      // Further validation could be added to ensure it's a plausible variable/path.
      // e.g. not containing unparsed operators.
    }

    return new VariablePart(expression)
  }

  // getExpressionSuggestions from Go, adapted
  public getExpressionSuggestions(partialExpr: string): VariableSuggestion[] {
    const allSuggestions = this.variableRegistry.generateVariableSuggestions()

    if (partialExpr === '') {
      return allSuggestions
    }

    let effectivePartialExpr = partialExpr
    if (effectivePartialExpr.startsWith('${')) {
      effectivePartialExpr = effectivePartialExpr.substring(2)
    }

    // Handle function parameters context
    if (effectivePartialExpr.includes('(')) {
      const parenIndex = effectivePartialExpr.lastIndexOf('(')
      const commaIndex = effectivePartialExpr.lastIndexOf(',')

      if (commaIndex > parenIndex) {
        // Typing a parameter after a comma
        const paramPrefix = effectivePartialExpr
          .substring(commaIndex + 1)
          .trim()
        return this.filterSuggestionsByPrefix(allSuggestions, paramPrefix)
      }
      if (parenIndex === effectivePartialExpr.length - 1) {
        // Just typed '('
        return this.filterSuggestionsByType(allSuggestions, '', false) // Return all variables/functions (or just vars)
      }
      // Typing the first parameter
      const paramPrefix = effectivePartialExpr.substring(parenIndex + 1).trim()
      return this.filterSuggestionsByPrefix(allSuggestions, paramPrefix)
    }

    // Handle array indexing with trailing dot: "items[0]."
    const arrayPropAccessRegex = /^(.+\[\d+\])\.$/
    const arrayPropMatches = effectivePartialExpr.match(arrayPropAccessRegex)
    if (arrayPropMatches) {
      const baseArrayIndexPath = arrayPropMatches[1] // e.g., "customer.orders[0]"
      const elementSuggestions: VariableSuggestion[] = []

      for (const s of allSuggestions) {
        if (
          s.expr.startsWith(baseArrayIndexPath + '.') &&
          !s.expr.substring(baseArrayIndexPath.length + 1).includes('.')
        ) {
          elementSuggestions.push(s)
        }
      }
      // Add a fallback suggestion
      elementSuggestions.push({
        expr: `${baseArrayIndexPath}.property`,
        type: 'any',
        description: 'Array element property',
        isNested: true,
      })
      return elementSuggestions
    }

    // Handle dot notation: "customer."
    if (effectivePartialExpr.endsWith('.')) {
      const objectPath = effectivePartialExpr.substring(
        0,
        effectivePartialExpr.length - 1,
      )
      const objectSuggestions: VariableSuggestion[] = []

      const parentSuggestion = allSuggestions.find(s => s.expr === objectPath)
      if (parentSuggestion) {
        if (parentSuggestion.type === 'object' && parentSuggestion.children) {
          for (const childName of parentSuggestion.children) {
            const childSuggestion = allSuggestions.find(
              cs => cs.expr === `${objectPath}.${childName}`,
            )
            if (childSuggestion) {
              objectSuggestions.push(childSuggestion)
            }
          }
        }
        if (parentSuggestion.arrayInfo) {
          // If it's an array, suggest accessing elements
          objectSuggestions.push({
            expr: parentSuggestion.arrayInfo.sampleAccess,
            type: parentSuggestion.arrayInfo.itemType.replace(
              /^array<|>$/g,
              '',
            ), // Get inner type
            description: `Array element access for ${objectPath}`,
            isNested: true,
          })
        }
      }
      return objectSuggestions
    }

    return this.filterSuggestionsByPrefix(allSuggestions, effectivePartialExpr)
  }

  private filterSuggestionsByPrefix(
    suggestions: VariableSuggestion[],
    prefix: string,
  ): VariableSuggestion[] {
    //
    if (prefix === '') return suggestions
    return suggestions.filter(s => s.expr.startsWith(prefix))
  }

  private filterSuggestionsByType(
    suggestions: VariableSuggestion[],
    typeName: string,
    isFunction: boolean,
  ): VariableSuggestion[] {
    //
    return suggestions.filter(
      s =>
        (typeName === '' ||
          s.type === typeName ||
          (s.type && s.type.startsWith(typeName))) &&
        s.isFunction === isFunction,
    )
  }
}
