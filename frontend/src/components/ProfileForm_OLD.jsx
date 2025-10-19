import { useState } from 'react'

function ProfileForm({ formData, onChange }) {
  const [activeTab, setActiveTab] = useState('personal')

  const tabs = [
    { id: 'personal', label: 'Personal', icon: '👤' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'career', label: 'Career Goals', icon: '🎯' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'skills', label: 'Skills', icon: '🛠️' },
    { id: 'projects', label: 'Projects', icon: '🚀' }
  ]

  const handleInputChange = (field, value) => {
    onChange(field, value)
  }

  const handleArrayInputChange = (field, value) => {
    // Store the raw string value for display, but also process it for the data
    const items = value.split(',').map(item => item.trim()).filter(item => item)
    onChange(field, items)
  }

  const handleArrayInputDisplay = (field, value) => {
    // This handles the display value without immediately converting to array
    onChange(field, value)
  }

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-mocha-text mb-1">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-mocha-surface1 bg-white dark:bg-mocha-surface0 text-gray-900 dark:text-mocha-text rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-mocha-blue focus:border-transparent"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-mocha-text mb-1">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-mocha-surface1 bg-white dark:bg-mocha-surface0 text-gray-900 dark:text-mocha-text rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-mocha-blue focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-mocha-text mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-mocha-surface1 bg-white dark:bg-mocha-surface0 text-gray-900 dark:text-mocha-text rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-mocha-blue focus:border-transparent"
          placeholder="your.email@example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-mocha-text mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-mocha-surface1 bg-white dark:bg-mocha-surface0 text-gray-900 dark:text-mocha-text rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-mocha-blue focus:border-transparent"
          placeholder="(555) 123-4567"
        />
      </div>
    </div>
  )

  const renderEducation = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">School/University</label>
        <input
          type="text"
          value={formData.school}
          onChange={(e) => handleInputChange('school', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="University of Washington"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
          <input
            type="text"
            value={formData.major}
            onChange={(e) => handleInputChange('major', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Computer Science"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
          <input
            type="text"
            value={formData.gpa}
            onChange={(e) => handleInputChange('gpa', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="3.8"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
        <input
          type="text"
          value={formData.graduationYear}
          onChange={(e) => handleInputChange('graduationYear', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="2026"
        />
      </div>
    </div>
  )

  const renderCareerGoals = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Desired Occupation</label>
        <input
          type="text"
          value={formData.desiredOccupation}
          onChange={(e) => handleInputChange('desiredOccupation', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Software Engineer"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Target Companies</label>
        <input
          type="text"
          value={Array.isArray(formData.targetCompanies) ? formData.targetCompanies.join(', ') : (formData.targetCompanies || '')}
          onChange={(e) => {
            // Update the display value immediately
            const newValue = e.target.value
            onChange('targetCompanies', newValue)
          }}
          onBlur={(e) => {
            // Process into array when user finishes typing
            const items = e.target.value.split(',').map(item => item.trim()).filter(item => item)
            onChange('targetCompanies', items)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Google, Microsoft, Amazon"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple companies with commas</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Areas of Interest</label>
        <input
          type="text"
          value={Array.isArray(formData.interests) ? formData.interests.join(', ') : (formData.interests || '')}
          onChange={(e) => {
            // Update the display value immediately
            const newValue = e.target.value
            onChange('interests', newValue)
          }}
          onBlur={(e) => {
            // Process into array when user finishes typing
            const items = e.target.value.split(',').map(item => item.trim()).filter(item => item)
            onChange('interests', items)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Machine Learning, Web Development, AI"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple interests with commas</p>
      </div>
    </div>
  )

  const renderExperience = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Work Experience</label>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            📝 Manual Entry Required
          </span>
        </div>
        <textarea
          value={formData.experiences && formData.experiences.length > 0 ? formData.experiences.map(exp => {
            const position = exp.position || 'Position not specified'
            const company = exp.company || 'Company not specified'
            const duration = exp.duration || 'Duration not specified'
            const description = exp.description || 'No description available'
            return `${position} at ${company} (${duration})\n${description}`
          }).join('\n\n') : ''}
          onChange={(e) => {
            // Simple parsing - in real app, you'd have a more sophisticated experience editor
            const experiences = e.target.value.split('\n\n').filter(exp => exp.trim()).map(exp => {
              const lines = exp.split('\n')
              return {
                position: lines[0]?.split(' at ')[0] || '',
                company: lines[0]?.split(' at ')[1]?.split(' (')[0] || '',
                duration: lines[0]?.split(' (')[1]?.replace(')', '') || '',
                description: lines[1] || ''
              }
            })
            handleInputChange('experiences', experiences)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
          placeholder="Software Engineering Intern at Amazon (Summer 2024)&#10;Developed full-stack web applications using React and Node.js&#10;&#10;Research Assistant at UW (2023-2024)&#10;Conducted research on machine learning algorithms&#10;&#10;Teaching Assistant at University (Fall 2023)&#10;Helped students with programming assignments and graded coursework"
        />
        <p className="text-xs text-gray-500 mt-1">Format: Position at Company (Duration) followed by description</p>
      </div>
    </div>
  )

  const renderSkills = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Technical Skills</label>
        <input
          type="text"
          value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')}
          onChange={(e) => {
            // Update the display value immediately
            const newValue = e.target.value
            onChange('skills', newValue)
          }}
          onBlur={(e) => {
            // Process into array when user finishes typing
            const items = e.target.value.split(',').map(item => item.trim()).filter(item => item)
            onChange('skills', items)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Python, JavaScript, React, Node.js, SQL, Machine Learning"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple skills with commas</p>
      </div>
    </div>
  )

  const renderProjects = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Projects</label>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            📝 Manual Entry Required
          </span>
        </div>
        <textarea
          value={formData.projects && formData.projects.length > 0 ? formData.projects.map(proj => {
            const name = proj.name || 'Project name not specified'
            const description = proj.description || 'No description available'
            const technologies = proj.technologies && proj.technologies.length > 0 
              ? proj.technologies.join(', ') 
              : 'Technologies not specified'
            return `${name}\n${description}\nTechnologies: ${technologies}`
          }).join('\n\n') : ''}
          onChange={(e) => {
            const projects = e.target.value.split('\n\n').filter(proj => proj.trim()).map(proj => {
              const lines = proj.split('\n')
              return {
                name: lines[0] || '',
                description: lines[1] || '',
                technologies: lines[2]?.replace('Technologies: ', '').split(', ').filter(t => t) || []
              }
            })
            handleInputChange('projects', projects)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
          placeholder="Personal Portfolio Website&#10;Built a responsive portfolio website using React and Tailwind CSS&#10;Technologies: React, Tailwind CSS, Vite&#10;&#10;Machine Learning Stock Predictor&#10;Developed an AI-powered stock prediction model using Python and TensorFlow&#10;Technologies: Python, TensorFlow, Pandas, Jupyter&#10;&#10;E-commerce Mobile App&#10;Created a full-stack mobile application for online shopping&#10;Technologies: React Native, Node.js, MongoDB"
        />
        <p className="text-xs text-gray-500 mt-1">Format: Project Name, Description, Technologies used</p>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal': return renderPersonalInfo()
      case 'education': return renderEducation()
      case 'career': return renderCareerGoals()
      case 'experience': return renderExperience()
      case 'skills': return renderSkills()
      case 'projects': return renderProjects()
      default: return renderPersonalInfo()
    }
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-mocha-surface1">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 dark:border-mocha-blue text-blue-600 dark:text-mocha-blue'
                  : 'border-transparent text-gray-500 dark:text-mocha-subtext0 hover:text-gray-700 dark:hover:text-mocha-text hover:border-gray-300 dark:hover:border-mocha-surface2'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default ProfileForm
