import { createContext, useContext, useState } from 'react'
import { updateUserProfile as persistProfile } from './localStorage.js'

const UserContext = createContext(null)

const USERS_KEY = 'cinamax_users'
const SESSION_KEY = 'cinamax_session'

// ─── Password hashing (SHA-256 via WebCrypto) ─────────────────────────────────
async function hashPassword(plain) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(plain)
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// ─── localStorage helpers ──────────────────────────────────────────────────────
const loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

const saveUsers = (users) => {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)) }
  catch (e) { console.error('saveUsers failed', e) }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  /** Sign in. Returns error string or null on success. */
  const signIn = async (username, password) => {
    const users = loadUsers()
    const rec = users[username]
    if (!rec) return 'Username not found.'
    const hashed = await hashPassword(password)
    if (rec.passwordHash !== hashed) return 'Incorrect password.'
    const user = buildSession(username, rec)
    persist(user)
    return null
  }

  /** Sign up. Returns error string or null on success. */
  const signUp = async (username, email, password) => {
    if (/\s/.test(username)) return 'Username cannot contain spaces.'
    if (username.length < 3) return 'Username must be at least 3 characters.'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address.'
    if (password.length < 6) return 'Password must be at least 6 characters.'
    const users = loadUsers()
    if (users[username]) return 'Username already taken.'
    const passwordHash = await hashPassword(password)
    const rec = {
      passwordHash, email,
      displayName: username,
      bio: '',
      avatarEmoji: '🎬',
      joinedAt: new Date().toISOString(),
    }
    users[username] = rec
    saveUsers(users)
    persist(buildSession(username, rec))
    return null
  }

  const signOut = () => {
    setCurrentUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  /**
   * Update profile fields: { displayName, bio, avatarEmoji }.
   * Persists to user store and refreshes session.
   */
  const updateProfile = (fields) => {
    if (!currentUser) return
    const users = loadUsers()
    if (!users[currentUser.username]) return
    const merged = { ...users[currentUser.username], ...fields }
    users[currentUser.username] = merged
    saveUsers(users)
    // Also update via localStorage helper for cross-module access
    persistProfile(currentUser.username, fields)
    const updated = buildSession(currentUser.username, merged)
    persist(updated)
  }

  // ─── helpers ────────────────────────────────────────────────────────────────
  function buildSession(username, rec) {
    return {
      username,
      email: rec.email,
      displayName: rec.displayName || username,
      bio: rec.bio || '',
      avatarEmoji: rec.avatarEmoji || '🎬',
      joinedAt: rec.joinedAt || new Date().toISOString(),
    }
  }

  function persist(user) {
    setCurrentUser(user)
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  }

  return (
    <UserContext.Provider value={{ currentUser, signIn, signUp, signOut, updateProfile }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>')
  return ctx
}