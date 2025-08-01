export type ApiCallStatus = 'pending' | 'success' | 'error' | 'cached'

export interface ApiCallLog {
  id: string
  timestamp: number
  endpoint: string
  method: 'GET' | 'POST' | 'GRAPHQL'
  status: ApiCallStatus
  duration?: number
  request?: {
    variables?: any
    headers?: Record<string, string>
  }
  response?: {
    data?: any
    error?: any
    cached?: boolean
  }
  source: 'kong' | 'yDaemon' | 'contract'
}

export interface DataTransformLog {
  id: string
  timestamp: number
  source: string
  input: any
  output: any
}

export class SdkDebugger {
  private static instance: SdkDebugger
  private apiLogs: ApiCallLog[] = []
  private dataLogs: DataTransformLog[] = []

  static getInstance(): SdkDebugger {
    if (!SdkDebugger.instance) {
      SdkDebugger.instance = new SdkDebugger()
    }
    return SdkDebugger.instance
  }

  logApiCall(log: ApiCallLog) {
    this.apiLogs.push(log)
    // Optionally: console.log('[SDK API]', log)
  }

  logDataTransform(log: DataTransformLog) {
    this.dataLogs.push(log)
    // Optionally: console.log('[SDK DATA]', log)
  }

  getApiLogs(): ApiCallLog[] {
    return this.apiLogs
  }

  getDataLogs(): DataTransformLog[] {
    return this.dataLogs
  }

  clearLogs() {
    this.apiLogs = []
    this.dataLogs = []
  }
}
