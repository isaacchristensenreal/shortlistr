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

export default function TermsPage() {
  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-16">

          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Terms of Service</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
          </div>

          <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 mb-10 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            <p>
              These Terms govern your use of ShortListr — an AI-powered resume optimization platform. By using the Service, you're agreeing to these Terms. They work alongside our{' '}
              <Link to="/privacy" className="text-electric-600 dark:text-electric-400 hover:underline">Privacy Policy</Link>,{' '}
              <Link to="/disclaimer" className="text-electric-600 dark:text-electric-400 hover:underline">Legal Disclaimer</Link>, and{' '}
              <Link to="/cookie-policy" className="text-electric-600 dark:text-electric-400 hover:underline">Cookie Policy</Link>.
              If you don't agree with these Terms, don't use the Service.
            </p>
          </div>

          <Section id="definitions" title="1. Definitions">
            <p>
              Throughout these Terms, the following words have consistent meanings:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong className="text-slate-800 dark:text-slate-200">"ShortListr," "we," "us," "our"</strong> — the company operating this platform</li>
              <li><strong className="text-slate-800 dark:text-slate-200">"the Service"</strong> — the ShortListr website, platform, and all features including resume optimization, cover letter generation, AI chat, and version history</li>
              <li><strong className="text-slate-800 dark:text-slate-200">"you," "user"</strong> — anyone who accesses or uses the Service</li>
              <li><strong className="text-slate-800 dark:text-slate-200">"AI-generated content"</strong> — any output produced by the artificial intelligence systems powering the Service</li>
              <li><strong className="text-slate-800 dark:text-slate-200">"User Content"</strong> — any resume text, PDF files, job descriptions, or other material you submit to the Service</li>
            </ul>
          </Section>

          <Section id="acceptance" title="2. Acceptance of Terms">
            <p>
              By creating an account or using any part of the Service, you confirm that you have read, understood, and agree to be bound by these Terms and the documents linked above. These Terms form a legally binding agreement between you and ShortListr.
            </p>
            <p>
              If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">By continuing to use the Service, you explicitly acknowledge that ShortListr provides a writing assistance tool only, that AI-generated outputs may be inaccurate, and that you bear full responsibility for any content you submit to third parties.</strong> See our <Link to="/disclaimer" className="text-electric-600 dark:text-electric-400 hover:underline">Legal Disclaimer</Link> for full details.
            </p>
          </Section>

          <Section id="service" title="3. What the Service Is">
            <p>
              ShortListr is an AI-powered resume optimization platform. We help job seekers tailor their resumes to specific job descriptions — analyzing keyword gaps, rewriting bullet points, generating cover letters, and maintaining version history.
            </p>
            <p>
              We offer a paid Pro tier (unlimited optimizations, $29/month or $149 lifetime one-time payment) and an optional Salary Negotiation add-on ($4.99 one-time). Features and pricing are subject to change at our discretion. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without liability.
            </p>
          </Section>

          <Section id="eligibility" title="4. Eligibility">
            <p>
              You must be at least 13 years old to use the Service. By using the Service, you represent that you meet this requirement. If you're under 18, you represent that a parent or guardian has given permission.
            </p>
            <p>
              You're responsible for ensuring your use of the Service complies with all applicable laws in your jurisdiction.
            </p>
          </Section>

          <Section id="accounts" title="5. Accounts and Responsibilities">
            <p>
              You agree to provide accurate information when creating your account and to keep it up to date. You're solely responsible for all activity that happens under your account. ShortListr is not liable for losses from unauthorized account access caused by your failure to protect your credentials.
            </p>
            <p>
              You may not share your account, create multiple accounts to circumvent billing, or transfer your account to someone else.
            </p>
          </Section>

          <Section id="acceptable-use" title="6. Acceptable Use">
            <p>You agree to use the Service only for lawful purposes. You may not:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Create or submit false, misleading, or fraudulent resume content to employers</li>
              <li>Scrape, crawl, or extract data from the Service using automated tools</li>
              <li>Attempt to reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Bypass, disable, or interfere with security features or rate limits</li>
              <li>Upload malicious files or code intended to harm the Service or other users</li>
              <li>Use the Service to harass, impersonate, or harm any individual</li>
              <li>Resell or commercially exploit the Service without written permission</li>
              <li>Attempt to gain unauthorized access to our systems or databases</li>
            </ul>
            <p>
              Violations may result in immediate suspension or termination of your account without notice or refund. See our <Link to="/acceptable-use" className="text-electric-600 dark:text-electric-400 hover:underline">Acceptable Use Policy</Link> for the full list.
            </p>
          </Section>

          <Section id="ai-content" title="7. AI-Generated Content">
            <p>
              The Service uses third-party AI to generate resume suggestions, rewrites, and cover letters. <strong className="text-slate-800 dark:text-slate-200">By using the Service, you explicitly agree that:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>AI-generated content may contain inaccuracies, hallucinations, or errors</li>
              <li>You are solely responsible for reviewing and verifying all AI-generated content before using it</li>
              <li>ShortListr does not guarantee any employment outcome from using the Service</li>
              <li>AI outputs are writing suggestions only — not career, legal, or professional advice</li>
              <li>ShortListr is not responsible for any consequences from your use of AI-generated content</li>
            </ul>
            <p>
              For the full scope of liability limitations, see our <Link to="/disclaimer" className="text-electric-600 dark:text-electric-400 hover:underline">Legal Disclaimer</Link>.
            </p>
          </Section>

          <Section id="ip" title="8. Intellectual Property">
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Your content:</strong> You retain full ownership of User Content you upload. By submitting content to the Service, you grant us a limited, non-exclusive license to process it solely to deliver the Service to you. We do not sell your data or use it to train AI models.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Our platform:</strong> The ShortListr platform — its design, code, branding, AI prompts, and features — is owned by ShortListr and protected by applicable intellectual property laws. You may not copy, reproduce, or create derivative works without explicit written permission.
            </p>
          </Section>

          <Section id="indemnification" title="9. Indemnification">
            <p>
              You agree to indemnify and hold harmless ShortListr and its owners, officers, employees, and agents from any claims, damages, losses, and expenses (including attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Any User Content you submit</li>
              <li>Your violation of any law or third-party rights</li>
              <li>Any misrepresentation in materials you submit to employers</li>
            </ul>
          </Section>

          <Section id="liability" title="10. Limitation of Liability">
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW, RESUMEFORGE AND ITS OWNERS, EMPLOYEES, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOSS OF EMPLOYMENT OPPORTUNITY, LOSS OF INCOME, OR LOSS OF DATA — ARISING FROM YOUR USE OF THE SERVICE, EVEN IF RESUMEFORGE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
            <p>
              OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12) MONTHS BEFORE THE CLAIM, OR $29 USD IF YOU HAVE NOT MADE ANY PAYMENTS.
            </p>
            <p>
              Some jurisdictions do not allow certain liability exclusions. In those jurisdictions, our liability is limited to the greatest extent permitted by law.
            </p>
          </Section>

          <Section id="warranties" title="11. Disclaimer of Warranties">
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND — EXPRESS OR IMPLIED — INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE MAKE NO WARRANTY THAT AI-GENERATED CONTENT WILL BE ACCURATE OR PRODUCE ANY PARTICULAR EMPLOYMENT RESULT. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.
            </p>
          </Section>

          <Section id="disputes" title="12. Dispute Resolution">
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Informal resolution first:</strong> Before filing any formal legal claim, contact us at {EMAIL} and give us 30 days to resolve the issue.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Binding arbitration:</strong> If informal resolution fails, disputes will be resolved by binding individual arbitration under AAA rules. You waive your right to a jury trial and to participate in a class action.
            </p>
            <p>
              <strong className="text-slate-800 dark:text-slate-200">Class action waiver:</strong> ALL DISPUTES WILL BE HANDLED INDIVIDUALLY — NOT AS CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTIONS.
            </p>
          </Section>

          <Section id="termination" title="13. Termination">
            <p>
              You can delete your account at any time by contacting us. We reserve the right to suspend or terminate any account at any time for any reason, including Terms violations, without notice or refund of remaining subscription credits.
            </p>
            <p>
              Sections 8 through 12 survive termination of these Terms.
            </p>
          </Section>

          <Section id="third-party" title="14. Third-Party Services">
            <p>The Service relies on the following third parties:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong className="text-slate-800 dark:text-slate-200">Supabase</strong> — authentication, database, and serverless infrastructure</li>
              <li><strong className="text-slate-800 dark:text-slate-200">DeepSeek</strong> — AI content generation</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Stripe</strong> — payment processing</li>
            </ul>
            <p>
              We are not responsible for the availability or conduct of third-party providers. Outages or failures of third-party services do not entitle you to refunds or compensation from ShortListr.
            </p>
          </Section>

          <Section id="governing-law" title="15. Governing Law">
            <p>
              These Terms are governed by the laws of the United States. Any disputes not subject to arbitration will be resolved in US federal or state courts, and you consent to jurisdiction there.
            </p>
          </Section>

          <Section id="changes" title="16. Changes to These Terms">
            <p>
              We may update these Terms at any time. We'll update the effective date above and notify you of material changes via email or an in-app notice. Continued use of the Service after changes take effect means you accept the updated Terms.
            </p>
          </Section>

          <Section id="contact" title="17. Contact">
            <p>Questions about these Terms? Contact us:</p>
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
