// B2B pivot (2026): coaches manage clients, not individuals managing their
// own job search. These flags hide job-seeker-only tools without deleting
// their code/routes/edge functions, in case any of them get reintroduced
// as a coach- or client-facing feature later.
export const FEATURES = {
  jobRecommendations: false,       // live job listings + job matches for an individual's own search — B2C only
  rejectionReasonPredictor: false, // "why was *I* rejected" — B2C only, explicitly cut per B2B pivot
  salaryNegotiator: false,         // individual salary negotiation emails — B2C only
  linkedinOptimizer: false,        // ambiguous: could become a client-profile tool later, hidden for now
  interviewPrep: false,            // ambiguous: could become a client coaching tool later, hidden for now
}
