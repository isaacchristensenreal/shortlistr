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

export default function CopyrightPage() {
  return (
    <Layout>
      <div className="bg-white dark:bg-navy-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-16">

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Copyright & DMCA Policy</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
          </div>

          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-10">
            ShortListr respects the intellectual property rights of others and expects all users of our platform to do the same. This page outlines our copyright policy and the procedure for submitting a DMCA takedown request or counter-notice.
          </p>

          <Section id="ip-notice" title="1. Intellectual Property Notice">
            <p>
              All content, features, and functionality of the ShortListr platform are protected by copyright, trademark, trade secret, and other applicable intellectual property laws of the United States and international jurisdictions.
            </p>
            <p>
              Unauthorized reproduction, distribution, modification, or use of any part of this platform — whether for commercial or non-commercial purposes — without prior written permission from ShortListr is strictly prohibited and may result in civil or criminal liability.
            </p>
          </Section>

          <Section id="ownership" title="2. Ownership of Site Content, Code, and Branding">
            <p>
              The following elements are the exclusive property of ShortListr:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>The ShortListr name, logo, and all associated branding and trademarks</li>
              <li>The design, layout, visual style, and user interface of the platform</li>
              <li>All underlying source code, software architecture, and proprietary algorithms</li>
              <li>AI system prompts, optimization logic, and feature implementations</li>
              <li>Marketing copy, blog posts, documentation, and all original written content published on the site</li>
            </ul>
            <p>
              Nothing on this platform should be construed as granting any license or right to use our intellectual property without our express written consent. Any use of ShortListr trademarks or branding in a way that implies endorsement, affiliation, or sponsorship without authorization is prohibited.
            </p>
          </Section>

          <Section id="user-content" title="3. User Content Ownership">
            <p>
              You retain full ownership of all content you create and submit to ShortListr, including resume text, uploaded PDF files, and job description inputs ("User Content"). ShortListr does not claim ownership over your personal resume data or any content you provide.
            </p>
            <p>
              By submitting User Content to ShortListr, you grant us a limited, non-exclusive, royalty-free license to process, store, and display that content solely for the purpose of providing the Service to you. This license ends when you delete your content or close your account.
            </p>
            <p>
              You represent and warrant that you have all rights necessary to submit your User Content and that it does not infringe upon the intellectual property rights of any third party.
            </p>
          </Section>

          <Section id="dmca-process" title="4. DMCA Takedown Request Process">
            <p>
              ShortListr complies with the Digital Millennium Copyright Act (DMCA), 17 U.S.C. § 512. If you believe that content available on the ShortListr platform infringes your copyright, you may submit a written DMCA takedown notice to our designated agent.
            </p>
            <p>
              Upon receiving a valid, complete takedown notice, we will:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Promptly remove or disable access to the allegedly infringing content</li>
              <li>Notify the user who posted the content that it has been removed</li>
              <li>Document the notice for our records</li>
            </ul>
            <p>
              Please note that under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material is infringing may be liable for damages, including costs and attorneys' fees.
            </p>
          </Section>

          <Section id="dmca-requirements" title="5. Required Information for a Copyright Claim">
            <p>
              To be valid, your DMCA takedown notice must include all of the following:
            </p>
            <div className="space-y-3 mt-1">
              {[
                { n: '1.', label: 'Identification of the copyrighted work', detail: 'A description of the copyrighted work you claim has been infringed, or a representative list if multiple works are covered.' },
                { n: '2.', label: 'Identification of the infringing material', detail: 'A specific description of the material you believe is infringing and its location on our platform (e.g., a URL or page description) sufficient for us to locate it.' },
                { n: '3.', label: 'Your contact information', detail: 'Your full legal name, mailing address, telephone number, and email address.' },
                { n: '4.', label: 'Good faith statement', detail: 'A statement that you have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law.' },
                { n: '5.', label: 'Accuracy statement', detail: 'A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on the owner\'s behalf.' },
                { n: '6.', label: 'Signature', detail: 'A physical or electronic signature of the copyright owner or authorized representative.' },
              ].map(item => (
                <div key={item.n} className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{item.n} {item.label}</p>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-2">
              Send your completed DMCA notice to our designated agent at:
            </p>
            <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">DMCA Agent — ShortListr</p>
              <p>Email: <a href="mailto:shortlistr@gmail.com" className="text-electric-600 dark:text-electric-400 hover:underline">shortlistr@gmail.com</a></p>
            </div>
          </Section>

          <Section id="counter-notice" title="6. Counter-Notice Procedure">
            <p>
              If you believe your content was removed in error or that you have the right to post the material, you may submit a counter-notice. Upon receiving a valid counter-notice, we will forward it to the original complainant and may restore the content after 10–14 business days unless the complainant files a court action.
            </p>
            <p>
              Your counter-notice must include:
            </p>
            <div className="space-y-3 mt-1">
              {[
                { n: '1.', label: 'Your contact information', detail: 'Your full legal name, mailing address, telephone number, and email address.' },
                { n: '2.', label: 'Identification of removed material', detail: 'A description of the material that was removed and its previous location on the platform.' },
                { n: '3.', label: 'Good faith statement', detail: 'A statement under penalty of perjury that you have a good faith belief the material was removed as a result of mistake or misidentification.' },
                { n: '4.', label: 'Consent to jurisdiction', detail: 'A statement that you consent to the jurisdiction of the federal district court in your district (or, if outside the US, any judicial district in which ShortListr may be found), and that you will accept service of process from the complainant.' },
                { n: '5.', label: 'Signature', detail: 'Your physical or electronic signature.' },
              ].map(item => (
                <div key={item.n} className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{item.n} {item.label}</p>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-2">
              Send your counter-notice to the same address:
            </p>
            <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">DMCA Agent — ShortListr</p>
              <p>Email: <a href="mailto:shortlistr@gmail.com" className="text-electric-600 dark:text-electric-400 hover:underline">shortlistr@gmail.com</a></p>
            </div>
          </Section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">General Inquiries</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              For general copyright questions not related to a DMCA claim, contact us at:
            </p>
            <div className="bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/10 rounded-xl p-5 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p className="font-semibold text-slate-800 dark:text-slate-200">ShortListr</p>
              <p>Email: <a href={`mailto:${EMAIL}`} className="text-electric-600 dark:text-electric-400 hover:underline">{EMAIL}</a></p>
            </div>
          </section>

        </div>
      </div>
    </Layout>
  )
}
