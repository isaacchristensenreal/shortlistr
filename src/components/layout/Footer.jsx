import { Link } from 'react-router-dom'
import Logo from '../ui/Logo'

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const productLinks = [
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Optimizer', to: '/optimize' },
]

const accountLinks = [
  { label: 'Sign In', to: '/auth' },
  { label: 'Sign Up Free', to: '/auth?mode=signup' },
  { label: 'Dashboard', to: '/dashboard' },
]

const legalLinks = [
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Disclaimer', to: '/disclaimer' },
  { label: 'Acceptable Use', to: '/acceptable-use' },
  { label: 'Copyright & DMCA', to: '/copyright' },
  { label: 'Cookie Policy', to: '/cookie-policy' },
  { label: 'Contact', to: '/contact' },
]

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-navy-900 border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Top section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <Logo size={32} />
              <span className="text-slate-900 dark:text-white font-bold text-lg">ShortListr</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs mb-4">
              AI-powered resume optimization that beats ATS filters and gets you in front of the humans who matter.
            </p>
            <a
              href="https://www.linkedin.com/in/isaac-christensen-18ba0a3b7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
            >
              <LinkedInIcon />
              Connect on LinkedIn
            </a>
          </div>

          {/* Product */}
          <div>
            <p className="text-slate-900 dark:text-white font-semibold text-sm mb-4">Product</p>
            <ul className="space-y-2.5">
              {productLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p className="text-slate-900 dark:text-white font-semibold text-sm mb-4">Account</p>
            <ul className="space-y-2.5">
              {accountLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-slate-900 dark:text-white font-semibold text-sm mb-4">Legal</p>
            <ul className="space-y-2.5">
              {legalLinks.map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} ShortListr. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <span>Built by Isaac Christensen</span>
            <span>·</span>
            <a
              href="https://www.linkedin.com/in/isaac-christensen-18ba0a3b7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
            >
              <LinkedInIcon />
              LinkedIn
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
