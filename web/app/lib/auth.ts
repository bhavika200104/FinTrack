import { PFT_BASE_URL } from '@/client/httpPFTClient'
// JWT auth library using cookies

const ACCESS_TOKEN_KEY = 'access'
const REFRESH_TOKEN_KEY = 'refresh'
const TOKEN_EXPIRY_KEY = 'token_expiry'
let authToken: string | null = null
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`
}

function getCookie(name: string): string | null {
  return (
    document.cookie
      .split('; ')
      .find((row) => row.startsWith(name + '='))
      ?.split('=')[1] || null
  )
}

function removeCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
}

export function setTokens(access: string, refresh: string) {
  const tokenData = JSON.parse(atob(access.split('.')[1]))
  const expiryTime = tokenData.exp * 1000 // Convert to milliseconds
  setCookie(ACCESS_TOKEN_KEY, access)
  setCookie(REFRESH_TOKEN_KEY, refresh)
  setCookie(TOKEN_EXPIRY_KEY, expiryTime.toString())
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY)
}

export function getTokenExpiry(): number | null {
  const expiry = getCookie(TOKEN_EXPIRY_KEY)
  return expiry ? parseInt(expiry) : null
}

export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  // Consider token expired 1 minute before actual expiration
  return Date.now() >= expiry - 60000
}

export function removeTokens() {
  removeCookie(ACCESS_TOKEN_KEY)
  removeCookie(REFRESH_TOKEN_KEY)
  removeCookie(TOKEN_EXPIRY_KEY)
}

export async function login(email: string, password: string) {
  const response = await fetch(`${PFT_BASE_URL}/api/token/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) {
    throw new Error('Invalid credentials')
  }
  const data = await response.json()
  setTokens(data.access, data.refresh)
  return data
}

export async function refreshAccessToken() {
  // Prevent multiple simultaneous refresh requests
  if (isRefreshing) {
    return new Promise((resolve) => {
      refreshSubscribers.push(resolve)
    })
  }

  isRefreshing = true
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    isRefreshing = false
    throw new Error('No refresh token available')
  }

  try {
    const response = await fetch(`${PFT_BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh access token')
    }

    const data = await response.json()
    // Update both the cookie and the in-memory token
    setAuthToken(data.access)

    // Update token expiry
    const tokenData = JSON.parse(atob(data.access.split('.')[1]))
    setCookie(TOKEN_EXPIRY_KEY, (tokenData.exp * 1000).toString())

    // Notify all subscribers about the new token
    refreshSubscribers.forEach((callback) => callback(data.access))
    refreshSubscribers = []

    return data.access
  } catch (error) {
    refreshSubscribers = []
    await logout()
    throw error
  } finally {
    isRefreshing = false
  }
}

export async function logout() {
  removeTokens()
  authToken = null
  window.location.href = '/login'
}

export function isLoggedIn(): boolean {
  const accessToken = getAccessToken()
  const refreshToken = getRefreshToken()
  if (accessToken && !isTokenExpired()) {
    return true
  }
  // If we have a refresh token, consider the user logged in
  return !!refreshToken
}

export async function getAuthToken(): Promise<string | null> {
  // First check cached token
  if (authToken && !isTokenExpired()) {
    return authToken
  }

  // Then check cookie token
  const accessToken = getAccessToken()
  if (accessToken && !isTokenExpired()) {
    authToken = accessToken
    return authToken
  }

  // If no valid access token exists, but we have a refresh token, try to refresh
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try {
      const newAccessToken = await refreshAccessToken()
      authToken = newAccessToken
      return newAccessToken
    } catch {
      // Only remove tokens and redirect to login if refresh actually failed
      await logout()
      return null
    }
  }

  // If we reach here, we have no valid tokens
  await logout()
  return null
}

export function setAuthToken(token: string) {
  authToken = token
  setCookie(ACCESS_TOKEN_KEY, token)
}

export async function getUser() {
  try {
    const token = await getAuthToken()
    if (!token) {
      throw new Error('No authentication token available')
    }

    const response = await fetch(`${PFT_BASE_URL}/api/v1/me/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData?.detail || 'Failed to fetch user data')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

export async function getUserId() {
  const accessToken = await getAccessToken()
  if (accessToken) {
    const payload = JSON.parse(atob(accessToken.split('.')[1]))
    return payload.user_id
  }
  return null
}

export async function register(email: string, password: string) {
  const response = await fetch(`${PFT_BASE_URL}/api/v1/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: email, email, password, confirm_password: password }),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData?.detail || 'Registration failed')
  }
  return await response.json()
}
