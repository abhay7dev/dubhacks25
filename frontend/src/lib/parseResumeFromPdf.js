import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker - try multiple options
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
} catch (e) {
  // Fallback to CDN
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
}

export async function parseResumeFromPdf(file) {
  try {
    console.log('Starting PDF parsing for file:', file.name)
    
    const arrayBuffer = await file.arrayBuffer()
    console.log('File loaded, size:', arrayBuffer.byteLength)
    
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      useSystemFonts: true,
      disableFontFace: true
    }).promise
    
    console.log('PDF loaded, pages:', pdf.numPages)
    
    let fullText = ''
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map(item => item.str).join(' ')
      fullText += pageText + '\n'
      console.log(`Page ${i} text length:`, pageText.length)
    }
    
    console.log('Total extracted text length:', fullText.length)
    console.log('First 500 characters:', fullText.substring(0, 500))
    console.log('Full extracted text:', fullText)
    
    // Parse the extracted text
    const parsedData = parseResumeText(fullText)
    console.log('Parsed data:', parsedData)
    
    return parsedData
  } catch (error) {
    console.error('Error parsing PDF:', error)
    console.error('Error details:', error.message, error.stack)
    throw new Error(`Failed to parse PDF file: ${error.message}`)
  }
}

function parseResumeText(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line)
  
  // Initialize parsed data structure
  const parsedData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    school: '',
    major: '',
    gpa: '',
    graduationYear: '',
    desiredOccupation: '',
    targetCompanies: [],
    interests: [],
    experiences: [],
    skills: [],
    projects: [],
    clubs: []
  }
  
  // Extract email
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  const emailMatch = text.match(emailRegex)
  if (emailMatch) {
    parsedData.email = emailMatch[0]
  }
  
  // Extract phone
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/
  const phoneMatch = text.match(phoneRegex)
  if (phoneMatch) {
    parsedData.phone = phoneMatch[0]
  }
  
  // Extract name (usually first two words of the resume)
  const nameWords = lines[0]?.split(' ').filter(word => word.length > 1)
  if (nameWords && nameWords.length >= 2) {
    parsedData.firstName = nameWords[0]
    // Only take the second word as last name, not everything after
    parsedData.lastName = nameWords[1]
  } else if (nameWords && nameWords.length === 1) {
    // If only one word, treat it as first name
    parsedData.firstName = nameWords[0]
    parsedData.lastName = ''
  }
  
  // Extract education information
  const educationKeywords = ['university', 'college', 'bachelor', 'master', 'phd', 'degree', 'gpa', 'graduation', 'education']
  const educationSection = findSection(lines, educationKeywords)
  if (educationSection) {
    console.log('Education section found:', educationSection)
    
    // List of common universities and colleges to match against
    const commonSchools = [
      // Major Universities
      'Harvard University', 'Stanford University', 'MIT', 'California Institute of Technology', 'Princeton University',
      'Yale University', 'University of Chicago', 'Columbia University', 'University of Pennsylvania', 'Duke University',
      'Northwestern University', 'Johns Hopkins University', 'Cornell University', 'Brown University', 'Rice University',
      'Vanderbilt University', 'Washington University in St. Louis', 'Emory University', 'Georgetown University',
      'University of Notre Dame', 'Carnegie Mellon University', 'University of Virginia', 'Wake Forest University',
      
      // State Universities
      'University of California Berkeley', 'University of California Los Angeles', 'University of Michigan',
      'University of North Carolina Chapel Hill', 'Georgia Institute of Technology', 'University of Wisconsin Madison',
      'University of Illinois Urbana Champaign', 'Pennsylvania State University', 'Ohio State University',
      'University of Texas Austin', 'University of Florida', 'University of Washington', 'University of Minnesota',
      'University of Maryland College Park', 'Purdue University', 'University of Colorado Boulder',
      'Arizona State University', 'University of Arizona', 'University of Oregon', 'University of Utah',
      
      // Other Notable Universities
      'New York University', 'Boston University', 'Northeastern University', 'University of Southern California',
      'Tufts University', 'Brandeis University', 'Case Western Reserve University', 'Tulane University',
      'University of Rochester', 'Rensselaer Polytechnic Institute', 'Stevens Institute of Technology',
      'Worcester Polytechnic Institute', 'Lehigh University', 'Villanova University', 'Santa Clara University',
      
      // Community Colleges and Other
      'Community College', 'State University', 'City College', 'Technical College', 'Liberal Arts College',
      
      // International (common ones)
      'University of Toronto', 'McGill University', 'University of British Columbia', 'University of Waterloo',
      'Oxford University', 'Cambridge University', 'Imperial College London', 'University College London'
    ]
    
    // Try to find a match against our list of common schools
    let foundSchool = null
    for (const line of educationSection.split('\n')) {
      const cleanLine = line.trim().toLowerCase()
      
      // Check for exact matches first
      for (const school of commonSchools) {
        if (cleanLine.includes(school.toLowerCase())) {
          foundSchool = school
          break
        }
      }
      
      if (foundSchool) break
      
      // Check for partial matches (in case of abbreviations or slight variations)
      if (cleanLine.includes('harvard')) foundSchool = 'Harvard University'
      else if (cleanLine.includes('stanford')) foundSchool = 'Stanford University'
      else if (cleanLine.includes('mit') || cleanLine.includes('massachusetts institute')) foundSchool = 'MIT'
      else if (cleanLine.includes('caltech') || cleanLine.includes('california institute')) foundSchool = 'California Institute of Technology'
      else if (cleanLine.includes('princeton')) foundSchool = 'Princeton University'
      else if (cleanLine.includes('yale')) foundSchool = 'Yale University'
      else if (cleanLine.includes('uchicago') || cleanLine.includes('university of chicago')) foundSchool = 'University of Chicago'
      else if (cleanLine.includes('columbia')) foundSchool = 'Columbia University'
      else if (cleanLine.includes('upenn') || cleanLine.includes('university of pennsylvania')) foundSchool = 'University of Pennsylvania'
      else if (cleanLine.includes('duke')) foundSchool = 'Duke University'
      else if (cleanLine.includes('northwestern')) foundSchool = 'Northwestern University'
      else if (cleanLine.includes('johns hopkins')) foundSchool = 'Johns Hopkins University'
      else if (cleanLine.includes('cornell')) foundSchool = 'Cornell University'
      else if (cleanLine.includes('brown')) foundSchool = 'Brown University'
      else if (cleanLine.includes('rice')) foundSchool = 'Rice University'
      else if (cleanLine.includes('vanderbilt')) foundSchool = 'Vanderbilt University'
      else if (cleanLine.includes('washington university')) foundSchool = 'Washington University in St. Louis'
      else if (cleanLine.includes('emory')) foundSchool = 'Emory University'
      else if (cleanLine.includes('georgetown')) foundSchool = 'Georgetown University'
      else if (cleanLine.includes('notre dame')) foundSchool = 'University of Notre Dame'
      else if (cleanLine.includes('carnegie mellon') || cleanLine.includes('cmu')) foundSchool = 'Carnegie Mellon University'
      else if (cleanLine.includes('university of virginia') || cleanLine.includes('uva')) foundSchool = 'University of Virginia'
      else if (cleanLine.includes('wake forest')) foundSchool = 'Wake Forest University'
      
      // State universities
      else if (cleanLine.includes('uc berkeley') || cleanLine.includes('university of california berkeley')) foundSchool = 'University of California Berkeley'
      else if (cleanLine.includes('ucla') || cleanLine.includes('university of california los angeles')) foundSchool = 'University of California Los Angeles'
      else if (cleanLine.includes('university of michigan') || cleanLine.includes('umich')) foundSchool = 'University of Michigan'
      else if (cleanLine.includes('unc') || cleanLine.includes('university of north carolina')) foundSchool = 'University of North Carolina Chapel Hill'
      else if (cleanLine.includes('georgia tech') || cleanLine.includes('georgia institute')) foundSchool = 'Georgia Institute of Technology'
      else if (cleanLine.includes('university of wisconsin')) foundSchool = 'University of Wisconsin Madison'
      else if (cleanLine.includes('uiuc') || cleanLine.includes('university of illinois')) foundSchool = 'University of Illinois Urbana Champaign'
      else if (cleanLine.includes('penn state') || cleanLine.includes('pennsylvania state')) foundSchool = 'Pennsylvania State University'
      else if (cleanLine.includes('ohio state') || cleanLine.includes('osu')) foundSchool = 'Ohio State University'
      else if (cleanLine.includes('university of texas') || cleanLine.includes('utexas')) foundSchool = 'University of Texas Austin'
      else if (cleanLine.includes('university of florida') || cleanLine.includes('uf')) foundSchool = 'University of Florida'
      else if (cleanLine.includes('university of washington') || cleanLine.includes('uw')) foundSchool = 'University of Washington'
      else if (cleanLine.includes('university of minnesota')) foundSchool = 'University of Minnesota'
      else if (cleanLine.includes('university of maryland')) foundSchool = 'University of Maryland College Park'
      else if (cleanLine.includes('purdue')) foundSchool = 'Purdue University'
      else if (cleanLine.includes('university of colorado')) foundSchool = 'University of Colorado Boulder'
      else if (cleanLine.includes('arizona state') || cleanLine.includes('asu')) foundSchool = 'Arizona State University'
      else if (cleanLine.includes('university of arizona') || cleanLine.includes('ua')) foundSchool = 'University of Arizona'
      else if (cleanLine.includes('university of oregon')) foundSchool = 'University of Oregon'
      else if (cleanLine.includes('university of utah')) foundSchool = 'University of Utah'
      
      // Other universities
      else if (cleanLine.includes('nyu') || cleanLine.includes('new york university')) foundSchool = 'New York University'
      else if (cleanLine.includes('boston university') || cleanLine.includes('bu')) foundSchool = 'Boston University'
      else if (cleanLine.includes('northeastern')) foundSchool = 'Northeastern University'
      else if (cleanLine.includes('usc') || cleanLine.includes('university of southern california')) foundSchool = 'University of Southern California'
      else if (cleanLine.includes('tufts')) foundSchool = 'Tufts University'
      else if (cleanLine.includes('brandeis')) foundSchool = 'Brandeis University'
      else if (cleanLine.includes('case western')) foundSchool = 'Case Western Reserve University'
      else if (cleanLine.includes('tulane')) foundSchool = 'Tulane University'
      else if (cleanLine.includes('university of rochester')) foundSchool = 'University of Rochester'
      else if (cleanLine.includes('rpi') || cleanLine.includes('rensselaer polytechnic')) foundSchool = 'Rensselaer Polytechnic Institute'
      else if (cleanLine.includes('stevens institute')) foundSchool = 'Stevens Institute of Technology'
      else if (cleanLine.includes('wpi') || cleanLine.includes('worcester polytechnic')) foundSchool = 'Worcester Polytechnic Institute'
      else if (cleanLine.includes('lehigh')) foundSchool = 'Lehigh University'
      else if (cleanLine.includes('villanova')) foundSchool = 'Villanova University'
      else if (cleanLine.includes('santa clara')) foundSchool = 'Santa Clara University'
      
      if (foundSchool) break
    }
    
    if (foundSchool) {
      parsedData.school = foundSchool
      console.log('Found school from list:', foundSchool)
    }
    
    // Extract major
    const majorKeywords = ['computer science', 'engineering', 'business', 'mathematics', 'physics', 'chemistry']
    for (const keyword of majorKeywords) {
      if (educationSection.toLowerCase().includes(keyword)) {
        parsedData.major = keyword.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
        break
      }
    }
    
    // Extract GPA
    const gpaMatch = educationSection.match(/gpa[:\s]*([0-9]+\.[0-9]+)/i)
    if (gpaMatch) {
      parsedData.gpa = gpaMatch[1]
    }
    
    // Extract graduation year
    const yearMatch = educationSection.match(/(20[0-9]{2})/)
    if (yearMatch) {
      parsedData.graduationYear = yearMatch[1]
    }
  }
  
  // Extract skills - comprehensive list with better matching
  const skillsKeywords = [
    // Programming Languages
    'python', 'javascript', 'java', 'c++', 'c#', 'c', 'go', 'rust', 'swift', 'kotlin', 'php', 'ruby', 'scala', 'r', 'matlab', 'typescript',
    
    // Web Technologies
    'react', 'angular', 'vue', 'node.js', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'html', 'css', 'sass', 'scss',
    'bootstrap', 'tailwind', 'jquery', 'next.js', 'nuxt', 'svelte', 'ember', 'backbone',
    
    // Databases
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server', 'dynamodb', 'cassandra', 'neo4j',
    
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'git', 'github', 'gitlab', 'terraform', 'ansible', 'chef', 'puppet',
    
    // AI/ML
    'machine learning', 'deep learning', 'ai', 'artificial intelligence', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy', 'opencv', 'nlp',
    'natural language processing', 'computer vision', 'data science', 'jupyter', 'kaggle',
    
    // Mobile
    'ios', 'android', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
    
    // Other Technologies
    'linux', 'unix', 'bash', 'powershell', 'apache', 'nginx', 'elasticsearch', 'kibana', 'grafana', 'prometheus',
    'microservices', 'rest api', 'graphql', 'websockets', 'rabbitmq', 'kafka', 'spark', 'hadoop',
    
    // Tools & Software
    'photoshop', 'illustrator', 'figma', 'sketch', 'tableau', 'power bi', 'excel', 'word', 'powerpoint', 'slack', 'jira', 'confluence',
    
    // Soft Skills
    'leadership', 'teamwork', 'communication', 'project management', 'agile', 'scrum', 'kanban'
  ]
  
  const foundSkills = []
  const textLower = text.toLowerCase()
  
  // Look for skills section first
  const skillsSection = findSection(lines, ['skills', 'technical skills', 'technologies', 'programming languages', 'tools'])
  const searchText = skillsSection ? skillsSection.toLowerCase() : textLower
  
  // Check each skill keyword
  for (const keyword of skillsKeywords) {
    if (searchText.includes(keyword.toLowerCase())) {
      // Capitalize properly based on the skill type
      let formattedSkill = keyword
      
      // Handle special cases
      if (keyword === 'ai') formattedSkill = 'AI'
      else if (keyword === 'css') formattedSkill = 'CSS'
      else if (keyword === 'html') formattedSkill = 'HTML'
      else if (keyword === 'sql') formattedSkill = 'SQL'
      else if (keyword === 'aws') formattedSkill = 'AWS'
      else if (keyword === 'gcp') formattedSkill = 'GCP'
      else if (keyword === 'nlp') formattedSkill = 'NLP'
      else if (keyword === 'api') formattedSkill = 'API'
      else if (keyword === 'c++') formattedSkill = 'C++'
      else if (keyword === 'c#') formattedSkill = 'C#'
      else if (keyword === 'node.js' || keyword === 'node') formattedSkill = 'Node.js'
      else if (keyword === 'postgresql' || keyword === 'postgres') formattedSkill = 'PostgreSQL'
      else if (keyword === 'mongodb') formattedSkill = 'MongoDB'
      else if (keyword === 'react') formattedSkill = 'React'
      else if (keyword === 'angular') formattedSkill = 'Angular'
      else if (keyword === 'vue') formattedSkill = 'Vue.js'
      else if (keyword === 'docker') formattedSkill = 'Docker'
      else if (keyword === 'kubernetes') formattedSkill = 'Kubernetes'
      else if (keyword === 'tensorflow') formattedSkill = 'TensorFlow'
      else if (keyword === 'pytorch') formattedSkill = 'PyTorch'
      else if (keyword === 'scikit-learn') formattedSkill = 'Scikit-learn'
      else if (keyword === 'machine learning') formattedSkill = 'Machine Learning'
      else if (keyword === 'artificial intelligence') formattedSkill = 'Artificial Intelligence'
      else if (keyword === 'natural language processing') formattedSkill = 'Natural Language Processing'
      else if (keyword === 'computer vision') formattedSkill = 'Computer Vision'
      else if (keyword === 'data science') formattedSkill = 'Data Science'
      else if (keyword === 'react native') formattedSkill = 'React Native'
      else if (keyword === 'rest api') formattedSkill = 'REST API'
      else if (keyword === 'graphql') formattedSkill = 'GraphQL'
      else if (keyword === 'microservices') formattedSkill = 'Microservices'
      else if (keyword === 'project management') formattedSkill = 'Project Management'
      else {
        // Default capitalization
        formattedSkill = keyword.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
      }
      
      if (!foundSkills.includes(formattedSkill)) {
        foundSkills.push(formattedSkill)
      }
    }
  }
  
  parsedData.skills = foundSkills
  console.log('Found skills:', foundSkills)
  
  // Extract experience - more flexible parsing
  const experienceKeywords = ['experience', 'experiences', 'employment', 'work history', 'professional experience', 'work', 'career']
  let experienceSection = findSection(lines, experienceKeywords)
  console.log('Experience section found:', experienceSection ? 'Yes' : 'No')
  
  // Special check for "Experiences:" format
  if (!experienceSection) {
    console.log('Checking for "Experiences:" format...')
    const experiencesIndex = lines.findIndex(line => line.toLowerCase().includes('experiences:'))
    if (experiencesIndex !== -1) {
      experienceSection = lines.slice(experiencesIndex, Math.min(experiencesIndex + 15, lines.length)).join('\n')
      console.log('Found "Experiences:" section at line', experiencesIndex)
    }
  }
  
  // Fallback: if no section found, search entire text for experience patterns
  if (!experienceSection) {
    console.log('Trying fallback approach for experiences...')
    // Look for lines that contain job-related keywords anywhere in the text
    const experienceLines = lines.filter(line => 
      line.trim().length > 10 &&
      (line.match(/(engineer|developer|analyst|manager|intern|assistant|specialist|coordinator|consultant|director|lead|senior|junior|programmer|coder|designer|researcher|student|volunteer)/i) ||
       line.match(/at\s+[A-Z]/i) ||
       line.match(/for\s+[A-Z]/i))
    )
    if (experienceLines.length > 0) {
      experienceSection = experienceLines.join('\n')
      console.log('Found experiences via fallback:', experienceLines.length, 'lines')
    }
  }
  
  // Debug: Log what we found for experiences
  console.log('Experience section after all attempts:', experienceSection)
  
  if (experienceSection) {
    console.log('Processing experience section:', experienceSection)
    const experiences = []
    const expLines = experienceSection.split('\n').filter(line => 
      line.trim().length > 5 && 
      !line.match(/^(experience|employment|work|email|phone|address|linkedin|github|projects|education|skills)/i) &&
      !line.match(/@/) && // Exclude email lines
      !line.match(/^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) && // Exclude phone numbers
      !line.match(/^https?:\/\//) // Exclude URLs
    )
    
    console.log('Filtered experience lines:', expLines)
    
    // Look for job entries with more flexible patterns
    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i].trim()
      console.log('Checking experience line:', line)
      
      // More flexible job title patterns - try to catch ANY line that looks like a job
      if (line.match(/(engineer|developer|analyst|manager|intern|assistant|specialist|coordinator|consultant|director|lead|senior|junior|programmer|coder|designer|researcher|student|volunteer|software|data|web|frontend|backend|full|stack|mobile|ios|android|python|java|javascript|react|angular|vue|node|sql|database|cloud|aws|azure|devops|qa|test|quality|product|marketing|sales|business|finance|hr|human|resources)/i) ||
          line.match(/at\s+[A-Z]/i) || // Contains "at [Company]"
          line.match(/for\s+[A-Z]/i) || // Contains "for [Company]"
          line.match(/[A-Z][a-z]+\s+[A-Z][a-z]+.*(?:Inc|LLC|Corp|Company|Technologies|Systems|Solutions)/i)) { // Company names
        
        const nextLine = expLines[i + 1] || ''
        const nextNextLine = expLines[i + 2] || ''
        console.log('Found potential experience:', line)
        console.log('Next line:', nextLine)
        console.log('Next next line:', nextNextLine)
        
        // Extract company name and position more flexibly
        let company = ''
        let position = line
        
        // Try different patterns to extract company and position
        if (line.includes(' at ')) {
          const parts = line.split(' at ')
          position = parts[0].trim()
          company = parts[1].trim()
        } else if (line.includes(' for ')) {
          const parts = line.split(' for ')
          position = parts[0].trim()
          company = parts[1].trim()
        } else if (nextLine && nextLine.match(/^[A-Z][a-zA-Z\s&.,]+$/)) {
          // Company might be on next line
          company = nextLine.trim()
        } else {
          // Try to extract from the line itself
          const companyMatch = line.match(/(?:at|for)\s+([A-Z][a-zA-Z\s&.,]+)/i)
          if (companyMatch) {
            company = companyMatch[1].trim()
            position = line.replace(/(?:at|for)\s+[A-Z][a-zA-Z\s&.,]+/i, '').trim()
          } else {
            company = 'Company Name'
          }
        }
        
        // Extract duration (look for date patterns in current line or next few lines)
        const durationMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i) || 
                             nextLine.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i) ||
                             nextNextLine.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i)
        const duration = durationMatch ? durationMatch[0] : 'Duration not specified'
        
        // Get description (look in next lines)
        let description = ''
        if (nextLine && nextLine.length > 10 && nextLine.length < 300 && 
            !nextLine.match(/(engineer|developer|analyst|manager|intern)/i)) {
          description = nextLine
        } else if (nextNextLine && nextNextLine.length > 10 && nextNextLine.length < 300 &&
                   !nextNextLine.match(/(engineer|developer|analyst|manager|intern)/i)) {
          description = nextNextLine
        } else {
          description = 'Description not available'
        }
        
        if (position && position.length < 100) { // Reasonable length check
          experiences.push({
            company: company,
            position: position,
            duration: duration,
            description: description
          })
          console.log('Added experience:', { company, position, duration, description })
        }
      }
    }
    parsedData.experiences = experiences.slice(0, 5) // Limit to 5 experiences
    console.log('Final experiences:', parsedData.experiences)
  }
  
  // Extract projects - more flexible parsing
  const projectKeywords = ['projects', 'project', 'portfolio', 'personal projects', 'side projects', 'github', 'built', 'developed', 'created']
  let projectSection = findSection(lines, projectKeywords)
  console.log('Project section found:', projectSection ? 'Yes' : 'No')
  
  // Special check for "Projects:" format
  if (!projectSection) {
    console.log('Checking for "Projects:" format...')
    const projectsIndex = lines.findIndex(line => line.toLowerCase().includes('projects:'))
    if (projectsIndex !== -1) {
      projectSection = lines.slice(projectsIndex, Math.min(projectsIndex + 15, lines.length)).join('\n')
      console.log('Found "Projects:" section at line', projectsIndex)
    }
  }
  
  // Fallback: if no section found, search entire text for project patterns
  if (!projectSection) {
    console.log('Trying fallback approach for projects...')
    // Look for lines that contain project-related keywords anywhere in the text
    const projectLines = lines.filter(line => 
      line.trim().length > 10 &&
      (line.match(/^[A-Z][a-zA-Z\s]+$/) && 
       line.length < 100 && 
       (line.match(/(app|website|system|tool|platform|game|bot|dashboard|portfolio|project|web|mobile|desktop|api|service|application)/i) || 
        line.match(/^[A-Z][a-zA-Z\s]{3,}$/) ||
        line.match(/(built|developed|created|designed|implemented)/i)))
    )
    if (projectLines.length > 0) {
      projectSection = projectLines.join('\n')
      console.log('Found projects via fallback:', projectLines.length, 'lines')
    }
  }
  
  // Debug: Log what we found for projects
  console.log('Project section after all attempts:', projectSection)
  
  if (projectSection) {
    const projects = []
    const projectLines = projectSection.split('\n').filter(line => 
      line.trim().length > 5 && 
      !line.match(/^(projects|portfolio|email|phone|address|linkedin|github|experience|education|skills)/i) &&
      !line.match(/@/) && // Exclude email lines
      !line.match(/^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) && // Exclude phone numbers
      !line.match(/^https?:\/\//) // Exclude URLs
    )
    
    console.log('Filtered project lines:', projectLines.length)
    
    // Look for project entries with more flexible patterns
    for (let i = 0; i < projectLines.length; i++) {
      const line = projectLines[i].trim()
      console.log('Checking project line:', line)
      
      // More flexible project name patterns
      if (line.match(/^[A-Z][a-zA-Z\s]+$/) && 
          line.length < 100 && 
          (line.match(/(app|website|system|tool|platform|game|bot|dashboard|portfolio|project|web|mobile|desktop|api|service|application)/i) || 
           line.match(/^[A-Z][a-zA-Z\s]{3,}$/) ||
           line.match(/(built|developed|created|designed|implemented)/i))) {
        
        const nextLine = projectLines[i + 1] || ''
        console.log('Found potential project:', line)
        
        // Extract project name
        const projectName = line
        
        // Extract description (next line if it looks like a description)
        const description = nextLine && 
          nextLine.length > 10 && 
          nextLine.length < 300 &&
          !nextLine.match(/^(built|developed|created|designed|implemented)$/i) &&
          !nextLine.match(/^[A-Z][a-zA-Z\s]+$/) // Not another title
          ? nextLine 
          : 'Project description not available'
        
        // Extract technologies (look for tech keywords in description)
        const techKeywords = ['react', 'node', 'python', 'javascript', 'java', 'sql', 'mongodb', 'postgresql', 'aws', 'docker', 'kubernetes', 'tensorflow', 'pytorch', 'flask', 'django', 'express', 'angular', 'vue', 'typescript', 'html', 'css', 'bootstrap', 'tailwind', 'php', 'ruby', 'c++', 'c#', 'swift', 'kotlin', 'android', 'ios']
        const technologies = []
        const searchText = (projectName + ' ' + description).toLowerCase()
        for (const tech of techKeywords) {
          if (searchText.includes(tech)) {
            technologies.push(tech.charAt(0).toUpperCase() + tech.slice(1))
          }
        }
        
        if (projectName && projectName.length < 100) { // Reasonable length check
          projects.push({
            name: projectName,
            description: description,
            technologies: technologies
          })
          console.log('Added project:', { name: projectName, description, technologies })
        }
      }
    }
    parsedData.projects = projects.slice(0, 3) // Limit to 3 projects
    console.log('Final projects:', parsedData.projects)
  }
  
  // Set default values if not found
  if (!parsedData.school) parsedData.school = 'University'
  if (!parsedData.major) parsedData.major = 'Computer Science'
  if (!parsedData.graduationYear) parsedData.graduationYear = '2026'
  if (!parsedData.desiredOccupation) parsedData.desiredOccupation = 'Software Engineer'
  // Only use default skills if no skills were found at all
  if (parsedData.skills.length === 0) {
    console.log('No skills found, using minimal defaults')
    parsedData.skills = ['Programming', 'Problem Solving']
  }
  
  // Intentionally leave experiences and projects empty - user will fill manually
  // This ensures these sections require manual entry while other fields auto-fill
  if (!parsedData.experiences) {
    parsedData.experiences = []
  }
  
  if (!parsedData.projects) {
    parsedData.projects = []
  }
  
  return parsedData
}

function findSection(lines, keywords) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    for (const keyword of keywords) {
      if (line.includes(keyword.toLowerCase())) {
        console.log(`Found section with keyword "${keyword}" at line ${i}:`, lines[i])
        // Return more lines to capture the full section
        return lines.slice(i, Math.min(i + 20, lines.length)).join('\n')
      }
    }
  }
  console.log('No section found for keywords:', keywords)
  return null
}
