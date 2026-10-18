/**
 * API Base URL configuration.
 * In development, defaults to http://localhost:4000 if not specified.
 * In production, defaults to relative path '' (same origin) or VITE_API_URL if hosted separately.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:4000' : '')
