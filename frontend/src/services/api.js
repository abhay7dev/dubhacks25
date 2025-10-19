// API service layer for backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Import auth service for getting headers
import authService from './authService'
import { LAMBDA_ENDPOINTS } from '../config/api'

class ApiService {
  // Get authentication headers
  async getAuthHeaders() {
    try {
      const sessionResult = await authService.getCurrentSession()
      if (sessionResult.success) {
        const session = sessionResult.data
        console.log('🔍 Session structure:', session)
        
        // Try different ways to get the token
        let token = null
        if (session.tokens && session.tokens.idToken) {
          token = session.tokens.idToken.toString()
        } else if (session.getIdToken) {
          token = session.getIdToken().toString()
        } else if (session.idToken) {
          token = session.idToken
        }
        
        if (token) {
          console.log('✅ Got auth token')
          return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        } else {
          console.log('⚠️ No token found in session')
        }
      }
    } catch (error) {
      console.error('Error getting auth headers:', error)
    }
    
    console.log('📝 Using headers without auth token')
    return {
      'Content-Type': 'application/json'
    }
  }

  // Health check
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`)
    }
    return response.status === 200
  }

  // Resume parsing
  async parseResume(file) {
    const formData = new FormData()
    formData.append('resume', file)
    
    const response = await fetch(`${API_BASE_URL}/resume/parse`, {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) {
      throw new Error(`Resume parsing failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Get career recommendations from new Llama endpoint
  async getRecommendations(userProfile) {
    try {
      console.log('🤖 Getting recommendations from Llama endpoint...')
      
      // Format data according to new API schema
      const requestData = {
        desired_job: userProfile.desiredOccupation || '',
        student: userProfile.school || '',
        skills: Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : (userProfile.skills || ''),
        job_experience: Array.isArray(userProfile.experiences) 
          ? userProfile.experiences.map(exp => `${exp.position} at ${exp.company}`).join(', ')
          : '',
        clubs: Array.isArray(userProfile.clubs) ? userProfile.clubs.join(', ') : (userProfile.clubs || ''),
        projects: Array.isArray(userProfile.projects)
          ? userProfile.projects.map(proj => proj.name).join(', ')
          : ''
      }
      
      console.log('📊 Request data:', requestData)
      
      const response = await fetch('https://llama-endpoint.resumax.work/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Recommendations failed: ${response.status} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Llama response received:', data)
      
      // For now, just return the raw response
      return data
      
    } catch (error) {
      console.error('💥 Recommendations error:', error)
      throw error
    }
  }

  // Chatbot responses using Gemini Lambda
  async getChatbotResponse(message, userProfile, recommendations, previousChats = []) {
    try {
      console.log('🤖 Getting chatbot response from Gemini Lambda...')
      
      // Get user ID from JWT token
      const headers = await this.getAuthHeaders()
      let userId = 'authenticated_user'
      
      try {
        if (headers.Authorization) {
          const token = headers.Authorization.replace('Bearer ', '')
          const payload = JSON.parse(atob(token.split('.')[1]))
          userId = payload.sub || payload['cognito:username'] || payload.email || 'authenticated_user'
          console.log('✅ Extracted user ID from JWT for chatbot:', userId)
        }
      } catch (tokenError) {
        console.log('⚠️ Could not extract user ID from token:', tokenError.message)
      }
      
      // Format request data to match Lambda expectations
      const requestData = {
        userId: userId,
        message: message
        // Note: Lambda gets resume data and recommendations from DynamoDB directly
        // using the userId, so we don't need to send userProfile/recommendations
      }
      
      console.log('📊 Chatbot request data:', requestData)
      
      // Gemini Lambda endpoint for chatbot
      const response = await fetch('https://3tau6691m5.execute-api.us-east-1.amazonaws.com/gemc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Chatbot API error:', response.status, errorText)
        throw new Error(`Chatbot failed: ${response.status} - ${errorText}`)
      }
      
      const result = await response.json()
      console.log('✅ Chatbot response received:', result)
      
      return result
    } catch (error) {
      console.error('💥 Chatbot error:', error)
      throw error
    }
  }


  // Save user profile
  async saveProfile(userProfile) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'POST',
      headers,
      body: JSON.stringify(userProfile)
    })
    
    if (!response.ok) {
      throw new Error(`Profile save failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Get user profile
  async getProfile(userId) {
    const response = await fetch(`${API_BASE_URL}/profile/${userId}`)
    
    if (!response.ok) {
      throw new Error(`Profile fetch failed: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Save user resume data to DynamoDB via Lambda
  async saveUserData(userData) {
    try {
      console.log('🔄 Saving user data to DynamoDB via Lambda...')
      console.log('📡 Endpoint:', LAMBDA_ENDPOINTS.SAVE_USER)
      
      // Extract user ID from JWT token
      const headers = await this.getAuthHeaders()
      let userId = 'authenticated_user'
      
      try {
        if (headers.Authorization) {
          const token = headers.Authorization.replace('Bearer ', '')
          const payload = JSON.parse(atob(token.split('.')[1]))
          userId = payload.sub || payload['cognito:username'] || payload.email || 'authenticated_user'
          console.log('✅ Extracted user ID from JWT for POST:', userId)
        }
      } catch (tokenError) {
        console.log('⚠️ Could not extract user ID from token:', tokenError.message)
      }
      
      console.log('👤 Using user ID for save:', userId)
      
      // Add user identification to the data
      const dataWithUserInfo = {
        ...userData,
        userId: userId,
        timestamp: new Date().toISOString()
      }
      
      console.log('📊 Data being sent:', dataWithUserInfo)
      
      const response = await fetch(LAMBDA_ENDPOINTS.SAVE_USER, {
        method: 'POST',
        headers,
        body: JSON.stringify(dataWithUserInfo)
      })
  
      console.log('📨 Response status:', response.status)
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Save failed:', response.status, errorText)
        throw new Error(`Save user data failed: ${response.status} - ${errorText}`)
      }
  
      const result = await response.json()
      console.log('✅ Save successful:', result)
      return result
    } catch (error) {
      console.error('💥 Save error:', error)
      throw error
    }
  }

  // Get user ID for data storage
  getUserId() {
    // Don't return a user ID - let the Lambda handle this
    throw new Error('User ID should be provided by the calling function')
  }

  // Get user resume data from DynamoDB via Lambda
  async getUserData() {
    try {
      console.log('🔄 Loading user data from DynamoDB via Lambda...')
      console.log('📡 Endpoint:', LAMBDA_ENDPOINTS.SAVE_USER)
      
      // Get user ID from JWT token
      const headers = await this.getAuthHeaders()
      let userId = 'authenticated_user' // Fallback
      
      try {
        // Extract user ID from JWT token in Authorization header
        if (headers.Authorization) {
          const token = headers.Authorization.replace('Bearer ', '')
          const payload = JSON.parse(atob(token.split('.')[1]))
          userId = payload.sub || payload['cognito:username'] || payload.email || 'authenticated_user'
          console.log('✅ Extracted user ID from JWT for GET:', userId)
        }
      } catch (tokenError) {
        console.log('⚠️ Could not extract user ID from token, using fallback:', tokenError.message)
      }
      
      console.log('👤 User ID for GET request:', userId)
      
      // Add user ID as query parameter so Lambda knows which user's data to retrieve
      const urlWithParams = `${LAMBDA_ENDPOINTS.SAVE_USER}?userId=${encodeURIComponent(userId)}`
      console.log('📡 Full GET URL:', urlWithParams)
      
      const response = await fetch(urlWithParams, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
  
      console.log('📨 Response status:', response.status)
  
      if (response.status === 404) {
        console.log('ℹ️ No user data found (404) - this is a new user')
        return null
      }
  
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Load failed:', response.status, errorText)
        throw new Error(`Get user data failed: ${response.status} - ${errorText}`)
      }
  
      const result = await response.json()
      console.log('✅ Load successful:', result)
      
      // Return the actual data, not the wrapper
      if (result.data) {
        return result.data
      }
      return result
    } catch (error) {
      console.error('💥 Load error:', error)
      // Return null instead of throwing so the app continues for new users
      return null
    }
  }

  // Update user resume data in DynamoDB via Lambda
  async updateUserData(userData) {
    try {
      console.log('🔄 Updating user data in DynamoDB via Lambda...')
      console.log('📡 Endpoint:', LAMBDA_ENDPOINTS.SAVE_USER)
      console.log('📊 Data being sent:', userData)
      
      const headers = await this.getAuthHeaders()
      console.log('🔑 Headers:', headers)
      
      const response = await fetch(LAMBDA_ENDPOINTS.SAVE_USER, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData)
      })

      console.log('📨 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Update failed:', response.status, errorText)
        throw new Error(`Update user data failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Update successful:', result)
      return result
    } catch (error) {
      console.error('💥 Update error:', error)
      throw error
    }
  }
}

export default new ApiService()
