import Layout from '../components/layout/Layout'

const EMAIL = 'shortlistr@gmail.com'

export default function ContactPage() {
  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Contact Us</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              Have a question, issue, or feedback? We'd love to hear from you.
            </p>
          </div>

          {/* Contact card */}
          <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-electric-500 to-violet-500 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-900 dark:text-white font-semibold mb-1">Email Us</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">We typically respond within 1–2 business days.</p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 text-electric-600 dark:text-electric-400 font-medium text-sm hover:underline"
                >
                  {EMAIL}
                </a>
              </div>
            </div>
          </div>

          {/* Topics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {[
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: 'Technical Support',
                desc: 'App bugs, optimizer issues, or login problems.',
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
                title: 'Billing & Subscriptions',
                desc: 'Charges, plan changes, or cancellation requests.',
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: 'Privacy & Data',
                desc: 'Account deletion, data access, or privacy concerns.',
              },
              {
                icon: (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                ),
                title: 'General Feedback',
                desc: 'Feature requests, suggestions, or anything else.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-electric-500">{item.icon}</span>
                  <p className="text-slate-900 dark:text-white font-semibold text-sm">{item.title}</p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Legal notices */}
          <div className="border-t border-slate-200 dark:border-white/10 pt-8">
            <p className="text-slate-500 dark:text-slate-400 text-xs text-center leading-relaxed">
              For DMCA or copyright notices, please use the same email address above and include "DMCA" in the subject line.
              For legal inquiries, include "Legal" in the subject line.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  )
}
