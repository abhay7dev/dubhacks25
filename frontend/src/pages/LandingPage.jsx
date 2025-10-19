import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

// Helper function to get user display name
const getUserDisplayName = (user) => {
  if (!user) return 'User'
  
  // Debug: Log the entire user object to see its structure
  console.log('Full user object:', JSON.stringify(user, null, 2))
  
  // Priority 1: Try given_name (the actual name stored during signup)
  if (user.given_name && user.given_name.trim() !== '') {
    console.log('Found given_name:', user.given_name)
    return user.given_name
  }
  
  // Priority 2: Try the computed name field
  if (user.name && user.name.trim() !== '') {
    console.log('Found name:', user.name)
    return user.name
  }
  
  // Priority 3: Try email and extract name from it (fallback)
  if (user.email) {
    const name = user.email.split('@')[0]
    console.log('Extracted name from email:', name)
    return name
  }
  
  // Priority 4: Try username
  if (user.username) {
    console.log('Found username:', user.username)
    return user.username
  }
  
  // Fallback
  console.log('Using fallback: User')
  return 'User'
}

function LandingPage() {
  const { isAuthenticated, user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-mocha-mantle dark:via-mocha-base dark:to-mocha-crust transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-mocha-surface0/80 backdrop-blur-md border-b border-gray-200 dark:border-mocha-surface1 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ResuMAX
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 dark:text-mocha-text hover:text-blue-600 dark:hover:text-mocha-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-600 dark:text-mocha-text hover:text-blue-600 dark:hover:text-mocha-blue px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  How it Works
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600 dark:text-mocha-text">
                    Welcome, {getUserDisplayName(user)}!
                  </span>
                  <button
                    onClick={signOut}
                    className="text-gray-600 dark:text-mocha-text hover:text-blue-600 dark:hover:text-mocha-blue px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                  <Link 
                    to="/analyze"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-mocha-blue dark:to-mocha-mauve text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 dark:hover:from-mocha-sapphire dark:hover:to-mocha-pink transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Analyze Resume
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/signin"
                    className="text-gray-600 dark:text-mocha-text hover:text-blue-600 dark:hover:text-mocha-blue px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/signup"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-mocha-text mb-6">
              Transform Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-mocha-blue dark:to-mocha-mauve bg-clip-text text-transparent">
                Career Path
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-mocha-subtext0 mb-8 max-w-3xl mx-auto leading-relaxed">
              Get personalized recommendations for classes, projects, clubs, and skills based on your resume and career goals. 
              Let AI guide you to success at your dream companies.
            </p>
            <div className="flex justify-center">
              <Link 
                to="/analyze"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Analyze My Resume
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ResuMAX?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform analyzes your resume and provides actionable insights to accelerate your career growth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Smart Analysis</h3>
              <p className="text-gray-600">
                Advanced AI extracts key information from your resume including skills, experience, and education.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personalized Recommendations</h3>
              <p className="text-gray-600">
                Get tailored suggestions for classes, projects, and clubs based on your career goals and target companies.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Career Insights</h3>
              <p className="text-gray-600">
                Understand what skills and experiences are most valued by your target companies and industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get personalized career recommendations in just three simple steps.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Your Resume</h3>
              <p className="text-gray-600">
                Upload your resume in PDF or DOCX format. Our AI will extract and analyze all relevant information.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Set Your Goals</h3>
              <p className="text-gray-600">
                Tell us about your career aspirations, target companies, and areas of interest for personalized recommendations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive detailed suggestions for classes, projects, clubs, and skills to boost your career prospects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Accelerate Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have already transformed their career paths with ResuMAX.
          </p>
          <Link 
            to="/analyze"
            className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Start Your Analysis Now
          </Link>
        </div>
      </section>

    </div>
  )
}

export default LandingPage

