'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface UserData {
  id: string
  name: string
  email: string
}

interface UserContextType {
  user: UserData | null
  loading: boolean
  logout: () => Promise<void>
  fetchUser: () => Promise<void>
  setUserData: (userData: UserData) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const setUserData = (userData: UserData) => {
    setUser(userData)
  }

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        setUser(null)
        window.location.href = '/auth/login'
      }
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, logout, fetchUser, setUserData }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
