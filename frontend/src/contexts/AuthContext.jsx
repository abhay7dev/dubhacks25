import React, { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const result = await authService.getCurrentUser()
      if (result.success) {
        // Get session to access user details
        const sessionResult = await authService.getCurrentSession()
        let userData = result.data
        
        if (sessionResult.success) {
          // Extract user details from session
          const session = sessionResult.data
          const tokens = session.tokens
          if (tokens && tokens.idToken) {
            const payload = tokens.idToken.payload
            userData = {
              ...result.data,
              username: payload.email || payload['cognito:username'],
              email: payload.email,
              userId: payload.sub,
              given_name: payload.given_name,
              name: payload.given_name || payload.email?.split('@')[0]
            }
            
            // Debug: Log the JWT payload to see what's available
            console.log('JWT Payload:', payload)
            console.log('Extracted given_name:', payload.given_name)
          }
        }
        
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    const result = await authService.signIn(email, password)
    if (result.success) {
      // Get session to access user details
      const sessionResult = await authService.getCurrentSession()
      let userData = result.data
      
      if (sessionResult.success) {
        // Extract user details from session
        const session = sessionResult.data
        const tokens = session.tokens
        if (tokens && tokens.idToken) {
          const payload = tokens.idToken.payload
          userData = {
            ...result.data,
            username: payload.email || payload['cognito:username'],
            email: payload.email,
            userId: payload.sub,
            given_name: payload.given_name,
            name: payload.given_name || payload.email?.split('@')[0]
          }
          
          // Debug: Log the JWT payload to see what's available
          console.log('SignIn JWT Payload:', payload)
          console.log('SignIn Extracted given_name:', payload.given_name)
        }
      }
      
      setUser(userData)
      setIsAuthenticated(true)
    }
    return result
  }

  const signUp = async (email, password, name) => {
    const result = await authService.signUp(email, password, name)
    return result
  }

  const signOut = async () => {
    const result = await authService.signOut()
    if (result.success) {
      setUser(null)
      setIsAuthenticated(false)
    }
    return result
  }

  const confirmSignUp = async (email, code) => {
    const result = await authService.confirmSignUp(email, code)
    return result
  }

  const resendSignUpCode = async (email) => {
    const result = await authService.resendSignUpCode(email)
    return result
  }

  const forgotPassword = async (email) => {
    const result = await authService.forgotPassword(email)
    return result
  }

  const resetPassword = async (email, code, newPassword) => {
    const result = await authService.resetPassword(email, code, newPassword)
    return result
  }

  const getAuthHeaders = async () => {
    try {
      const sessionResult = await authService.getCurrentSession()
      if (sessionResult.success) {
        const token = sessionResult.data.getIdToken().getJwtToken()
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    } catch (error) {
      console.error('Error getting auth headers:', error)
    }
    return {
      'Content-Type': 'application/json'
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
    confirmSignUp,
    resendSignUpCode,
    forgotPassword,
    resetPassword,
    getAuthHeaders,
    checkAuthState
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
