import { signUp, signIn, signOut, getCurrentUser, fetchAuthSession, confirmSignUp, resendSignUpCode, resetPassword } from 'aws-amplify/auth'

class AuthService {
  // Sign up a new user
  async signUp(email, password, name) {
    try {
      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            given_name: name,
            email: email,
            name: name,  // Add this for name.formatted requirement
          },
        },
      })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Sign in an existing user
  async signIn(email, password) {
    try {
      const user = await signIn({ username: email, password })
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Sign out the current user
  async signOut() {
    try {
      await signOut()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get current authenticated user
  async getCurrentUser() {
    try {
      const user = await getCurrentUser()
      return { success: true, data: user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      const session = await fetchAuthSession()
      return { success: true, data: session }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Confirm sign up with verification code
  async confirmSignUp(email, code) {
    try {
      const result = await confirmSignUp({ username: email, confirmationCode: code })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Resend verification code
  async resendSignUpCode(email) {
    try {
      const result = await resendSignUpCode({ username: email })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const result = await resetPassword({ username: email })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Reset password with code
  async resetPassword(email, code, newPassword) {
    try {
      const result = await resetPassword({ username: email, confirmationCode: code, newPassword })
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

export default new AuthService()