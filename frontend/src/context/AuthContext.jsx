import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false)

  const openLoginDrawer = () => setIsLoginDrawerOpen(true)
  const closeLoginDrawer = () => setIsLoginDrawerOpen(false)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      authService.me()
        .then(({ data }) => setUser(data.user))
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const { data } = await authService.login(credentials)
    localStorage.setItem('access_token', data.tokens.access)
    localStorage.setItem('refresh_token', data.tokens.refresh)
    setUser(data.user)
    setIsLoginDrawerOpen(false)
    return data.user
  }

  const register = async (userData) => {
    await authService.register(userData)
  }

  const logout = async () => {
    const refresh = localStorage.getItem('refresh_token')
    try { await authService.logout(refresh) } catch {}
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout,
      isLoginDrawerOpen,
      openLoginDrawer,
      closeLoginDrawer
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
