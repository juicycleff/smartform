/**
 * React Logger
 *
 * A utility for logging in React applications that can be
 * automatically disabled in production environments.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LoggerConfig = {
  enabled: boolean
  level: LogLevel
  prefix?: string
  showTimestamp?: boolean
  extendedInfo?: boolean // Shows component name, file, line number if available
}

// Default log levels with numeric values for comparison
export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * React Logger class for consistent, configurable logging
 */
class ReactLogger {
  config: LoggerConfig
  componentName?: string

  /**
   * Create a new logger instance
   *
   * @param config Logger configuration or boolean to enable/disable
   * @param componentName Optional component name for context
   */
  constructor(config: LoggerConfig | boolean = true, componentName?: string) {
    // Convert boolean to config object
    if (typeof config === 'boolean') {
      this.config = {
        enabled: config,
        level: 'debug',
        showTimestamp: true,
      }
    } else {
      this.config = config
    }

    this.componentName = componentName
  }

  /**
   * Create a new logger instance for a specific component
   *
   * @param componentName Component name
   * @returns A new logger instance with the same config
   */
  forComponent(componentName: string): ReactLogger {
    return new ReactLogger(this.config, componentName)
  }

  /**
   * Format a message with optional prefix, timestamp, and component name
   *
   * @param message The message to format
   * @returns Formatted message
   */
  formatMessage(message: string): string {
    const parts: string[] = []

    // Add timestamp if enabled
    if (this.config.showTimestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    // Add prefix if provided
    if (this.config.prefix) {
      parts.push(`[${this.config.prefix}]`)
    }

    // Add component name if available
    if (this.componentName) {
      parts.push(`[${this.componentName}]`)
    }

    // Add the message
    parts.push(message)

    return parts.join(' ')
  }

  /**
   * Check if a log level should be displayed
   *
   * @param level The log level to check
   * @returns Whether the log should be displayed
   */
  public shouldLog(level: LogLevel): boolean {
    return (
      this.config.enabled && LOG_LEVELS[level] >= LOG_LEVELS[this.config.level]
    )
  }

  /**
   * Log a debug message
   *
   * @param message Message or object to log
   * @param args Additional arguments to log
   */
  debug(message: any, ...args: any[]): void {
    if (!this.shouldLog('debug')) {
      return
    }

    if (typeof message === 'string') {
      // biome-ignore lint/suspicious/noConsole: keep
      console.debug(this.formatMessage(message), ...args)
    } else {
      // biome-ignore lint/suspicious/noConsole: keep
      console.debug(this.formatMessage('Debug:'), message, ...args)
    }
  }

  /**
   * Log a debug message
   *
   * @param message Message or object to log
   * @param args Additional arguments to log
   */
  log(message: any, ...args: any[]): void {
    this.debug(message, ...args)
  }

  /**
   * Log an info message
   *
   * @param message Message or object to log
   * @param args Additional arguments to log
   */
  info(message: any, ...args: any[]): void {
    if (!this.shouldLog('info')) return

    if (typeof message === 'string') {
      // biome-ignore lint/suspicious/noConsole: keep
      console.info(this.formatMessage(message), ...args)
    } else {
      // biome-ignore lint/suspicious/noConsole: keep
      console.info(this.formatMessage('Info:'), message, ...args)
    }
  }

  /**
   * Log a warning message
   *
   * @param message Message or object to log
   * @param args Additional arguments to log
   */
  warn(message: any, ...args: any[]): void {
    if (!this.shouldLog('warn')) return

    if (typeof message === 'string') {
      // biome-ignore lint/suspicious/noConsole: keep
      console.warn(this.formatMessage(message), ...args)
    } else {
      // biome-ignore lint/suspicious/noConsole: keep
      console.warn(this.formatMessage('Warning:'), message, ...args)
    }
  }

  /**
   * Log an error message
   *
   * @param message Message or object to log
   * @param args Additional arguments to log
   */
  error(message: any, ...args: any[]): void {
    if (!this.shouldLog('error')) return

    if (typeof message === 'string') {
      // biome-ignore lint/suspicious/noConsole: keep
      console.error(this.formatMessage(message), ...args)
    } else {
      // biome-ignore lint/suspicious/noConsole: keep
      console.error(this.formatMessage('Error:'), message, ...args)
    }
  }

  /**
   * Log a message with a group
   *
   * @param groupName Name of the group
   * @param callback Function to execute within the group
   */
  group(groupName: string, callback: () => void): void {
    if (!this.config.enabled) return

    // biome-ignore lint/suspicious/noConsole: keep
    console.group(this.formatMessage(groupName))
    callback()
    // biome-ignore lint/suspicious/noConsole: keep
    console.groupEnd()
  }

  /**
   * Log a collapsible group
   *
   * @param groupName Name of the group
   * @param callback Function to execute within the group
   */
  groupCollapsed(groupName: string, callback: () => void): void {
    if (!this.config.enabled) return

    // biome-ignore lint/suspicious/noConsole: keep
    console.groupCollapsed(this.formatMessage(groupName))
    callback()
    // biome-ignore lint/suspicious/noConsole: keep
    console.groupEnd()
  }

  /**
   * Log an object as a table
   *
   * @param data Data to display as a table
   * @param columns Optional column names to include
   */
  table(data: any, columns?: string[]): void {
    if (!this.config.enabled) return

    // biome-ignore lint/suspicious/noConsole: keep
    console.table(data, columns)
  }

  /**
   * Start a timer for performance measurement
   *
   * @param label Timer label
   */
  time(label: string): void {
    if (!this.config.enabled) return

    // biome-ignore lint/suspicious/noConsole: keep
    console.time(this.formatMessage(label))
  }

  /**
   * End a timer and log the duration
   *
   * @param label Timer label
   */
  timeEnd(label: string): void {
    if (!this.config.enabled) {
      return
    }

    // biome-ignore lint/suspicious/noConsole: keep
    console.timeEnd(this.formatMessage(label))
  }
}

const functionPattern = /at ([A-Za-z0-9_$]+) \(/
const classMethodPattern = /at (([A-Z][A-Za-z0-9_$]*)[.:]([a-zA-Z0-9_$]+))/
const filePattern = /\(([^)]+)\)/

/**
 * Attempt to detect the caller name from a stack trace
 * Works for both class names and function names
 *
 * @returns The detected caller name or undefined
 */
function getCallerName(): string | undefined {
  // Create an error to get the stack trace
  const err = new Error("I'm an error. Who's calling me?")
  const stackLines = err.stack?.split('\n') || []

  // Skip the first few frames which will be this function and logger internals
  // Then look for the first line that appears to be from user code
  for (let i = 3; i < stackLines.length; i++) {
    const line = stackLines[i]?.trim() || ''

    // Ignore node_modules and internal frames
    if (line.includes('node_modules/') || line.includes('internal/')) {
      continue
    }

    // Try to extract a name from this frame

    // Look for class/function name pattern (prioritize the more specific pattern)
    const classMethodMatch = line.match(classMethodPattern)
    if (classMethodMatch) {
      return `${classMethodMatch[2]}.${classMethodMatch[3]}` // Return ClassName.methodName
    }

    // Otherwise try to find a function name
    const functionMatch = line.match(functionPattern)
    if (functionMatch?.length && functionMatch[1]) {
      const name = functionMatch[1]
      // Filter out some common internal names
      if (
        name !== 'Module' &&
        name !== 'Object' &&
        name !== 'Function' &&
        name !== 'eval' &&
        name !== 'process' &&
        name !== '<anonymous>' &&
        !name.startsWith('__')
      ) {
        return name
      }
    }

    // If we can't find a function name, try to extract a filename
    const fileMatch = line.match(filePattern)
    if (fileMatch?.length && fileMatch[1]) {
      const filePath = fileMatch[1].split('/')
      const fileName = filePath.at(-1)?.split(':')[0] // Remove line/column numbers
      if (fileName) {
        return fileName.replace(/\.[^.]+$/, '') // Remove extension
      }
    }
  }

  return undefined
}

// Create default logger instance
const isProduction = process.env.NODE_ENV === 'production'

const defaultConfig: LoggerConfig = {
  enabled: !isProduction, // Disabled in production by default
  level: 'debug',
  showTimestamp: true,
  extendedInfo: !isProduction,
}

export class ReactLoggerWithContext extends ReactLogger {
  constructor(config: LoggerConfig | boolean = true) {
    super(config)
  }

  withContext() {
    const callerName = getCallerName() || 'unknown'
    return this.forComponent(callerName)
  }
}

const Logger = new ReactLoggerWithContext(defaultConfig)

export default Logger
