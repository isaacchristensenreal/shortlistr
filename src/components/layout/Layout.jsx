import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import ChatWidget from '../ui/ChatWidget'

export default function Layout({ children }) {
  const { pathname } = useLocation()

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
