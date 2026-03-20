import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatWidget from '../ui/ChatWidget'

export default function Layout({ children }) {
  const { pathname } = useLocation()

  // Global scroll-reveal: observes every [data-reveal] element on the page.
  // Runs after each navigation so newly rendered elements are picked up.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.06,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    // Small timeout so the DOM is fully painted before we start observing
    const timer = setTimeout(() => {
      document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(el => {
        observer.observe(el)
      })
    }, 60)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [pathname])

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900 flex flex-col overflow-x-hidden">
      <Navbar />
      <main key={pathname} className="flex-1 page-enter">
        {children}
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}
