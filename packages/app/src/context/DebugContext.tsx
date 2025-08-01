import React, { createContext, useContext, useState, useCallback } from 'react'

export type LogLevel = 'verbose' | 'info' | 'warn' | 'error'
export type DebugModule = 'api' | 'hooks' | 'rendering' | 'cache' | 'performance'

export interface DebugLog {
  id: string
  timestamp: number
  level: LogLevel
  module: DebugModule
  source: string
  message: string
  data?: any
}

interface DebugContextType {
  isEnabled: boolean
  logLevel: LogLevel
  enabledModules: DebugModule[]
  toggleModule: (module: DebugModule) => void
  setLogLevel: (level: LogLevel) => void
  clearLogs: () => void
  logs: DebugLog[]
  addLog: (log: DebugLog) => void
}

const DebugContext = createContext<DebugContextType | null>(null)

export const DebugProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(
    process.env.NODE_ENV === 'development' || window.location.search.includes('debug=true')
  )
  const [logLevel, setLogLevel] = useState<LogLevel>('info')
  const [enabledModules, setEnabledModules] = useState<DebugModule[]>(['api', 'hooks'])
  const [logs, setLogs] = useState<DebugLog[]>([])

  const toggleModule = useCallback((module: DebugModule) => {
    setEnabledModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    )
  }, [])

  const clearLogs = useCallback(() => setLogs([]), [])

  const addLog = useCallback((log: DebugLog) => {
    setLogs((prev) => [...prev, log])
  }, [])

  return (
    <DebugContext.Provider
      value={{
        isEnabled,
        logLevel,
        enabledModules,
        toggleModule,
        setLogLevel,
        clearLogs,
        logs,
        addLog,
      }}
    >
      {children}
    </DebugContext.Provider>
  )
}

export const useDebugContext = () => {
  const context = useContext(DebugContext)
  if (!context) throw new Error('useDebugContext must be used within a DebugProvider')
  return context
}
