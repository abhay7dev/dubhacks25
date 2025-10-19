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

  // Add new experience
  const addExperience = () => {
    const currentExperiences = formData.experiences || []
    onChange('experiences', [...currentExperiences, {
      position: '',
      company: '',
      duration: '',
      description: ''
    }])
  }

  // Update experience field
  const updateExperience = (index, field, value) => {
    const updatedExperiences = [...(formData.experiences || [])]
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value }
    onChange('experiences', updatedExperiences)
  }

  // Remove experience
  const removeExperience = (index) => {
    const updatedExperiences = (formData.experiences || []).filter((_, i) => i !== index)
    onChange('experiences', updatedExperiences)
  }

  // Add new project
  const addProject = () => {
    const currentProjects = formData.projects || []
    onChange('projects', [...currentProjects, {
      name: '',
      description: '',
      technologies: ''
    }])
  }

  // Update project field
  const updateProject = (index, field, value) => {
    const updatedProjects = [...(formData.projects || [])]
    if (field === 'technologies') {
      updatedProjects[index] = { 
        ...updatedProjects[index], 
        [field]: value.split(',').map(t => t.trim()).filter(t => t)
      }
    } else {
      updatedProjects[index] = { ...updatedProjects[index], [field]: value }
    }
    onChange('projects', updatedProjects)
  }

  // Remove project
  const removeProject = (index) => {
    const updatedProjects = (formData.projects || []).filter((_, i) => i !== index)
    onChange('projects', updatedProjects)
  }

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your first name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your last name"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="your.email@example.com"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="(555) 123-4567"
        />
      </div>
    </div>
  )

  const renderEducation = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          School/University <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.school}
          onChange={(e) => handleInputChange('school', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="University of Washington"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Major <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Graduation Year <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.graduationYear}
          onChange={(e) => handleInputChange('graduationYear', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="2025"
        />
      </div>
    </div>
  )

  const renderCareerGoals = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Desired Occupation <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
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
            const items = e.target.value.split(',').map(item => item.trim()).filter(item => item)
            onChange('targetCompanies', items)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Google, Microsoft, Amazon"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple companies with commas</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Career Interests</label>
        <input
          type="text"
          value={Array.isArray(formData.interests) ? formData.interests.join(', ') : (formData.interests || '')}
          onChange={(e) => {
            const items = e.target.value.split(',').map(item => item.trim()).filter(item => item)
            onChange('interests', items)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Machine Learning, Web Development, Cloud Computing"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple interests with commas</p>
      </div>
    </div>
  )

  const renderExperience = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
        <button
          type="button"
          onClick={addExperience}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Experience
        </button>
      </div>

      {(!formData.experiences || formData.experiences.length === 0) && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No experience added yet. Click "Add Experience" to get started.</p>
        </div>
      )}

      {(formData.experiences || []).map((experience, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
            <button
              type="button"
              onClick={() => removeExperience(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                value={experience.position || ''}
                onChange={(e) => updateExperience(index, 'position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Software Engineer Intern"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={experience.company || ''}
                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Amazon"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              type="text"
              value={experience.duration || ''}
              onChange={(e) => updateExperience(index, 'duration', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Summer 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={experience.description || ''}
              onChange={(e) => updateExperience(index, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Developed full-stack web applications using React and Node.js..."
            />
          </div>
        </div>
      ))}
    </div>
  )

  const renderSkills = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Technical Skills <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')}
          onChange={(e) => {
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
        <button
          type="button"
          onClick={addProject}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Project
        </button>
      </div>

      {(!formData.projects || formData.projects.length === 0) && (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No projects added yet. Click "Add Project" to get started.</p>
        </div>
      )}

      {(formData.projects || []).map((project, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Project #{index + 1}</h4>
            <button
              type="button"
              onClick={() => removeProject(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              value={project.name || ''}
              onChange={(e) => updateProject(index, 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Personal Portfolio Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={project.description || ''}
              onChange={(e) => updateProject(index, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Built a responsive portfolio website using React and Tailwind CSS..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
            <input
              type="text"
              value={Array.isArray(project.technologies) ? project.technologies.join(', ') : (project.technologies || '')}
              onChange={(e) => updateProject(index, 'technologies', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="React, Tailwind CSS, Vite"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple technologies with commas</p>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'personal' && renderPersonalInfo()}
        {activeTab === 'education' && renderEducation()}
        {activeTab === 'career' && renderCareerGoals()}
        {activeTab === 'experience' && renderExperience()}
        {activeTab === 'skills' && renderSkills()}
        {activeTab === 'projects' && renderProjects()}
      </div>

      {/* Required Fields Notice */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <span className="text-red-500">*</span> Required fields
        </p>
      </div>
    </div>
  )
}

export default ProfileForm
