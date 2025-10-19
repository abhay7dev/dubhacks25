import { useState, useEffect } from 'react'
import ResumeUpload from '../components/ResumeUpload'
import ProfileForm from '../components/ProfileForm'
import CareerChatbot from '../components/CareerChatbot'
import ActionPlan from '../components/ActionPlan'
import ApiService from '../services/api'
import { useAuth } from '../contexts/AuthContext'

function ResumeAnalysis() {
  const { isAuthenticated, user } = useAuth()
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Education
    school: '',
    major: '',
    gpa: '',
    graduationYear: '',
    
    // Career Goals
    desiredOccupation: '',
    targetCompanies: [],
    interests: [],
    
    // Experience
    experiences: [],
    
    // Skills
    skills: [],
    
    // Projects
    projects: [],
    
    // Clubs/Activities
    clubs: []
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [isSavingData, setIsSavingData] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [recommendations, setRecommendations] = useState(null)

  // Load user data from DynamoDB when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      console.log('🔍 Auth check - isAuthenticated:', isAuthenticated, 'dataLoaded:', dataLoaded)
      console.log('👤 User object:', user)
      if (isAuthenticated && user && user.userId && !dataLoaded) {
        setIsLoadingData(true)
        try {
          console.log('📥 Loading user data from DynamoDB...')
          const userData = await ApiService.getUserData()
          
          // Only process data if it has actual content
          if (userData && userData.formData && Object.keys(userData.formData).length > 0) {
            setFormData(userData.formData)
            console.log('✅ User profile data loaded successfully!')
          }
          
          if (userData && userData.recommendations && Object.keys(userData.recommendations).length > 0) {
            setRecommendations(userData.recommendations)
            setAnalysisComplete(true)
            setActiveTab('recommendations') // Skip directly to results
            console.log('✅ Previous recommendations loaded - skipping to results!')
          } else {
            console.log('ℹ️ No recommendations data found, staying on upload page')
          }
          
          if (userData && userData.lastUpdated) {
            console.log('📅 Data last updated:', userData.lastUpdated)
          }
          
          setDataLoaded(true)
        } catch (error) {
          console.log('ℹ️ No existing user data found or error loading:', error.message)
          setDataLoaded(true)
        } finally {
          setIsLoadingData(false)
        }
      }
    }

    loadUserData()
  }, [isAuthenticated, dataLoaded])

  const handleResumeParsed = (parsedData) => {
    setFormData(prev => ({
      ...prev,
      ...parsedData
    }))
    // Just parse the resume, don't generate recommendations yet
    console.log('✅ Resume parsed, ready for user to review and submit')
    setActiveTab('profile') // Go to profile form for review
  }

  const handleBackToHome = () => {
    window.location.href = '/'
  }

  const handleActivityComplete = async (activityData) => {
    try {
      console.log('📝 Activity completed:', activityData)
      
      // Save activity completion to database
      if (isAuthenticated) {
        const updatedRecommendations = {
          ...recommendations,
          completedActivities: {
            ...(recommendations?.completedActivities || {}),
            [`${activityData.phaseIndex}-${activityData.taskIndex}`]: {
              task: activityData.task,
              completed: activityData.completed,
              completedAt: activityData.completed ? new Date().toISOString() : null
            }
          }
        }
        
        await ApiService.saveUserData({
          formData: formData,
          recommendations: updatedRecommendations,
          completedActivities: updatedRecommendations.completedActivities,
          lastUpdated: new Date().toISOString()
        })
        
        console.log('✅ Activity completion saved to database!')
      }
    } catch (error) {
      console.error('❌ Failed to save activity completion:', error)
    }
  }

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const renderRecommendations = () => {
    if (recommendations) {
      console.log('🔍 Rendering recommendations:', recommendations)
      
      // Render raw API response
      return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your AI-Generated Career Recommendations</h2>
            <p className="text-purple-600 font-medium">🦙 Powered by Llama LLM!</p>
          </div>
            
          {/* Raw Llama Response */}
          <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Raw Llama API Response</h3>
            <pre className="text-sm text-gray-800 overflow-auto max-h-96 p-4 bg-white rounded border border-gray-300">
              {JSON.stringify(recommendations, null, 2)}
            </pre>
          </div>
        </div>
      )
    } else {
      // Show message that no recommendations are available
      return (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your AI-Generated Career Recommendations</h2>
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg">No recommendations available. Please try submitting your form again.</div>
          </div>
        </div>
      )
    }
  }

  const handleSubmit = async () => {
    setIsAnalyzing(true)
    setRecommendations(null) // Clear any previous recommendations
    
    try {
      // Try to get recommendations from Lambda
      console.log('Sending data to Lambda:', formData)
      const recommendationsData = await ApiService.getRecommendations(formData)
      
      // Store the recommendations in state
      console.log('✅ Lambda response received:', recommendationsData)
      setRecommendations(recommendationsData)
      
            // Only save data to DynamoDB if user is properly authenticated
            console.log('🔐 Authentication status:', isAuthenticated)
            console.log('👤 User:', user)
            
            if (isAuthenticated && user && user.userId) {
        setIsSavingData(true)
        try {
          console.log('💾 Saving user data to DynamoDB...')
          console.log('📋 Form data:', formData)
          console.log('📋 Recommendations data:', recommendationsData)
          
          const dataToSave = {
            formData: formData,
            recommendations: recommendationsData,
            completedActivities: recommendationsData?.completedActivities || {},
            lastUpdated: new Date().toISOString()
          }
          console.log('📦 Data structure being saved:', JSON.stringify(dataToSave, null, 2))
          
          await ApiService.saveUserData(dataToSave)
          console.log('✅ User data saved to DynamoDB successfully!')
          setShowSaveSuccess(true)
          setTimeout(() => setShowSaveSuccess(false), 3000)
        } catch (saveError) {
          console.error('❌ Failed to save to DynamoDB:', saveError.message)
          console.error('❌ Full error:', saveError)
          // Show a subtle notification to user
          alert(`⚠️ Analysis completed, but failed to save to cloud storage. Error: ${saveError.message}`)
        } finally {
          setIsSavingData(false)
        }
      } else {
        console.log('ℹ️ User not authenticated - skipping database save')
      }
      
      setIsAnalyzing(false)
      setAnalysisComplete(true)
      setActiveTab('recommendations') // Go to results after successful analysis
    } catch (error) {
      console.error('❌ Lambda API call failed:', error.message)
      
      // Show error instead of dummy data
      setIsAnalyzing(false)
      alert(`API Error: ${error.message}\n\nPlease check your Lambda function or try again later.`)
    }
  }

  if (analysisComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-mocha-mantle dark:via-mocha-base dark:to-mocha-crust py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            {/* Back Button */}
            <div className="flex justify-start mb-6">
              <button
                onClick={() => {
                  window.location.href = '/'
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
            
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Complete!</h1>
            <p className="text-gray-600">Your personalized AI-powered career recommendations are ready.</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-2 shadow-lg">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'recommendations'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  📊 Recommendations
                </button>
                <button
                  onClick={() => setActiveTab('actionplan')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'actionplan'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  🎯 Action Plan
                </button>
                <button
                  onClick={() => setShowChatbot(true)}
                  className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:text-blue-600 transition-all duration-200 hover:bg-blue-50"
                >
                  💬 Ask AI Advisor
                </button>
              </div>
            </div>
          </div>

          {activeTab === 'recommendations' && renderRecommendations()}
          
          {activeTab === 'recommendations-old' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your AI-Generated Career Recommendations</h2>
            
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Recommended Classes</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <span className="text-blue-600 font-medium">CS 411 - Database Systems</span>
                          <p className="text-sm text-gray-600 mt-1">Master SQL, NoSQL, and distributed systems for backend development</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-blue-500 font-semibold">95% match</span>
                          <p className="text-xs text-gray-500">High Priority</p>
                        </div>
                      </li>
                      <li className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-1">
                          <span className="text-blue-600 font-medium">CS 450 - Machine Learning</span>
                          <p className="text-sm text-gray-600 mt-1">Build AI/ML foundation with hands-on projects and algorithms</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-blue-500 font-semibold">92% match</span>
                          <p className="text-xs text-gray-500">High Priority</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Project Ideas</h3>
                    <ul className="space-y-3">
                      <li className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="text-purple-600 font-medium">Full-Stack Web Application</span>
                            <p className="text-sm text-gray-600 mt-1">Build a complete web app using React, Node.js, and PostgreSQL to showcase end-to-end development skills</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">React</span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Node.js</span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">PostgreSQL</span>
                            </div>
                          </div>
                          <span className="text-sm text-purple-500 font-semibold">High Impact</span>
                        </div>
                      </li>
                      <li className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="text-purple-600 font-medium">Machine Learning Portfolio Project</span>
                            <p className="text-sm text-gray-600 mt-1">Develop and deploy an ML model with real-world data to demonstrate AI capabilities</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Python</span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">TensorFlow</span>
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">Jupyter</span>
                            </div>
                          </div>
                          <span className="text-sm text-purple-500 font-semibold">High Impact</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Skills to Develop</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <span className="text-green-600 font-medium">Docker & Kubernetes</span>
                          <p className="text-sm text-gray-600 mt-1">Containerization and orchestration - essential for modern software development</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-green-500 font-semibold">High Demand</span>
                          <p className="text-xs text-gray-500">3-6 months</p>
                        </div>
                      </li>
                      <li className="flex items-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-1">
                          <span className="text-green-600 font-medium">Cloud Computing (AWS)</span>
                          <p className="text-sm text-gray-600 mt-1">Master cloud platforms for scalable application deployment</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-green-500 font-semibold">Essential</span>
                          <p className="text-xs text-gray-500">2-4 months</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">👥 Recommended Clubs</h3>
                    <ul className="space-y-3">
                      <li className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="text-orange-600 font-medium">AI Club</span>
                            <p className="text-sm text-gray-600 mt-1">Join workshops, network with peers, and collaborate on ML projects</p>
                            <div className="text-xs text-orange-600 mt-1">Weekly meetings • Guest speakers • Project collaborations</div>
                          </div>
                          <span className="text-sm text-orange-500 font-semibold">Join Now</span>
                        </div>
                      </li>
                      <li className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <span className="text-orange-600 font-medium">Hackathon Team</span>
                            <p className="text-sm text-gray-600 mt-1">Build projects, compete in events, and develop rapid prototyping skills</p>
                            <div className="text-xs text-orange-600 mt-1">Monthly events • Team building • Portfolio projects</div>
                          </div>
                          <span className="text-sm text-orange-500 font-semibold">Join Now</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                  <div className="text-sm text-gray-600">
                    💡 <strong>Pro Tip:</strong> Click "Ask AI Advisor" to get personalized answers about any recommendation!
                  </div>
                  <button 
                    onClick={() => {
                      setAnalysisComplete(false)
                      setRecommendations(null)
                      setFormData({
                        firstName: '', lastName: '', email: '', phone: '',
                        school: '', major: '', gpa: '', graduationYear: '',
                        desiredOccupation: '', targetCompanies: [], interests: [],
                        experiences: [], skills: [], projects: [], clubs: []
                      })
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    Analyze Another Resume
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actionplan' && (
            <ActionPlan userProfile={formData} recommendations={recommendations} onActivityComplete={handleActivityComplete} />
          )}

          {showChatbot && (
            <CareerChatbot 
              userProfile={formData} 
              recommendations={recommendations}
              onClose={() => setShowChatbot(false)} 
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-mocha-mantle dark:via-mocha-base dark:to-mocha-crust transition-colors duration-300">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-mocha-surface0/80 backdrop-blur-md border-b border-gray-200 dark:border-mocha-surface1 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-mocha-blue dark:to-mocha-mauve bg-clip-text text-transparent">
                ResuMAX
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="text-gray-600 dark:text-mocha-text hover:text-blue-600 dark:hover:text-mocha-blue px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading indicator for DynamoDB data */}
        {isLoadingData && (
          <div className="text-center mb-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-mocha-subtext0">
              Loading your saved data from DynamoDB...
            </p>
          </div>
        )}

        {/* Saving indicator */}
        {isSavingData && (
          <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm font-medium">Saving to cloud storage...</span>
            </div>
          </div>
        )}

        {/* Save success indicator */}
        {showSaveSuccess && (
          <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">Data saved successfully!</span>
            </div>
          </div>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-mocha-text mb-4">
            Analyze Your Resume
          </h1>
          <p className="text-xl text-gray-600 dark:text-mocha-subtext0 max-w-2xl mx-auto">
            Upload your resume to get personalized recommendations, or fill out the form manually.
          </p>
          {isAuthenticated && (
            <p className="text-sm text-green-600 dark:text-mocha-green mt-2">
              🔒 Your data is automatically saved to DynamoDB
            </p>
          )}
        </div>

        <div className={`grid gap-8 ${dataLoaded && Object.keys(formData).length > 0 ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
          {/* Resume Upload - Only show if no existing data */}
          {!(dataLoaded && Object.keys(formData).length > 0) && (
            <div className="bg-white dark:bg-mocha-surface0 rounded-2xl shadow-xl p-8 transition-colors duration-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-mocha-text mb-6">Upload Resume</h2>
              <ResumeUpload onResumeParsed={handleResumeParsed} onBack={handleBackToHome} />
            </div>
          )}

          {/* Manual Form */}
          <div className="bg-white dark:bg-mocha-surface0 rounded-2xl shadow-xl p-8 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
              {Object.values(formData).some(value => 
                Array.isArray(value) ? value.length > 0 : value !== ''
              ) && (
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Partially Auto-filled
                </div>
              )}
            </div>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">📝 Manual Entry Required</p>
                  <p>Please fill out the <strong>Experience</strong> and <strong>Projects</strong> sections manually for the most accurate recommendations.</p>
                </div>
              </div>
            </div>
            <ProfileForm 
              formData={formData} 
              onChange={handleFormChange}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isAnalyzing ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Resume...
              </div>
            ) : (
              'Generate New Recommendations'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResumeAnalysis
