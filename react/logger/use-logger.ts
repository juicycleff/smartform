/**
 * useLogger - React Hook for component-level logging
 *
 * This hook provides a convenient way to use the logger within React components,
 * automatically detecting and including the component name in logs.
 */
import { useMemo } from 'react'
import Logger from './logger'

/**
 * Get the name of the calling component by analyzing the stack trace
 *
 * @returns The detected component name or undefined if not found
 */
function getCallerComponentName(): string | undefined {
  // Create an error to get the stack trace
  const err = new Error()

  // Extract the stack trace
  const stackLines = err.stack?.split('\n') || []

  // Look for a line that matches a React component pattern
  // This pattern looks for PascalCase component names
  const componentNamePattern = /at ([A-Z][a-zA-Z0-9]*)[\s.]/

  // Skip the first entries which will be this function and the hook
  for (let i = 2; i < stackLines.length; i++) {
    const match = stackLines[i]?.match(componentNamePattern)
    if (match?.length && match[1]) {
      // Found a potential component name
      const name = match[1]

      // Filter out some common non-component function names
      if (
        name !== 'Module' &&
        name !== 'Object' &&
        name !== 'Function' &&
        name !== 'eval' &&
        !name.startsWith('use')
      ) {
        // Skip hooks
        return name
      }
    }
  }

  return undefined
}

/**
 * React hook for component-level logging
 *
 * @param componentName Optional explicit component name (will be auto-detected if omitted)
 * @returns Logger instance for the component
 */
export function useLogger(componentName?: string) {
  return useMemo(() => {
    // Use provided name or try to detect it
    const detectedName =
      componentName || getCallerComponentName() || 'UnknownComponent'
    return Logger.forComponent(detectedName)
  }, [componentName])
}

export default useLogger
