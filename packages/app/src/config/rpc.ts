export const resolveRpcUrls = (
  configuredUrl: string | undefined,
  publicUrl: string,
  chainDefaultUrl: string,
): string[] =>
  [...new Set([configuredUrl?.trim(), publicUrl, chainDefaultUrl])].filter((url): url is string =>
    Boolean(url),
  )
