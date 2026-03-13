const WILDCARD_TOKEN_KEY = 'wildcardToken'
const WILDCARD_EMAIL_KEY = 'wildcardEmail'
const WILDCARD_NAME_KEY = 'wildcardName'

export function getWildcardToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(WILDCARD_TOKEN_KEY)
}

export function getWildcardEmail(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(WILDCARD_EMAIL_KEY)
}

export function getWildcardName(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(WILDCARD_NAME_KEY)
}

export function setWildcardAuth(token: string, email: string, name?: string) {
  localStorage.setItem(WILDCARD_TOKEN_KEY, token)
  localStorage.setItem(WILDCARD_EMAIL_KEY, email)
  if (name != null) localStorage.setItem(WILDCARD_NAME_KEY, name)
}

export function clearWildcardAuth() {
  localStorage.removeItem(WILDCARD_TOKEN_KEY)
  localStorage.removeItem(WILDCARD_EMAIL_KEY)
  localStorage.removeItem(WILDCARD_NAME_KEY)
}
