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

export default function AcceptableUsePage() {
  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-16">

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Acceptable Use Policy</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
          </div>

          <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 mb-10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              This policy governs how you may use ShortListr. It is part of our{' '}
              <Link to="/terms" className="text-electric-600 dark:text-electric-400 hover:underline">Terms of Service</Link>{' '}
              — by using the Service, you agree to both. Violations may result in immediate account suspension or termination.
            </p>
          </div>

          <Section id="purpose" title="1. Purpose of This Policy">
            <p>
              ShortListr exists to help people put their best foot forward in their job search. To protect the integrity of the platform, the security of our users, and the reliability of our systems, we require that all users interact with the Service in a lawful, respectful, and responsible manner.
            </p>
            <p>
              This policy applies to all users of ShortListr, including free and paid account holders, and covers all features of the platform including resume upload, AI optimization, cover letter generation, and the chat assistant.
            </p>
          </Section>

          <Section id="prohibited" title="2. Prohibited Activities">
            <p>You may not use ShortListr to engage in any of the following:</p>

            <div className="space-y-5 mt-2">

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Illegal Activity</p>
                <p>Using the Service for any purpose that violates applicable local, state, national, or international law or regulation — including but not limited to fraud, identity theft, or violating intellectual property rights.</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Harassment and Abusive Behavior</p>
                <p>Using the Service to threaten, intimidate, harass, or harm any individual. This includes using our AI chat assistant to generate abusive, hateful, or discriminatory content targeting any person or group.</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Uploading Malicious Content</p>
                <p>Uploading, transmitting, or introducing any viruses, malware, spyware, ransomware, or any other malicious code or files designed to damage, disrupt, or gain unauthorized access to our systems or the systems of other users.</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Reverse Engineering</p>
                <p>Attempting to reverse engineer, decompile, disassemble, or otherwise derive the source code, algorithms, or underlying structure of the ShortListr platform, including its AI models, prompts, or backend systems.</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Scraping and Automated Data Extraction</p>
                <p>Using bots, crawlers, scrapers, or any automated tools to access, extract, index, or harvest data from the Service without explicit written permission. This includes scraping resume outputs, feature content, or any other platform data.</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Bypassing Security Controls</p>
                <p>Attempting to circumvent, disable, or interfere with any security feature, rate limit, usage restriction, authentication mechanism, or access control of the Service. This includes creating multiple accounts to bypass free tier limits or using proxies to evade IP-based restrictions.</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Abuse of AI Systems</p>
                <p>Deliberately attempting to manipulate, jailbreak, or exploit the AI systems powering ShortListr — including crafting inputs designed to bypass safety guidelines, extract system prompts, generate harmful content, or cause the AI to behave in unintended ways.</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Impersonation and Fraud</p>
                <p>Creating a false identity, impersonating another person or organization, or using the Service to produce fraudulent resumes that misrepresent your qualifications, employment history, education, or identity for deceptive purposes.</p>
              </div>

              <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Unauthorized Commercial Use</p>
                <p>Reselling, sublicensing, or otherwise commercially exploiting the Service or its outputs without prior written authorization from ShortListr. You may not use our platform to build a competing product or service.</p>
              </div>

            </div>
          </Section>

          <Section id="enforcement" title="3. Enforcement and Account Suspension">
            <p>
              ShortListr reserves the right to investigate any suspected violation of this policy. We may take any of the following actions, at our sole discretion, with or without prior notice:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Issue a warning to the account holder</li>
              <li>Temporarily suspend access to the Service</li>
              <li>Permanently terminate the account and all associated data</li>
              <li>Block access from specific IP addresses or devices</li>
              <li>Report the activity to relevant law enforcement authorities</li>
              <li>Pursue civil or criminal legal action where warranted</li>
            </ul>
            <p>
              Accounts terminated for policy violations forfeit any remaining subscription period without refund. ShortListr is not obligated to provide a reason for suspension or termination in cases involving security risks or ongoing investigations.
            </p>
            <p>
              We reserve the right to cooperate with law enforcement agencies and provide user information when legally required to do so.
            </p>
          </Section>

          <Section id="reporting" title="4. Reporting Violations">
            <p>
              If you become aware of any activity on the ShortListr platform that violates this Acceptable Use Policy — including abuse, harassment, fraudulent use, or security threats — please report it to us immediately.
            </p>
            <p>
              You can reach our team at:
            </p>
            <div className="mt-3 bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">ShortListr</p>
              <p>Email: <a href={`mailto:${EMAIL}`} className="text-electric-600 dark:text-electric-400 hover:underline">{EMAIL}</a></p>
            </div>
            <p className="mt-3">
              We take all reports seriously and will investigate promptly. Reports made in good faith will be kept confidential to the extent possible.
            </p>
          </Section>

        </div>
      </div>
    </Layout>
  )
}
