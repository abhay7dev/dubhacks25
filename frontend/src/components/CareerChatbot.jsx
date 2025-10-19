import { useState, useRef, useEffect } from 'react'
import ApiService from '../services/api'

function CareerChatbot({ userProfile, recommendations, onClose }) {
  const [messages, setMessages] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history on component mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        console.log('📥 Loading chat history from Lambda...')
        const userData = await ApiService.getUserData()
        
        if (userData && userData.previousChats && userData.previousChats.length > 0) {
          console.log('✅ Found chat history:', userData.previousChats)
          setMessages(userData.previousChats)
        } else {
          // No chat history, show welcome message
          console.log('ℹ️ No chat history found, showing welcome message')
          setMessages([
            {
              id: 1,
              type: 'ai',
              content: `Hi ${userProfile.firstName || 'there'}! 👋 I'm your AI Career Advisor powered by Gemini. I've analyzed your resume and I'm excited to help you maximize your career potential! 

I can answer questions about:
• Your resume and how to improve it
• Specific recommendations from your action plan
• Career path guidance  
• Skill development strategies
• Interview preparation

What would you like to know more about?`,
              timestamp: new Date()
            }
          ])
        }
      } catch (error) {
        console.log('ℹ️ Could not load chat history, showing welcome message:', error.message)
        setMessages([
          {
            id: 1,
            type: 'ai',
            content: `Hi ${userProfile.firstName || 'there'}! 👋 I'm your AI Career Advisor powered by Gemini. I'm here to help you with your career journey!

What would you like to know more about?`,
            timestamp: new Date()
          }
        ])
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadChatHistory()
  }, [userProfile.firstName])

  const quickQuestions = [
    "How can I improve my resume?",
    "What are my biggest strengths?",
    "What skills should I develop?",
    "How do I prepare for interviews?",
    "What should I focus on next?",
    "Tell me about my action plan"
  ]


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      console.log('🤖 Sending message to Gemini Lambda...')
      
      const response = await ApiService.getChatbotResponse(
        currentMessage,
        userProfile,
        recommendations,
        []
      )
      
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response || response.message || response.content || 'I apologize, but I encountered an issue generating a response. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, aiResponse])
      console.log('✅ Gemini response received and displayed')
      
    } catch (error) {
      console.error('❌ Chatbot API error:', error)
      
      // Show error message instead of placeholder
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: `I'm sorry, I'm having trouble connecting to my AI service right now. Error: ${error.message}. Please try again in a moment.`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickQuestion = (question) => {
    setInputValue(question)
    handleSendMessage()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Career Advisor</h3>
              <p className="text-sm text-gray-500">Your personal AI assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingHistory ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading chat history...</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          )))}
          
          {isTyping && !isLoadingHistory && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything about your career path..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CareerChatbot

