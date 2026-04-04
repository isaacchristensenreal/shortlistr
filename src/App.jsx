import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
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

              {/* Protected */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/optimize"  element={<ProtectedRoute><Optimizer /></ProtectedRoute>} />
              <Route path="/library"   element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/welcome"   element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
              <Route path="/linkedin-optimizer" element={<ProtectedRoute><LinkedInOptimizer /></ProtectedRoute>} />
              <Route path="/salary-negotiator"  element={<ProtectedRoute><SalaryNegotiator /></ProtectedRoute>} />

              {/* Catch-all — redirect unknown paths to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
