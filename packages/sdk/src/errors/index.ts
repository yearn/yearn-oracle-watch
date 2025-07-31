export class SdkError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'SdkError'
  }
}

export class NetworkError extends SdkError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown,
  ) {
    super(message, 'NETWORK_ERROR', { statusCode, response })
    this.name = 'NetworkError'
  }
}

export class GraphQLError extends SdkError {
  constructor(
    message: string,
    public readonly errors?: any[],
    public readonly query?: string,
  ) {
    super(message, 'GRAPHQL_ERROR', { errors, query })
    this.name = 'GraphQLError'
  }
}

export class ContractError extends SdkError {
  constructor(
    message: string,
    public readonly contractAddress?: string,
    public readonly method?: string,
    public readonly args?: unknown[],
  ) {
    super(message, 'CONTRACT_ERROR', { contractAddress, method, args })
    this.name = 'ContractError'
  }
}

export class ConfigurationError extends SdkError {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message, 'CONFIGURATION_ERROR', { field })
    this.name = 'ConfigurationError'
  }
}
