// src/config/api.js
// New AWS API Gateway base URL
export const API_BASE_URL = 'https://3tau6691m5.execute-api.us-east-1.amazonaws.com'

// API Gateway endpoints
export const API_ENDPOINTS = {
  DATABASE: `${API_BASE_URL}/db`,
  GEMINI_CHAT: `${API_BASE_URL}/gemc`,
  USER: `${API_BASE_URL}/user`
}

// New Llama recommendation endpoint
export const RECOMMENDATION_ENDPOINT = 'https://llama-endpoint.resumax.work/generate'

// Legacy Lambda endpoints (deprecated)
export const LAMBDA_ENDPOINTS = {
  SAVE_USER: API_ENDPOINTS.USER,
  GET_RECOMMENDATIONS: RECOMMENDATION_ENDPOINT
}

export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/user`, { method: 'OPTIONS' })
    return response.ok
  } catch (error) {
    console.error("Backend health check failed:", error)
    return false
  }
}
