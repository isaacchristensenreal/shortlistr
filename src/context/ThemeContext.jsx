import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('rf_theme') || 'dark'
  })

  // Keep document.documentElement in sync so the inline script's initial
  // class gets cleaned up when the user switches to light mode.
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('rf_theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  // Apply the class via a React-controlled wrapper div so the update is
  // synchronous with the React render — no useEffect timing gap.
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className={theme === 'dark' ? 'dark' : ''} style={{ display: 'contents' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
