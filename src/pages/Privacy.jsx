import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'

const EFFECTIVE_DATE = 'March 15, 2025'
const EMAIL = 'shortlistr@gmail.com'
const BUSINESS = 'ShortListr'
const SERVICE = 'the Service'

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

function ThirdPartyCard({ name, detail }) {
  return (
    <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-4">
      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{name}</p>
      <p>{detail}</p>
    </div>
  )
}

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Privacy Policy</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
          </div>

          <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 mb-10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              This policy explains exactly what data {BUSINESS} collects, why we collect it, and what we do with it. We've written it to be readable — not to bury important things in legal language. If you use {SERVICE}, this policy applies to you. It works alongside our{' '}
              <Link to="/terms" className="text-electric-600 dark:text-electric-400 hover:underline">Terms of Service</Link>{' '}
              and our{' '}
              <Link to="/cookie-policy" className="text-electric-600 dark:text-electric-400 hover:underline">Cookie Policy</Link>.
            </p>
          </div>

          <Section id="who-we-are" title="1. Who We Are">
            <p>
              {BUSINESS} is an AI-powered resume optimization platform. We help job seekers tailor their resumes to specific job descriptions using artificial intelligence — analyzing keyword gaps, rewriting bullet points, and generating cover letters. When we say "we," "us," or "{BUSINESS}," we mean the company operating this platform. When we say "you" or "user," we mean anyone who accesses or uses {SERVICE}.
            </p>
          </Section>

          <Section id="what-we-collect" title="2. What We Collect">
            <p>
              We only collect data that's necessary to run the Service. Here's what that looks like in practice:
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Account data:</strong> Your email address and, if you sign in via Google or GitHub, your name and profile email from that provider. We use this to identify your account and communicate with you.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Resume and job content:</strong> The resume text, uploaded PDF files, and job description text you submit to {SERVICE}. This is the core of what you're here to do — we process it to generate your optimized output.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Usage data:</strong> Which features you use, how many optimizations you've run this month, your plan tier, and timestamps of activity. We use this to enforce plan limits and understand how the product is being used.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Technical data:</strong> Your IP address, browser type, operating system, and the URL that referred you to our site. This is collected automatically by our infrastructure when you visit.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Payment data:</strong> If you upgrade to Pro, Stripe handles your payment directly. We receive confirmation that a payment was made, but we never see or store your card number or billing details.
            </p>
          </Section>

          <Section id="how-we-use-it" title="3. How We Use It">
            <p>
              We use the data we collect to do one thing: run {SERVICE} for you. Specifically:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Create and manage your account</li>
              <li>Process your resume and job description to generate AI-optimized output</li>
              <li>Track your monthly optimization count against your plan</li>
              <li>Process your payment and manage your subscription</li>
              <li>Send transactional emails — password resets, account notices — when needed</li>
              <li>Identify and respond to abuse, fraud, or security incidents</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">We do not sell your data.</strong> We do not use your resume content to train AI models. We do not share your data with advertisers.
            </p>
          </Section>

          <Section id="storage-security" title="4. How We Store and Protect It">
            <p>
              Your data is stored in Supabase-managed databases with encrypted connections, row-level security, and restricted access. All traffic to and from {SERVICE} is encrypted via HTTPS. Authentication credentials are hashed and never stored in plain text.
            </p>
            <p>
              No system is 100% secure. We take reasonable precautions, but we can't guarantee absolute security against all possible threats. If a data breach occurs that affects your personal information, we will notify you as required by applicable law.
            </p>
          </Section>

          <Section id="third-parties" title="5. Who Else Sees Your Data">
            <p>
              We use a small number of third-party services to operate {SERVICE}. Here's who they are and what they see:
            </p>
            <div className="space-y-3">
              <ThirdPartyCard
                name="Supabase"
                detail="Our backend infrastructure provider. Your account data, resume content, and usage history are stored in Supabase-managed databases. Supabase operates under strict security standards. Their privacy policy is at supabase.com/privacy."
              />
              <ThirdPartyCard
                name="DeepSeek"
                detail="The AI model that processes your resume and job description to generate optimized content. Your resume text and job description are sent to DeepSeek's API when you run an optimization. Their privacy policy is at deepseek.com."
              />
              <ThirdPartyCard
                name="Stripe"
                detail="Payment processing for Pro subscriptions. Stripe receives your payment details directly — we never see or store your card number. Their privacy policy is at stripe.com/privacy."
              />
              <ThirdPartyCard
                name="Google / GitHub"
                detail="If you choose to sign in with Google or GitHub, we receive your name and email from that provider. Their use of your data is governed by their own privacy policies."
              />
            </div>
            <p>
              We do not share your data with any other third party unless required by law.
            </p>
          </Section>

          <Section id="cookies" title="6. Cookies and Local Storage">
            <p>
              We use a minimal set of cookies and browser storage to keep the Service working. We don't use advertising cookies or third-party tracking. For full details, see our{' '}
              <Link to="/cookie-policy" className="text-electric-600 dark:text-electric-400 hover:underline">Cookie Policy</Link>.
            </p>
            <p>
              In brief: we store your authentication session (so you stay logged in) and your theme preference (light or dark mode). That's it.
            </p>
          </Section>

          <Section id="your-rights" title="7. Your Rights">
            <p>
              You have the following rights regarding your personal data. To exercise any of them, email us at the address below — we'll respond within 30 days.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Access:</strong> Request a copy of the personal data we hold about you</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Correction:</strong> Ask us to fix inaccurate or incomplete data</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Deletion:</strong> Request that we delete your account and all associated data</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Portability:</strong> Request your data in a portable format</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Objection:</strong> Object to certain processing of your data</li>
            </ul>
            <p>
              Deleting your account permanently removes your resume data and version history. Some anonymized or aggregated data may be retained for internal purposes.
            </p>
          </Section>

          <Section id="children" title="8. Children's Privacy">
            <p>
              {BUSINESS} is not directed at children under 13. We don't knowingly collect data from anyone under 13. If you believe a child under 13 has created an account, contact us and we'll remove the account promptly.
            </p>
          </Section>

          <Section id="retention" title="9. How Long We Keep It">
            <p>
              We keep your account data and resume content for as long as your account is active. If you delete your account, we remove your personal data from our active systems within 30 days. We may retain certain data longer if required by law or to resolve active disputes.
            </p>
          </Section>

          <Section id="international" title="10. International Users">
            <p>
              {BUSINESS} is operated from the United States. If you're accessing the Service from outside the US, your data will be transferred to and processed in the United States. By using the Service, you consent to that transfer.
            </p>
          </Section>

          <Section id="updates" title="11. Changes to This Policy">
            <p>
              If we make significant changes to this policy, we'll notify you by email or with a notice in the app before the changes take effect. Minor changes (like clarifications) will be reflected by updating the effective date at the top of this page. Continued use of the Service after any change means you accept the updated policy.
            </p>
          </Section>

          <Section id="contact" title="12. Contact">
            <p>Questions about this policy or your data? Email us:</p>
            <div className="mt-3 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
              <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{BUSINESS}</p>
              <p><a href={`mailto:${EMAIL}`} className="text-electric-600 dark:text-electric-400 hover:underline">{EMAIL}</a></p>
            </div>
          </Section>

        </div>
      </div>
    </Layout>
  )
}
