import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'

const EFFECTIVE_DATE = 'March 15, 2025'
const EMAIL = 'shortlistr@gmail.com'

function Section({ id, title, children }) {
  return (
    <section id={id} className="mb-10">
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
      <div className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

function CookieRow({ name, type, purpose, expires }) {
  return (
    <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <p className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">{name}</p>
        <span className="text-xs bg-electric-500/10 text-electric-600 dark:text-electric-400 border border-electric-500/20 px-2 py-0.5 rounded-full shrink-0">{type}</span>
      </div>
      <p className="text-sm mb-1">{purpose}</p>
      <p className="text-xs text-slate-400">Expires: {expires}</p>
    </div>
  )
}

export default function CookiePolicyPage() {
  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Cookie Policy</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
          </div>

          <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 mb-10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              This page explains what cookies and browser storage ShortListr uses and why. The short version: we use the minimum necessary to keep the Service working — no advertising, no cross-site tracking, no third-party data brokers. This policy is part of our{' '}
              <Link to="/privacy" className="text-electric-600 dark:text-electric-400 hover:underline">Privacy Policy</Link>.
            </p>
          </div>

          <Section id="what-are-cookies" title="1. What Cookies Are">
            <p>
              Cookies are small text files that a website stores on your device. They let the site remember information between page visits — like whether you're logged in, or what language you prefer.
            </p>
            <p>
              "Local storage" is a related browser feature that stores data on your device without an expiry date. Unlike cookies, it's not sent to the server with each request — it just lives in your browser until you or the application clears it.
            </p>
          </Section>

          <Section id="what-we-use" title="2. What We Use and Why">
            <p>
              ShortListr uses a small number of strictly necessary items. We don't use advertising cookies, marketing pixels, or third-party tracking scripts. Here's the full list:
            </p>
            <div className="space-y-3 mt-2">
              <CookieRow
                name="sb-[ref]-auth-token"
                type="Essential cookie"
                purpose="Set by Supabase, our authentication provider. Keeps you logged in between page loads. Without this cookie, you'd be signed out every time you navigate to a new page."
                expires="Session or up to 1 week, depending on your login method"
              />
              <CookieRow
                name="rf_theme"
                type="Preference (local storage)"
                purpose="Stores your light or dark mode preference so it's remembered the next time you visit. This is stored in your browser's local storage, not as a cookie — it's never sent to our servers."
                expires="Persists until you clear browser storage or change your preference"
              />
            </div>
            <p className="mt-2">
              That's it. Two items. One keeps you logged in. One remembers your display preference.
            </p>
          </Section>

          <Section id="no-tracking" title="3. What We Don't Use">
            <p>
              To be explicit about what is <em>not</em> present on ShortListr:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>No advertising or retargeting cookies</li>
              <li>No Google Analytics, Meta Pixel, or similar third-party analytics scripts</li>
              <li>No cross-site tracking of any kind</li>
              <li>No data sold or shared with data brokers or ad networks</li>
            </ul>
            <p>
              If we ever introduce analytics or other tracking, we will update this policy before doing so.
            </p>
          </Section>

          <Section id="third-party-cookies" title="4. Third-Party Cookies">
            <p>
              The only third-party cookies present on ShortListr are those set by Supabase for authentication purposes (described above). Supabase does not use these cookies to track you across other websites. Their cookie practices are governed by their own privacy policy at supabase.com/privacy.
            </p>
            <p>
              If you sign in via Google or GitHub OAuth, those providers may set their own cookies as part of the authentication flow. Once you're redirected back to ShortListr, only the Supabase session cookie above is active.
            </p>
          </Section>

          <Section id="managing-cookies" title="5. How to Manage Cookies">
            <p>
              You can control cookies through your browser settings. Most browsers let you view, block, or delete cookies at any time. Here are links to instructions for common browsers:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Chrome: Settings → Privacy and security → Cookies and other site data</li>
              <li>Firefox: Settings → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Manage Website Data</li>
              <li>Edge: Settings → Cookies and site permissions</li>
            </ul>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Important:</strong> If you block or delete the Supabase authentication cookie, you will be logged out and will need to sign in again on each visit. The Service will not function correctly without it.
            </p>
            <p>
              To clear local storage (which stores your theme preference), use your browser's developer tools or clear all site data from your browser settings.
            </p>
          </Section>

          <Section id="updates" title="6. Changes to This Policy">
            <p>
              If we change what cookies or storage we use — particularly if we add any analytics or tracking — we will update this page and the effective date before those changes take effect. Your continued use of the Service after any update means you accept the revised policy.
            </p>
            <p>
              This policy works alongside our <Link to="/privacy" className="text-electric-600 dark:text-electric-400 hover:underline">Privacy Policy</Link>, which covers all data we collect more broadly.
            </p>
          </Section>

          <Section id="contact" title="7. Contact">
            <p>Questions about this policy? Email us:</p>
            <div className="mt-3 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">ShortListr</p>
              <p><a href={`mailto:${EMAIL}`} className="text-electric-600 dark:text-electric-400 hover:underline">{EMAIL}</a></p>
            </div>
          </Section>

        </div>
      </div>
    </Layout>
  )
}
