import { randomBytes } from 'crypto'

/**
 * Simple in-memory SessionStore interface expected by router/middlewares.
 * Implement your concrete store elsewhere and pass it into router.
 */
export type Session = {
  token: string
  userId: string
  createdAt: number
  expiresAt?: number
}

export class SessionStore {
  private sessions = new Map<string, Session>()
  private defaultTtlMs: number

  constructor(opts?: { defaultTtlMs?: number }) {
    // default TTL: 8 hours
    this.defaultTtlMs = opts?.defaultTtlMs ?? 1000 * 60 * 60 * 8
  }

  create(userId: string): Session {
    const token = randomBytes(48).toString('hex')
    const now = Date.now()
    const session: Session = {
      token,
      userId,
      createdAt: now,
      expiresAt: now + this.defaultTtlMs
    }
    this.sessions.set(token, session)
    return session
  }

  get(token: string): Session | undefined {
    const session = this.sessions.get(token)
    if (!session) return undefined
    if (session.expiresAt && session.expiresAt <= Date.now()) {
      this.sessions.delete(token)
      return undefined
    }
    return session
  }

  delete(token: string): void {
    this.sessions.delete(token)
  }

  refresh(token: string, extendMs?: number): Session | undefined {
    const session = this.sessions.get(token)
    if (!session) return undefined
    const ttl = extendMs ?? this.defaultTtlMs
    const now = Date.now()
    session.expiresAt = now + ttl
    this.sessions.set(token, session)
    return session
  }

  clearExpired(): number {
    const now = Date.now()
    let removed = 0
    for (const [t, s] of this.sessions) {
      if (s.expiresAt && s.expiresAt <= now) {
        this.sessions.delete(t)
        removed++
      }
    }
    return removed
  }

  size(): number {
    return this.sessions.size
  }
}
