import { Box } from '../ui/box'
import { Input } from '../ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import {
  ALargeSmall,
  Binary,
  Braces,
  CalendarDays,
  Hash,
  HelpCircle,
  KeyRound,
  List,
  ToggleLeft,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { TemplateEngine, VariableSuggestion } from '../../template-engine'

const DATA_VALUE_POPOVER_ATTR = 'data-value-preview-popover'

interface AutosuggestTemplateInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  templateEngine: TemplateEngine
  className?: string
  placeholder?: string
  disabled?: boolean
  endContent?: any
  size?: "xs" | "sm" | "md" | "lg" | "xl" | null | undefined
}

const getIconForSuggestion = (
  suggestion: VariableSuggestion,
): React.ReactElement => {
  const iconProps = { className: 'mr-2 h-4 w-4 flex-shrink-0' }

  if (suggestion.isFunction) {
    return <Braces {...iconProps} color="rgb(168 85 247)" />
  }
  const type = suggestion.type?.toLowerCase() || ''
  if (type.startsWith('object')) {
    return <Binary {...iconProps} color="rgb(34 197 94)" />
  }
  if (type.startsWith('array')) {
    return <List {...iconProps} color="rgb(20 184 166)" />
  }
  if (type.startsWith('string')) {
    return <ALargeSmall {...iconProps} color="rgb(249 115 22)" />
  }
  if (type.startsWith('number')) {
    return <Hash {...iconProps} color="rgb(59 130 246)" />
  }
  if (type.startsWith('boolean')) {
    return <ToggleLeft {...iconProps} color="rgb(99 102 241)" />
  }
  if (type.startsWith('date')) {
    return <CalendarDays {...iconProps} color="rgb(236 72 153)" />
  }
  if (!suggestion.isFunction && suggestion.expr) {
    return <KeyRound {...iconProps} color="rgb(107 114 128)" />
  }
  return <HelpCircle {...iconProps} color="rgb(156 163 175)" />
}

export const AutosuggestTemplateInput: React.FC<
  AutosuggestTemplateInputProps
> = ({
  size,
  value,
  onChange,
  onBlur,
  templateEngine,
  className,
  placeholder,
  endContent,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<VariableSuggestion[]>([])
  const [cursorPosition, setCursorPosition] = useState(0)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null) // Ref for the main suggestions dropdown UL/Div

  const [hoveredSuggestion, setHoveredSuggestion] =
    useState<VariableSuggestion | null>(null)
  const [isHoverPopoverOpen, setIsHoverPopoverOpen] = useState(false)
  const popoverOpenTimerRef = useRef<number | null>(null)
  const popoverCloseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value)
    }
  }, [value, inputValue]) // Added inputValue to dep array to avoid potential stale closures if value is updated by input itself

  const getRelevantTextForSuggestions = (
    text: string,
    position: number,
  ): string | null => {
    let expressionStartMarker = -1
    for (let i = position - 1; i >= 0; i--) {
      if (text.substring(i, i + 2) === '${') {
        expressionStartMarker = i
        break
      }
      if (text[i] === '}') {
        break
      }
    }

    if (expressionStartMarker === -1 || position < expressionStartMarker + 2) {
      return null
    }

    const expressionEndMarker = text.indexOf('}', expressionStartMarker)
    if (expressionEndMarker !== -1 && position > expressionEndMarker) {
      return null
    }
    const partialExprForEngine = text.substring(expressionStartMarker, position)
    return partialExprForEngine
  }

  const fetchAndShowSuggestions = (textForEngineQuery: string | null) => {
    const query = textForEngineQuery === null ? '${' : textForEngineQuery
    const newSuggestions = templateEngine.getExpressionSuggestions(query)
    setSuggestions(newSuggestions)
    setShowSuggestions(newSuggestions.length > 0)
    setActiveSuggestionIndex(newSuggestions.length > 0 ? 0 : -1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const currentCursorPos = e.target.selectionStart || 0

    setInputValue(newValue)
    onChange(newValue)
    setCursorPosition(currentCursorPos)

    const textForEngine = getRelevantTextForSuggestions(
      newValue,
      currentCursorPos,
    )

    if (textForEngine) {
      fetchAndShowSuggestions(textForEngine)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
      setActiveSuggestionIndex(-1)
    }
  }

  const insertSuggestionText = (suggestion: VariableSuggestion) => {
    // ... (insertSuggestionText logic remains the same as your last provided version)
    if (!inputRef.current) return

    const originalValue = inputValue
    const cursorPos = inputRef.current.selectionStart || cursorPosition

    let textToInsert = suggestion.expr
    let finalCursorOffsetWithinNewTextPart = textToInsert.length

    if (suggestion.isFunction) {
      const charAfterPossibleTokenEnd = originalValue.charAt(cursorPos)
      if (!textToInsert.endsWith('()') && charAfterPossibleTokenEnd !== '(') {
        textToInsert += '()'
        finalCursorOffsetWithinNewTextPart = textToInsert.length - 1
      } else if (textToInsert.endsWith('()')) {
        finalCursorOffsetWithinNewTextPart = textToInsert.length - 1
      }
    }

    let insideActiveExpr = false
    let exprStartBoundary = -1
    let tokenStartPos = cursorPos

    for (let i = cursorPos - 1; i >= 0; i--) {
      if (originalValue.substring(i, i + 2) === '${') {
        const exprEndBoundary = originalValue.indexOf('}', i)
        if (exprEndBoundary === -1 || cursorPos <= exprEndBoundary) {
          insideActiveExpr = true
          exprStartBoundary = i
          const contentBeforeCursorInExpr = originalValue.substring(
            exprStartBoundary + 2,
            cursorPos,
          )
          const match = contentBeforeCursorInExpr.match(/[\w.[\]]*$/)
          tokenStartPos =
            exprStartBoundary +
            2 +
            (match ? contentBeforeCursorInExpr.length - match[0].length : 0)
        }
        break
      }
      if (originalValue[i] === '}') {
        break
      }
    }

    let finalNewValue
    let finalNewCursorPosition

    if (insideActiveExpr) {
      const prefix = originalValue.substring(0, tokenStartPos)
      const suffix = originalValue.substring(cursorPos)
      finalNewValue = prefix + textToInsert + suffix
      finalNewCursorPosition =
        tokenStartPos + finalCursorOffsetWithinNewTextPart
    } else {
      const textBeforeCursor = originalValue.substring(0, cursorPos)
      const plainTokenMatch = textBeforeCursor.match(/[\w.[\]]*$/) // include . and [] for replacement
      const plainTokenToReplace = plainTokenMatch ? plainTokenMatch[0] : ''
      tokenStartPos = cursorPos - plainTokenToReplace.length

      const prefix = originalValue.substring(0, tokenStartPos)
      const suffix = originalValue.substring(cursorPos)

      const wrappedTextToInsert = `\${${textToInsert}}`
      finalNewValue = prefix + wrappedTextToInsert + suffix

      finalNewCursorPosition =
        tokenStartPos + 2 + finalCursorOffsetWithinNewTextPart
    }

    setInputValue(finalNewValue)
    onChange(finalNewValue)
    setShowSuggestions(false)
    setActiveSuggestionIndex(-1)

    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(
        finalNewCursorPosition,
        finalNewCursorPosition,
      )
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveSuggestionIndex(
          prev => (prev - 1 + suggestions.length) % suggestions.length,
        )
      } else if (e.key === 'Enter' && activeSuggestionIndex !== -1) {
        e.preventDefault()
        insertSuggestionText(suggestions[activeSuggestionIndex])
        setIsHoverPopoverOpen(false) // Close hover popover on selection
      } else if (e.key === 'Tab' && activeSuggestionIndex !== -1) {
        e.preventDefault()
        insertSuggestionText(suggestions[activeSuggestionIndex])
        setIsHoverPopoverOpen(false) // Close hover popover on selection
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowSuggestions(false)
        setActiveSuggestionIndex(-1)
        setIsHoverPopoverOpen(false) // Close hover popover on escape
      }
    }

    if (e.key === ' ' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      const currentCursorPos =
        inputRef.current?.selectionStart || cursorPosition
      const textForEngine = getRelevantTextForSuggestions(
        inputValue,
        currentCursorPos,
      )
      fetchAndShowSuggestions(textForEngine)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(target) &&
        !(target as HTMLElement).closest(`[${DATA_VALUE_POPOVER_ATTR}="true"]`) // Check for popover
      ) {
        setShowSuggestions(false)
        setActiveSuggestionIndex(-1)
        setIsHoverPopoverOpen(false) // Also close value preview
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, []) // Empty dependency array is usually fine if refs don't change and no state from closure is stale

  const handleFocusOrClickInput = () => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart || 0)
    }
  }

  const handleInputBlur = () => {
    if (onBlur) {
      onBlur()
    }
    // Delay hiding suggestions to allow click on suggestion item or popover content
    setTimeout(() => {
      const activeEl = document.activeElement
      if (
        inputRef.current !== activeEl &&
        !suggestionsRef.current?.contains(activeEl) &&
        !(
          activeEl &&
          (activeEl as HTMLElement).closest(
            `[${DATA_VALUE_POPOVER_ATTR}="true"]`,
          )
        )
      ) {
        setShowSuggestions(false)
        setIsHoverPopoverOpen(false)
      }
    }, 150) // A small delay
  }

  const handleSuggestionMouseEnter = (suggestion: VariableSuggestion) => {
    if (popoverOpenTimerRef.current) clearTimeout(popoverOpenTimerRef.current)
    if (popoverCloseTimerRef.current) clearTimeout(popoverCloseTimerRef.current)

    if (
      suggestion.value !== undefined &&
      suggestion.value !== null &&
      !suggestion.isFunction
    ) {
      popoverOpenTimerRef.current = window.setTimeout(() => {
        setHoveredSuggestion(suggestion)
        setIsHoverPopoverOpen(true)
      }, 300)
    }
  }

  const handleSuggestionMouseLeave = () => {
    if (popoverOpenTimerRef.current) clearTimeout(popoverOpenTimerRef.current)
    if (popoverCloseTimerRef.current) clearTimeout(popoverCloseTimerRef.current)

    popoverCloseTimerRef.current = window.setTimeout(() => {
      setIsHoverPopoverOpen(false)
    }, 100)
  }

  const handlePopoverContentMouseEnter = () => {
    if (popoverCloseTimerRef.current) clearTimeout(popoverCloseTimerRef.current)
  }

  const handlePopoverContentMouseLeave = () => {
    popoverCloseTimerRef.current = window.setTimeout(() => {
      setIsHoverPopoverOpen(false)
    }, 100)
  }

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        size={size}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleInputBlur} // Use specific blur handler
        onClick={handleFocusOrClickInput}
        onFocus={handleFocusOrClickInput}
        className={`${
          className || ''
        } font-mono text-blue-700 text-sm dark:text-blue-400`}
        placeholder={placeholder || '${variable_or_expression}'}
        disabled={disabled}
        autoComplete="off"
        endContent={endContent}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-background py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {suggestions.map((suggestion, index) => (
            <Popover
              key={`${suggestion.expr}-${index}-${suggestion.type}`}
              open={
                isHoverPopoverOpen &&
                hoveredSuggestion?.expr === suggestion.expr &&
                hoveredSuggestion?.type === suggestion.type
              }
              onOpenChange={open => {
                // This callback from Popover component can manage its own open state
                // but we primarily control it with setIsHoverPopoverOpen for hover behavior.
                if (!open && hoveredSuggestion?.expr === suggestion.expr) {
                  setIsHoverPopoverOpen(false) // Sync if popover closes itself
                }
              }}
            >
              <PopoverTrigger asChild>
                <Box
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    index === activeSuggestionIndex
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : ''
                  }`}
                  onClick={() => {
                    insertSuggestionText(suggestion)
                    setIsHoverPopoverOpen(false) // Close popover on click select
                  }}
                  onMouseEnter={() => {
                    setActiveSuggestionIndex(index)
                    handleSuggestionMouseEnter(suggestion)
                  }}
                  onMouseLeave={handleSuggestionMouseLeave}
                >
                  {getIconForSuggestion(suggestion)}
                  <div className="flex-1">
                    <div className="font-medium">
                      {suggestion.expr}
                      {suggestion.isFunction &&
                        suggestion.signature &&
                        suggestion.expr !== suggestion.signature && (
                          <span className="ml-1 text-gray-400 text-xs dark:text-gray-500">
                            {suggestion.signature.substring(
                              suggestion.expr.length,
                            )}
                          </span>
                        )}
                    </div>
                    {suggestion.description && (
                      <div className="text-gray-500 text-xs dark:text-gray-400">
                        {suggestion.description}
                      </div>
                    )}
                  </div>
                  <div className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-gray-700 text-xs dark:bg-gray-700 dark:text-gray-300">
                    {suggestion.isFunction ? 'fn' : suggestion.type}
                  </div>
                </Box>
              </PopoverTrigger>
              {hoveredSuggestion?.expr === suggestion.expr && // Ensure content matches trigger
                hoveredSuggestion.value !== undefined &&
                hoveredSuggestion.value !== null &&
                !hoveredSuggestion.isFunction && (
                  <PopoverContent
                    side="right"
                    align="start"
                    className="z-[60] max-w-xs overflow-auto rounded-md border bg-white p-2 text-xs shadow-md dark:border-gray-700 dark:bg-gray-900"
                    {...{ [DATA_VALUE_POPOVER_ATTR]: 'true' }} // Add data attribute
                    onMouseEnter={handlePopoverContentMouseEnter}
                    onMouseLeave={handlePopoverContentMouseLeave}
                    // Prevent focus scope from Radix popover from automatically focusing inside,
                    // which can interfere with main input focus and selection.
                    // This depends on the actual Popover component's API.
                    // Example for Radix: onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <h4 className="mb-1 border-gray-200 border-b pb-1 font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
                      Value Preview
                    </h4>
                    <pre className="max-h-40 overflow-auto text-gray-600 dark:text-gray-400">
                      {JSON.stringify(hoveredSuggestion.value, null, 2)}
                    </pre>
                  </PopoverContent>
                )}
            </Popover>
          ))}
        </div>
      )}
    </div>
  )
}
