import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ResumeAnalysis from './pages/ResumeAnalysis'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Verify from './pages/Verify'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze" element={<ResumeAnalysis />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </Router>
  )
}

export default App