import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import BlogLayout, { InlineCTA } from '../components/layout/BlogLayout'

export default function ResumeForFirstJob() {
  return (
    <>
      <Helmet>
        <title>How to Write Your First Resume That Actually Gets Callbacks | ShortListr</title>
        <meta name="description" content="Writing your first resume is intimidating, but there's a proven formula. Learn what to include, how to structure it, and how to pass ATS filters even with limited experience." />
        <link rel="canonical" href="https://www.shortlistr.us/resume-for-first-job" />
        <meta property="og:title" content="How to Write Your First Resume That Actually Gets Callbacks | ShortListr" />
        <meta property="og:description" content="Writing your first resume is intimidating, but there's a proven formula. Learn what to include, how to structure it, and how to pass ATS filters even with limited experience." />
        <meta property="og:url" content="https://www.shortlistr.us/resume-for-first-job" />
      </Helmet>

      <BlogLayout
        badge="First Resume"
        title="How to Write Your First Resume That Actually Gets Callbacks"
        description="Your first resume doesn't need years of experience to be competitive. It needs to be structured correctly, targeted specifically, and optimized to pass the ATS systems that screen every application."
        readTime="7 min"
      >
        <p>
          Writing your first resume is one of the more anxiety-inducing tasks in early adulthood. What do you put in it when you haven't had a "real job" yet? How long should it be? What format? And does any of this even matter if you don't have experience?
        </p>
        <p>
          Good news: the rules for a first resume are actually simpler than they look, and you almost certainly have more to work with than you think.
        </p>

        <h2>How Long Should Your First Resume Be?</h2>
        <p>
          One page. Full stop. Recruiters spend 6–10 seconds on a first scan of any resume. For a candidate without extensive work history, a second page filled with padding is worse than a clean, well-organized single page. Every line should earn its place.
        </p>

        <h2>What to Include When You Have No Work History</h2>
        <p>
          First resume doesn't mean blank resume. Here's what goes in it:
        </p>
        <ul>
          <li><strong>Contact information:</strong> Name, professional email, phone number, LinkedIn (if active), GitHub or portfolio (if relevant to the field). No mailing address needed.</li>
          <li><strong>Professional summary:</strong> 2–3 sentences. Who you are, what you can do, what you're looking for. Write this last — it's easier once the rest is done.</li>
          <li><strong>Education:</strong> More prominent for first-jobbers than for experienced candidates. Include your degree, major, university, and graduation date. GPA if 3.5 or above. Relevant coursework if the courses directly relate to the role.</li>
          <li><strong>Projects:</strong> Academic projects, personal projects, class assignments with real outputs. If you built something, created something, or solved a real problem — it belongs here.</li>
          <li><strong>Skills:</strong> Technical skills (software, programming languages, tools), languages, certifications. Be specific: "Microsoft Excel" is better than "Microsoft Office Suite" for most roles.</li>
          <li><strong>Any work experience:</strong> Part-time, volunteer, internship, freelance — regardless of whether it's directly related. It shows you can show up, follow through, and work with others.</li>
          <li><strong>Activities and leadership:</strong> Student organizations, clubs, sports teams — especially if you held any kind of leadership role.</li>
        </ul>

        <h2>The Right Order (For First-Time Candidates)</h2>
        <p>
          Standard resume order puts work experience first. For first-time job seekers, a slightly different order often works better:
        </p>
        <ol>
          <li>Contact information</li>
          <li>Professional summary</li>
          <li>Skills / Technical skills</li>
          <li>Projects (if strong and relevant)</li>
          <li>Education</li>
          <li>Work experience (even if unrelated)</li>
          <li>Activities / Leadership</li>
        </ol>
        <p>
          Putting skills and projects before education signals to the reader that you're a capable candidate first, a student second. This is especially effective for technical roles where what you've built matters more than where you studied.
        </p>

        <InlineCTA />

        <h2>How to Write Bullet Points That Sound Credible</h2>
        <p>
          Every bullet point should follow this structure: action verb + what you did + result or context. Even for class projects and volunteer roles:
        </p>
        <ul>
          <li>"Developed a mobile budgeting app in React Native as part of a 3-person senior capstone project, delivered on schedule with full feature set"</li>
          <li>"Managed Instagram account for student newspaper, growing followers from 600 to 2,400 over 8 months through consistent content strategy"</li>
          <li>"Completed 35+ hours of tutoring for 12 students in introductory calculus; 9 of 12 students passed with C or better"</li>
        </ul>
        <p>
          Notice: numbers appear in all three. Scale, team size, results, time — any number makes a bullet point significantly more credible and memorable.
        </p>

        <h2>ATS for First-Time Job Seekers</h2>
        <p>
          Here's something first-time job seekers often don't realize: ATS systems are just as active — often more active — for entry-level roles, because those postings attract the highest application volumes. Companies posting for 20 entry-level positions may receive 1,000+ applications. ATS filtering is essential for managing that volume.
        </p>
        <p>
          For your first resume to pass ATS, you need to:
        </p>
        <ul>
          <li>Use keywords from each job description in your resume — especially in your skills section and project bullets</li>
          <li>Keep your format simple and single-column — no tables, graphics, or creative layouts</li>
          <li>Use standard section headings: Education, Work Experience, Skills, Projects</li>
          <li>Save as .docx or a clean PDF with selectable text</li>
        </ul>
        <p>
          <Link to="/auth?mode=signup">ShortListr</Link> works for first-time candidates too. Paste in the job description for each role you're applying to, upload your resume, and get a keyword gap analysis showing exactly what to add. It's the fastest way to see whether your first resume will pass ATS for a specific role.
        </p>

        <h2>The Summary: Your First Impression in 2 Sentences</h2>
        <p>
          Write your professional summary last. After you've assembled the rest of your resume, you'll have a much clearer sense of what your strongest, most relevant points are. Your summary should name your field, your strongest skills, and your immediate goal:
        </p>
        <p>
          "Recent marketing graduate with hands-on experience in social media management, content creation, and Google Analytics. Seeking an entry-level digital marketing role where I can contribute to audience growth and campaign performance from day one."
        </p>
        <p>
          Specific. Confident. Points to real skills. That's all a first resume summary needs to do.
        </p>
      </BlogLayout>
    </>
  )
}
