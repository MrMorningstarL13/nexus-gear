const DEFAULT_BACKEND_API = 'https://api-6xt627262q-ey.a.run.app'

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export const API_BASE_URL = (() => {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL
  if (configured && configured.trim()) {
    return trimTrailingSlash(configured.trim())
  }

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_BACKEND_API
  }

  return 'http://localhost:8080'
})()

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}