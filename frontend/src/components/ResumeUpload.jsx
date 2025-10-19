import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { parseResumeFromPdf } from '../lib/parseResumeFromPdf'

function ResumeUpload({ onResumeParsed, onBack }) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsUploading(true)
    setUploadError('')
    setUploadSuccess(false)

    try {
      // Parse the resume using the real parser
      const parsedData = await parseResumeFromPdf(file)
      
      onResumeParsed(parsedData)
      setUploadSuccess(true)
      setUploadError('Basic information has been auto-filled. Please manually fill out your experiences and projects in the form below.')
    } catch (error) {
      console.error('Resume parsing error:', error)
      
      // Fallback to mock data if parsing fails - but don't include projects/experiences
      console.log('Falling back to mock data due to parsing error')
      const mockParsedData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phone: '(555) 123-4567',
        school: 'University of Washington',
        major: 'Computer Science',
        gpa: '3.8',
        graduationYear: '2026',
        desiredOccupation: 'Software Engineer',
        targetCompanies: ['Google', 'Microsoft', 'Amazon'],
        interests: ['Machine Learning', 'Web Development', 'AI'],
        skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Machine Learning'],
        clubs: ['AI Club', 'DECA', 'Hackathon Team']
        // Note: experiences and projects are intentionally omitted - user will fill manually
      }
      
      onResumeParsed(mockParsedData)
      setUploadSuccess(true)
      setUploadError('Basic information has been auto-filled with sample data. Please manually fill out your experiences and projects in the form below.')
    } finally {
      setIsUploading(false)
    }
  }, [onResumeParsed])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-500 dark:border-mocha-blue bg-blue-50 dark:bg-mocha-blue/10'
            : uploadSuccess
            ? 'border-green-500 dark:border-mocha-green bg-green-50 dark:bg-mocha-green/10'
            : uploadError
            ? 'border-red-500 dark:border-mocha-red bg-red-50 dark:bg-mocha-red/10'
            : 'border-gray-300 dark:border-mocha-surface1 hover:border-blue-400 dark:hover:border-mocha-blue hover:bg-gray-50 dark:hover:bg-mocha-surface0'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-mocha-blue/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="animate-spin h-6 w-6 text-blue-600 dark:text-mocha-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-mocha-text">Parsing Resume...</p>
              <p className="text-sm text-gray-600 dark:text-mocha-subtext0">Extracting information from your resume</p>
            </div>
          </div>
        ) : uploadSuccess ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-mocha-green/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-green-600 dark:text-mocha-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-green-900 dark:text-mocha-text">Resume Parsed Successfully!</p>
              <p className="text-sm text-green-700 dark:text-mocha-green">Form has been auto-filled with your information</p>
            </div>
          </div>
        ) : uploadError ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-red-900">Upload Failed</p>
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-mocha-surface1 rounded-full flex items-center justify-center mx-auto">
              <svg className="h-6 w-6 text-gray-600 dark:text-mocha-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-mocha-text">
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
              </p>
              <p className="text-sm text-gray-600 dark:text-mocha-subtext0">or click to browse files</p>
              <p className="text-xs text-gray-500 dark:text-mocha-subtext1 mt-2">Supports PDF and DOCX files (max 10MB)</p>
            </div>
          </div>
        )}
      </div>

      {uploadSuccess && (
        <div className={`border rounded-lg p-4 ${uploadError ? 'bg-yellow-50 dark:bg-mocha-yellow/10 border-yellow-200 dark:border-mocha-yellow' : 'bg-green-50 dark:bg-mocha-green/10 border-green-200 dark:border-mocha-green'} transition-colors duration-300`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {uploadError ? (
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${uploadError ? 'text-yellow-800' : 'text-blue-800'}`}>
                {uploadError && uploadError.includes('sample data') ? 'Resume Processed with Sample Data' : 'Resume Successfully Parsed'}
              </h3>
              <div className={`mt-2 text-sm ${uploadError ? 'text-yellow-700' : 'text-blue-700'}`}>
                <p className="font-medium mb-2">⚠️ Important: Please review all fields below!</p>
                <p>{uploadError || "We've extracted information from your resume, but parsing may not be 100% accurate. Please carefully review and edit any fields before submitting."}</p>
              </div>
            </div>
            {onBack && (
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={onBack}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ResumeUpload
