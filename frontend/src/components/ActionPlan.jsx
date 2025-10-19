function ActionPlan({ userProfile, recommendations, onActivityComplete }) {
  // Use Lambda actionPlan data if available, otherwise fallback to generated plan
  const getActionPlan = () => {
    if (recommendations && recommendations.actionPlan && recommendations.actionPlan.length > 0) {
      return recommendations.actionPlan
    }
    
    // Fallback: Generate dynamic action plan based on old format recommendations
    const actionPlan = []
    
    // Phase 1: Foundation (Classes from Lambda)
    if (recommendations && recommendations.classes && recommendations.classes.length > 0) {
      const foundationTasks = recommendations.classes.slice(0, 3).map((className, index) => ({
        title: `Enroll in ${className}`,
        description: `AI-recommended course based on your career goals and skill profile`,
        deadline: index === 0 ? "Next semester" : `${index + 1} months`,
        effort: "High",
        impact: "Critical foundation for your career path",
        resources: ["Course syllabus", "Study materials", "Peer study groups", "Office hours"]
      }))
      
      actionPlan.push({
        phase: "Phase 1: Foundation (Next 3 months)",
        duration: "3 months",
        priority: "High",
        tasks: foundationTasks
      })
    }
    
    // Phase 2: Skill Building (Skills from Lambda)
    if (recommendations && recommendations.skills && recommendations.skills.length > 0) {
      const skillTasks = recommendations.skills.slice(0, 3).map((skill, index) => ({
        title: `Master ${skill}`,
        description: `Develop proficiency in this AI-identified critical skill`,
        deadline: `${index + 4} months`,
        effort: "High",
        impact: "High demand skill in your target industry",
        resources: ["Online tutorials", "Practice projects", "Certification programs", "Community forums"]
      }))
      
      actionPlan.push({
        phase: "Phase 2: Skill Building (3-6 months)",
        duration: "3 months",
        priority: "High",
        tasks: skillTasks
      })
    }
    
    // Phase 3: Company Targeting (Companies from Lambda)
    if (recommendations && recommendations.companies && recommendations.companies.length > 0) {
      const companyTasks = [
        {
          title: `Research Target Companies`,
          description: `Deep dive into ${recommendations.companies.slice(0, 3).join(', ')} and similar companies`,
          deadline: "6 months",
          effort: "Medium",
          impact: "Strategic preparation for applications",
          resources: ["Company websites", "Glassdoor reviews", "LinkedIn research", "Employee networks"]
        },
        {
          title: "Network with Industry Professionals",
          description: "Connect with employees at your target companies",
          deadline: "7 months",
          effort: "Medium",
          impact: "Increase referral opportunities",
          resources: ["LinkedIn networking", "Industry events", "Alumni networks", "Professional groups"]
        },
        {
          title: "Prepare Company-Specific Applications",
          description: "Tailor resumes and cover letters for each target company",
          deadline: "8 months",
          effort: "High",
          impact: "Optimize application success rates",
          resources: ["Company job boards", "Application templates", "Career services", "Industry insights"]
        }
      ]
      
      actionPlan.push({
        phase: "Phase 3: Application & Interview Prep (6-9 months)",
        duration: "3 months",
        priority: "High",
        tasks: companyTasks
      })
    }
    
    // Phase 4: Final Push (Generic but important)
    actionPlan.push({
      phase: "Phase 4: Final Push (9-12 months)",
      duration: "3 months",
      priority: "Medium",
      tasks: [
        {
          title: "Complete Portfolio Projects",
          description: "Build comprehensive portfolio showcasing your skills",
          deadline: "10 months",
          effort: "High",
          impact: "Demonstrates practical application of your skills",
          resources: ["GitHub portfolio", "Project documentation", "Demo videos", "Code reviews"]
        },
        {
          title: "Practice Technical Interviews",
          description: "Master coding challenges and system design questions",
          deadline: "11 months",
          effort: "High",
          impact: "Essential for technical interview success",
          resources: ["LeetCode practice", "Mock interviews", "System design prep", "Behavioral questions"]
        },
        {
          title: "Apply to Dream Jobs",
          description: "Submit applications to your top-choice positions",
          deadline: "12 months",
          effort: "Medium",
          impact: "Achieve your career goals",
          resources: ["Job boards", "Company applications", "Referral requests", "Interview preparation"]
        }
      ]
    })
    
    return actionPlan
  }

  const actionPlan = getActionPlan()

  // If no recommendations, show fallback message
  if (!recommendations || actionPlan.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Personalized Action Plan</h2>
          <div className="text-gray-500 text-lg mb-6">
            No recommendations available yet. Please submit your profile to get your personalized action plan!
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700">
              💡 Your action plan will be dynamically generated based on your AI recommendations for classes, skills, and target companies.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEffortColor = (effort) => {
    switch (effort) {
      case 'High': return 'text-red-600'
      case 'Medium': return 'text-yellow-600'
      case 'Low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Strategic Action Plan</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
          A structured roadmap organized by phases and timelines. This is your step-by-step guide to implementing the recommendations above.
        </p>
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3 max-w-2xl mx-auto">
          <p className="text-purple-700 font-medium">📋 Structured phases with clear timelines and priorities!</p>
        </div>
      </div>

      {actionPlan.map((phase, phaseIndex) => (
        <div key={phaseIndex} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{phase.phase}</h3>
                <p className="text-blue-100">Duration: {phase.duration}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(phase.priority)}`}>
                  {phase.priority} Priority
                </span>
                <span className="text-white text-sm">
                  {phase.tasks.length} tasks
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-6">
              {phase.tasks.map((task, taskIndex) => (
                <div key={taskIndex} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <input
                          type="checkbox"
                          id={`task-${phaseIndex}-${taskIndex}`}
                          className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                          onChange={(e) => {
                            if (onActivityComplete) {
                              onActivityComplete({
                                phaseIndex,
                                taskIndex,
                                task,
                                completed: e.target.checked
                              })
                            }
                          }}
                        />
                        <h4 className="text-lg font-semibold text-gray-900">{task.title}</h4>
                      </div>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`text-sm font-medium ${getEffortColor(task.effort)}`}>
                        {task.effort} Effort
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Deadline</h5>
                      <p className="text-sm text-gray-600">{task.deadline}</p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Impact</h5>
                      <p className="text-sm text-gray-600">{task.impact}</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Resources & Links</h5>
                    <div className="flex flex-wrap gap-2">
                      {task.resources.map((resource, resourceIndex) => (
                        resource.startsWith('http') ? (
                          <a
                            key={resourceIndex}
                            href={resource}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                          >
                            {resource.includes('github.com') ? 'GitHub' :
                             resource.includes('leetcode.com') ? 'LeetCode' :
                             resource.includes('washington.edu') ? 'UW Resources' :
                             'Resource'}
                          </a>
                        ) : (
                          <span
                            key={resourceIndex}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {resource}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-600">Mark as started</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                          <span className="ml-2 text-sm text-gray-600">Mark as completed</span>
                        </label>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
        <p className="text-gray-600 mb-6">
          This action plan is personalized for your career goals. Track your progress and adjust as needed!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            Download Action Plan
          </button>
          <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-200">
            Set Reminders
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActionPlan

