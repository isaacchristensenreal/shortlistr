import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import ProtectedRoute from './components/ui/ProtectedRoute'
import ScrollToTop from './components/ui/ScrollToTop'

import Home from './pages/Home'
import Auth from './pages/Auth'
import Features from './pages/Features'
import Pricing from './pages/Pricing'
import Dashboard from './pages/Dashboard'
import Optimizer from './pages/Optimizer'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Disclaimer from './pages/Disclaimer'
import AcceptableUse from './pages/AcceptableUse'
import Copyright from './pages/Copyright'
import Contact from './pages/Contact'
import CookiePolicy from './pages/CookiePolicy'
import UpgradeSuccess from './pages/UpgradeSuccess'
import Settings from './pages/Settings'
import Library from './pages/Library'
import Welcome from './pages/Welcome'
import LinkedInOptimizer from './pages/LinkedInOptimizer'
import SalaryNegotiator from './pages/SalaryNegotiator'
import RoastResume from './pages/RoastResume'
import AtsResumeChecker from './pages/AtsResumeChecker'
import AtsScore from './pages/AtsScore'
import HowToGetMoreInterviews from './pages/HowToGetMoreInterviews'
import JobDescriptionKeywords from './pages/JobDescriptionKeywords'
import NoExperienceResume from './pages/NoExperienceResume'
import OverqualifiedResume from './pages/OverqualifiedResume'
import RejectedFromEveryJob from './pages/RejectedFromEveryJob'
import ResumeAtsTest from './pages/ResumeAtsTest'
import ResumeForFirstJob from './pages/ResumeForFirstJob'
import ResumeForRemoteJobs from './pages/ResumeForRemoteJobs'
import ResumeHelp from './pages/ResumeHelp'
import ResumeNotGettingCallbacks from './pages/ResumeNotGettingCallbacks'
import ResumeTipsCareerChangers from './pages/ResumeTipsCareerChangers'
import TechResumeAts from './pages/TechResumeAts'
import WhyNotGettingInterviews from './pages/WhyNotGettingInterviews'

export default function App() {
  return (
    <HelmetProvider>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ScrollToTop />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/acceptable-use" element={<AcceptableUse />} />
              <Route path="/copyright" element={<Copyright />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/upgrade/success" element={<UpgradeSuccess />} />

              {/* SEO Blog Pages */}
              <Route path="/ats-resume-checker" element={<AtsResumeChecker />} />
              <Route path="/ats-score" element={<AtsScore />} />
              <Route path="/how-to-get-more-job-interviews" element={<HowToGetMoreInterviews />} />
              <Route path="/job-description-keywords" element={<JobDescriptionKeywords />} />
              <Route path="/no-experience-resume" element={<NoExperienceResume />} />
              <Route path="/overqualified-resume" element={<OverqualifiedResume />} />
              <Route path="/rejected-from-every-job" element={<RejectedFromEveryJob />} />
              <Route path="/resume-ats-test" element={<ResumeAtsTest />} />
              <Route path="/resume-for-first-job" element={<ResumeForFirstJob />} />
              <Route path="/resume-for-remote-jobs" element={<ResumeForRemoteJobs />} />
              <Route path="/resume-help" element={<ResumeHelp />} />
              <Route path="/resume-not-getting-callbacks" element={<ResumeNotGettingCallbacks />} />
              <Route path="/resume-tips-for-career-changers" element={<ResumeTipsCareerChangers />} />
              <Route path="/tech-resume-ats" element={<TechResumeAts />} />
              <Route path="/why-am-i-not-getting-interviews" element={<WhyNotGettingInterviews />} />

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/optimize"  element={<ProtectedRoute><Optimizer /></ProtectedRoute>} />
              <Route path="/library"   element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/welcome"   element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
              <Route path="/linkedin-optimizer" element={<ProtectedRoute><LinkedInOptimizer /></ProtectedRoute>} />
              <Route path="/salary-negotiator"  element={<ProtectedRoute><SalaryNegotiator /></ProtectedRoute>} />
              <Route path="/roast"              element={<ProtectedRoute><RoastResume /></ProtectedRoute>} />

              {/* Catch-all — redirect unknown paths to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
    </HelmetProvider>
  )
}
