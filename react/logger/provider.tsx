/**
 * LoggerProvider
 *
 * React Context Provider for the logger configuration
 */
import type React from 'react'
import { createContext, useContext, useMemo } from 'react'
import Logger, { type LoggerConfig } from './logger'

// The type for our React context
type LoggerContextType = {
  logger: typeof Logger
  updateConfig: (config: Partial<LoggerConfig>) => void
}

// Create the context with a default value
const LoggerContext = createContext<LoggerContextType | undefined>(undefined)

export interface LoggerProviderProps {
  initialConfig?: Partial<LoggerConfig>
  children: React.ReactNode
}

/**
 * Provider component for the Logger
 *
 * Allows configuration of the logger for the entire application
 */
export function LoggerProvider({
  initialConfig,
  children,
}: LoggerProviderProps) {
  // Apply initial configuration if provided
  useMemo(() => {
    if (initialConfig) {
      Object.assign(Logger.config, initialConfig)
    }
  }, [initialConfig])

  // Function to update logger configuration
  const updateConfig = (config: Partial<LoggerConfig>) => {
    Object.assign(Logger.config, config)
  }

  const contextValue = useMemo(() => {
    return { logger: Logger, updateConfig }
  }, [])

  return (
    <LoggerContext.Provider value={contextValue}>
      {children}
    </LoggerContext.Provider>
  )
}

/**
 * Hook to access the logger context
 *
 * @returns The logger context
 */
export function useLoggerContext() {
  const context = useContext(LoggerContext)
  if (context === undefined) {
    throw new Error('useLoggerContext must be used within a LoggerProvider')
  }
  return context
}

export default LoggerProvider
