import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const WELCOME = {
  role: 'assistant',
  content: "Hi! I'm the ShortListr assistant 👋\n\nAsk me anything — resume tips, how to beat ATS filters, how to use our features, or job search advice. I'm here to help.",
}

/* Consistent AI icon used everywhere in the widget */
function AIIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-2.5 stagger-item ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric-500 to-violet-500 flex items-center justify-center shrink-0 mt-0.5">
          <AIIcon className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-electric-500 to-blue-600 text-white rounded-tr-sm'
            : 'bg-slate-100 dark:bg-navy-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric-500 to-violet-500 flex items-center justify-center shrink-0">
        <AIIcon className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="bg-slate-100 dark:bg-navy-700 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    const history = [...messages, userMsg].filter(m => m !== WELCOME)
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('chat', {
        body: {
          messages: history.map(m => ({ role: m.role, content: m.content })),
        },
      })

      if (fnError) throw new Error(fnError.message)
      if (data?.error) throw new Error(data.error)

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setMessages([WELCOME])
    setInput('')
    setError(null)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className="scale-in fixed z-50 flex flex-col bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-slate-300/30 dark:shadow-black/40 overflow-hidden
          inset-x-3 bottom-24 max-h-[75vh]
          sm:inset-x-auto sm:bottom-auto sm:right-24 sm:top-1/2 sm:-translate-y-1/2 sm:w-[360px] sm:max-h-[560px]">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-white/10 bg-gradient-to-r from-electric-500 to-violet-500 shrink-0">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <AIIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm leading-none">ShortListr AI</p>
              <p className="text-white/70 text-xs mt-0.5">Here to help</p>
            </div>
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
            {messages.map((m, i) => <Message key={i} msg={m} />)}
            {loading && <TypingIndicator />}
            {error && (
              <p className="text-center text-red-400 text-xs py-1">{error}</p>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested prompts — only show before any user message */}
          {messages.length === 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-1.5 shrink-0">
              {[
                'How does ATS matching work?',
                'How do I upgrade to Pro?',
                'Tips for a better resume?',
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); setTimeout(send, 0) }}
                  className="text-xs bg-slate-100 dark:bg-navy-700 hover:bg-slate-200 dark:hover:bg-navy-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 px-2.5 py-1.5 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 shrink-0">
            <div className="flex items-end gap-2 bg-slate-50 dark:bg-navy-700 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                }}
                onKeyDown={handleKey}
                placeholder="Ask anything…"
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none resize-none leading-relaxed"
                style={{ minHeight: '22px', maxHeight: '100px' }}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="w-8 h-8 bg-gradient-to-br from-electric-500 to-blue-600 hover:from-electric-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all shrink-0 hover:scale-110 active:scale-95"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
            <p className="text-center text-slate-300 dark:text-slate-600 text-[10px] mt-2">Shift+Enter for new line · Enter to send</p>
          </div>
        </div>
      )}

      {/* Floating toggle button */}
      <button
        onClick={() => open ? handleClose() : setOpen(true)}
        className="fixed bottom-5 right-5 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:right-5 z-50 w-14 h-14 bg-gradient-to-br from-electric-500 to-violet-500 hover:from-electric-400 hover:to-violet-400 rounded-2xl shadow-lg shadow-electric-500/30 hover:shadow-xl hover:shadow-electric-500/40 transition-all flex items-center justify-center group hover:scale-110 active:scale-95"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <AIIcon className="w-6 h-6 text-white" />
        )}
        {/* Pulse ring — only when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-2xl bg-electric-500/40 animate-ping" />
        )}
      </button>
    </>
  )
}
