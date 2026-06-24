# PRD
Project Requirements Document

AI-Powered Design Talent Discovery & Hiring Platform
MVP Sprint  |  Internal Documentation

01 Project Overview

1.1  Project Identity
Attribute	Value
Project Name	AI-Powered Design Talent Discovery & Hiring Platform
Document Type	Project Requirements Document (PRD)
Version	MVP Sprint
Sprint Duration	6 Weeks (MVP Delivery)
Status	Active Development
Classification	Internal — Sprint Documentation

1.2  Executive Summary
This document defines the complete functional and non-functional requirements for an AI-powered career and hiring platform purpose-built for design students, fresh graduates, and creative professionals. The platform moves beyond traditional resume-based hiring by introducing portfolio intelligence, multi-stage AI assessments, and intelligent candidate-job matchmaking.
The system is designed as a multi-pod ecosystem where specialized modules work together to deliver a transparent, data-driven hiring experience for both candidates and recruiters. The MVP targets a working pilot launch within a six-week sprint.

02 Problem Statement

2.1  The Core Problem
The current hiring landscape for design students and early-career creative professionals is fundamentally broken. Existing platforms are optimized for resume-based evaluation, which fails to capture the true capabilities, portfolio quality, and creative potential of design talent.

Problems Faced by Candidates
• Talented students are rejected because of poor resumes, not poor skills
• No platform provides transparent, actionable feedback on application status
• Portfolio and project experience are rarely considered during screening
• Candidates must search multiple fragmented platforms for opportunities
• No personalized guidance or career readiness insights exist
• Limited visibility into what recruiters actually evaluate or prioritize

Problems Faced by Recruiters
• Manual portfolio review is time-consuming and inconsistent
• Keyword-based ATS systems miss genuinely talented candidates
• No structured way to define and apply nuanced hiring criteria
• Campus hiring workflows are disconnected from core recruitment tools
• Candidate evaluation data (portfolio, assessment, interview) is siloed

2.2  Existing Solutions & Gaps
Platform	Primary Focus	Critical Gap
LinkedIn	Professional Networking	Resume-centric; no portfolio intelligence or creative evaluation
Internshala	Student Internships	No AI matching; generic opportunity discovery; no assessment layer
Behance	Portfolio Showcase	No job matching, no recruiter workflow, no assessment system
Upwork	Freelance Marketplace	Not designed for students or structured hiring; transactional only
Wellfound	Startup Jobs	No portfolio analysis; no domain-specific creative evaluation

03 Vision

3.1  Platform Vision

3.2  Core Value Propositions
For Candidates	For Recruiters
Be discovered based on actual work quality, not just resume formatting	Define nuanced hiring criteria beyond keywords and years of experience
Receive transparent feedback on portfolio quality and skill gaps	Access AI-analyzed candidate intelligence covering portfolio, skills, and assessments
Discover curated, personalized opportunities across multiple platforms	Manage the full hiring pipeline from posting to offer in one place
Track application progress with clear, real-time status updates	Reduce time-to-shortlist through automated portfolio screening

04 Objectives

4.1  Primary Objectives
1. Enable candidates to build rich, AI-enhanced professional profiles and portfolios
2. Provide intelligent, automated portfolio analysis and structured skill extraction
3. Conduct multi-stage candidate assessments that evaluate real capability — not self-reported skills
4. Generate accurate, explainable AI-driven candidate-job matchmaking scores
5. Support recruiters with structured, efficient hiring workflows and candidate intelligence
6. Aggregate and surface relevant opportunities from multiple external platforms
7. Deliver transparent application tracking and communication for candidates
8. Enable campus hiring workflows for institutional recruitment

4.2  Secondary Objectives
9. Provide personalized career readiness scoring and gap analysis for candidates
10. Offer portfolio improvement recommendations powered by AI insights
11. Improve hiring transparency so candidates understand evaluation criteria
12. Support extensibility for future AI models, integrations, and advanced features
13. Create a reusable, well-documented architecture that supports long-term platform growth

05 Stakeholders

5.1  Primary Stakeholders
Stakeholder	Role in Platform	Primary Needs
Design Students	Primary Candidates	Profile creation, portfolio showcase, opportunity discovery, career insights
Fresh Graduates	Primary Candidates	Job matching, assessment completion, application tracking, interview scheduling
Freelancers	Candidate — Freelance	Freelance opportunity discovery, portfolio visibility, project-based matching
Junior Professionals	Candidate — Junior	Skill verification, career advancement opportunities, portfolio enhancement
Recruiters	Hiring Operators	Candidate discovery, pipeline management, interview scheduling, analytics
Hiring Managers	Evaluation Decision-Makers	Candidate review, requirement definition, interview feedback, shortlisting
Administrators	Platform Operators	User management, system configuration, governance, data integrity

5.2  Secondary Stakeholders
Stakeholder	Interest
Educational Institutions	Benefit from campus drive features and placement tracking capabilities
Placement Cells	Manage campus hiring workflows and institutional analytics
Industry Partners	Access talent pipeline and contribute opportunity listings

06 User Personas

6.1  Persona: The Design Student (Priya)
Background	Final-year UI/UX student with strong Figma projects but limited professional experience
Goals	Land a design internship, get portfolio feedback, understand what recruiters want
Frustrations	Resumes fail to convey project quality; no feedback after rejections; scattered opportunity sources
Platform Usage	Creates profile, uploads Behance portfolio, completes assessments, tracks applications

6.2  Persona: The Recruiter (Rahul)
Background	HR lead at a growing design-forward startup, hiring for UI/UX and product roles
Goals	Find talented designers quickly, reduce time-to-hire, evaluate beyond keywords
Frustrations	Manual portfolio review is slow; ATS systems miss creative talent; no structured evaluation framework
Platform Usage	Posts jobs, defines hiring requirements, reviews AI-analyzed candidate profiles, schedules interviews

6.3  Persona: The Hiring Manager (Anika)
Background	Senior designer who joins the hiring process to evaluate creative and technical depth
Goals	Assess candidate thinking quality, design depth, and cultural fit without wading through raw portfolios
Platform Usage	Reviews candidate intelligence summaries, submits evaluation feedback, participates in structured interview flow

6.4  Persona: The Platform Administrator (Vikram)
Background	Platform operations lead responsible for managing user accounts, system configuration, and data governance across the entire platform
Goals	Ensure platform integrity, verify recruiter credentials, maintain access controls, monitor system health, and enforce governance policies
Responsibilities	User account management, recruiter verification, opportunity source configuration, assessment and matchmaking monitoring, audit log review, platform-wide analytics, feature flag management
Platform Usage	Accesses the Admin Console to manage users, approve recruiters, configure system settings, review audit logs, monitor AI pipeline health, and view platform analytics
07 Functional Requirements

The platform is organized into seven specialized pods. Each pod delivers a distinct set of capabilities. Requirements are classified as Must Have (MVP), Should Have (near-term), or Could Have (future scope).

7.1  Candidate Experience Pod
Responsible for all student-facing interactions — onboarding, profile, portfolio, discovery, applications, and tracking.

ID	Category	Requirement	Priority
CE-01	Authentication	The system shall allow candidates to register using email or Google OAuth	Must Have
CE-02	Authentication	The system shall support secure login, session management, and password reset	Must Have
CE-03	Authentication	The system shall enforce role selection during registration to separate candidate and recruiter flows	Must Have
CE-04	Onboarding	The system shall guide candidates through a smart onboarding flow collecting personal information, education, design discipline, skills, career goals, and experience level	Must Have
CE-05	Profile	The system shall allow candidates to build and manage a profile including About Me, Education, Experience, Skills, Certifications, Projects, and Achievements	Must Have
CE-06	Profile	The system shall display a profile completion indicator and provide suggestions to improve profile strength	Should Have
CE-07	Portfolio	The system shall allow candidates to connect portfolios from Behance, Dribbble, or personal websites, or upload PDF portfolios directly	Must Have
CE-08	Portfolio	The system shall allow candidates to manage case studies and preview their portfolio presentation	Should Have
CE-09	Dashboard	The system shall provide a candidate dashboard showing profile status, recommended opportunities, application status, career insights, notifications, and suggested actions	Must Have
CE-10	Opportunity Discovery	The system shall allow candidates to search, filter, and browse opportunities by discipline, opportunity type, work arrangement, and location	Must Have
CE-11	Opportunity Discovery	The system shall surface AI-recommended opportunities personalized to candidate profile and preferences	Should Have
CE-12	Opportunity Discovery	The system shall allow candidates to save opportunities for later review	Should Have
CE-13	Opportunity Details	The system shall display full opportunity details including company overview, role description, required skills, compensation, work type, team information, and hiring process	Must Have
CE-14	Applications	The system shall allow candidates to submit applications attaching resume and portfolio	Must Have
CE-15	Application Tracking	The system shall display real-time application status through stages: Applied, Viewed, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected	Must Have
CE-16	Notifications	The system shall notify candidates of application updates, interview invites, new matched opportunities, and profile improvement suggestions	Must Have
CE-17	Career Insights	The system shall provide career readiness scores, skill gap analysis, and improvement recommendations	Could Have

7.2  Opportunity Intelligence & Discovery Pod
Responsible for discovering, processing, categorizing, and distributing opportunities from multiple external sources.

ID	Category	Requirement	Priority
OI-01	Collection	The system shall collect publicly available opportunity data from supported sources including job boards, design communities, and company career pages	Must Have
OI-02	Collection	The system shall support collection of internships, full-time jobs, freelance opportunities, hackathons, competitions, fellowships, and campus drives	Must Have
OI-03	Extraction	The system shall extract structured metadata from collected opportunities including title, company, description, skills, location, work type, compensation range, experience level, deadline, apply URL, and source platform	Must Have
OI-04	Categorization	The system shall automatically classify opportunities by type, domain, discipline, and difficulty level	Must Have
OI-05	Intelligence	The system shall identify required skills, detect opportunity domain, and generate enriched metadata for downstream matchmaking	Must Have
OI-06	Search	The system shall support keyword, skill, domain, location, and remote-work search across collected opportunities	Must Have
OI-07	Recommendations	The system shall generate personalized opportunity recommendations based on candidate profile data	Should Have
OI-08	Deduplication	The system shall deduplicate opportunities collected from multiple sources	Must Have
OI-09	Analytics	The system shall track opportunity engagement metrics including views, saves, and applications per listing	Could Have
OI-10	Refresh Frequency	The system shall refresh collected opportunity data at a minimum frequency of once every 24 hours to ensure listing currency and reduce stale opportunity exposure	Must Have
OI-11	Source Priority	Opportunity sources shall be prioritized in the following order for data quality and relevance: Internshala, LinkedIn, Wellfound, Behance Jobs, Dribbble Jobs, Company Career Pages, Hackathon Platforms	Should Have
OI-12	Deduplication Logic	The deduplication engine shall identify duplicate listings by matching on title, company name, and location with fuzzy matching tolerance to account for minor formatting variations across sources	Must Have
OI-13	Data Quality Validation	Collected opportunities shall pass a minimum quality threshold requiring at least: job title, company name, opportunity type, and one of either skills list or job description before being listed on the platform	Must Have
OI-14	Legal Compliance	The system shall collect only publicly available opportunity data and shall respect robots.txt directives, rate limits, and applicable terms of service of supported platforms	Must Have

7.3  Portfolio Intelligence Pod
Responsible for automated ingestion, analysis, and intelligence generation from candidate portfolios.

ID	Category	Requirement	Priority
PI-01	Ingestion	The system shall support portfolio ingestion from PDF uploads, Behance profiles, Dribbble profiles, personal websites, and Figma links	Must Have
PI-02	Extraction	The system shall extract skills, tools, technologies, design artifacts, project descriptions, and experience indicators from portfolios	Must Have
PI-03	Analysis	The system shall evaluate portfolio quality across dimensions including project quality, design artifact depth, creativity, tool proficiency, presentation quality, and consistency	Must Have
PI-04	Intelligence	The system shall generate a Portfolio Intelligence Report summarizing candidate skills, tools, project highlights, strengths, target roles, and portfolio scores	Must Have
PI-05	Embeddings	The system shall generate semantic embeddings from portfolio content to enable vector-based matching	Must Have
PI-06	Scoring	The system shall produce individual portfolio scores across defined evaluation dimensions and an aggregate portfolio quality score	Must Have
PI-07	Recommendations	The system shall provide portfolio improvement recommendations based on analysis findings	Should Have
PI-08	Integration	The system shall expose Portfolio Intelligence Reports as structured data consumable by the AI Matchmaking Pod and Recruiter Platform	Must Have

7.4  Assessment & Intelligence Pod
Responsible for multi-stage candidate evaluation through adaptive quiz, AI hackathon, AI interview, proctoring, and intelligence report generation.

ID	Category	Requirement	Priority
AI-01	Orchestration	The system shall orchestrate a multi-stage assessment flow progressing through Adaptive Quiz, AI Hackathon, and AI Interview based on job requirements	Must Have
AI-02	Adaptive Quiz	The system shall conduct an adaptive knowledge assessment where question difficulty adjusts dynamically based on candidate responses	Must Have
AI-03	Adaptive Quiz	The system shall cover multiple competency areas including technical knowledge, domain understanding, and problem-solving	Must Have
AI-04	AI Hackathon	The system shall present candidates with a practical challenge appropriate to the job role, enabling submission of prototype, design solution, or problem-solving artifact	Must Have
AI-05	AI Hackathon	The system shall evaluate hackathon submissions across dimensions including usability, accessibility, execution quality, and creative thinking	Must Have
AI-06	AI Interview	The system shall conduct an AI-driven interview using dynamically generated questions informed by quiz gaps and hackathon decisions	Should Have
AI-07	AI Interview	The system shall generate contextual follow-up questions based on candidate responses	Should Have
AI-08	Proctoring	The system shall monitor assessment integrity by tracking behavioral signals and producing an authenticity score and risk classification	Must Have
AI-09	Scoring	The system shall compute a composite assessment score from weighted contributions of quiz, hackathon, and interview stages	Must Have
AI-10	Intelligence	The system shall generate a Final Intelligence Report covering knowledge score, problem-solving ability, creativity, communication, reasoning, execution capability, and career readiness	Must Have
AI-11	Integration	The system shall expose Assessment Intelligence Reports as structured data consumable by the AI Matchmaking Pod and Recruiter Platform	Must Have
AI-12	Adaptive Quiz	The adaptive quiz shall cover a minimum of 15 questions per assessment, adjusting difficulty upward on correct responses and downward on incorrect, maintaining candidate engagement and accurate skill calibration	Must Have
AI-13	Scoring Weights	The composite assessment score shall be computed using the following weightage: Adaptive Quiz contributes 30%, AI Hackathon contributes 40%, and AI Interview contributes 30% of the final score	Must Have
AI-14	Intelligence Dimensions	The Final Intelligence Report shall evaluate candidates across eight dimensions: Knowledge (25%), Problem Solving (20%), Creativity (20%), Communication (15%), Reasoning (10%), Execution (5%), Career Readiness (3%), and Company Match (2%)	Must Have
AI-15	Proctoring Thresholds	The proctoring system shall classify candidates as Low Risk, Medium Risk, or High Risk based on behavioral signals including copy-paste events, tab switches exceeding three occurrences, idle time exceeding 5 minutes, and abnormal deletion patterns	Must Have
AI-16	Hackathon Evaluation	AI Hackathon submissions shall be evaluated across four dimensions with defined weights: Usability and Accessibility (30%), Execution Quality and Completeness (30%), Creative Thinking and Problem Framing (25%), and Presentation Clarity (15%)	Must Have
AI-17	AI Interview	The AI Interview shall generate a minimum of 5 and maximum of 10 contextual questions informed by quiz knowledge gaps, hackathon design decisions, and role requirements, with adaptive follow-ups based on candidate depth of response	Should Have
AI-18	Risk Thresholds	Candidates classified as High Risk by the proctoring system shall have their assessment results flagged for recruiter review and shall not be auto-shortlisted by the matchmaking engine without manual override	Must Have

7.5  AI Matchmaking Pod
Responsible for intelligently connecting candidates to opportunities using a multi-signal hybrid scoring model.

ID	Category	Requirement	Priority
MK-01	Data Ingestion	The system shall ingest candidate profile data, portfolio intelligence reports, assessment intelligence reports, and job requirement specifications	Must Have
MK-02	Matching Engine	The system shall compute candidate-job match scores using a hybrid approach combining semantic vector search and lexical matching	Must Have
MK-03	Scoring Model	The system shall produce a weighted match score considering skill alignment, portfolio quality, assessment performance, experience fit, and domain alignment	Must Have
MK-04	Scoring Model	The default scoring model shall weight contributions as: Skills 30%, Portfolio 25%, Assessment 20%, Experience 15%, Domain 10%	Must Have
MK-05	Reranking	The system shall apply cross-encoder reranking to refine initial match results for higher contextual accuracy	Should Have
MK-06	Candidate Output	The system shall surface ranked job recommendations to candidates with match scores and fit status	Must Have
MK-07	Recruiter Output	The system shall surface ranked candidate recommendations to recruiters with match scores, skill alignment, and portfolio fit indicators	Must Have
MK-08	Reports	The system shall generate a Candidate Match Report identifying strengths, skill gaps, and recommended opportunities	Should Have
MK-09	Reports	The system shall generate a Recruiter Match Report ranking candidates with alignment rationale	Should Have
MK-10	Feedback	The system shall incorporate recruiter feedback signals to improve future matching recommendations	Could Have
MK-11	Score Calculation	The skill alignment score (30%) shall be computed by comparing extracted candidate skills against required job skills using exact match and semantic similarity, normalized to a 0-100 scale	Must Have
MK-12	Score Calculation	The portfolio score (25%) shall be derived directly from the aggregate Portfolio Quality Score generated by the Portfolio Intelligence Pod, normalized to the matchmaking scoring scale	Must Have
MK-13	Score Calculation	The assessment score (20%) shall be derived from the Final Intelligence Report composite score produced by the Assessment and Intelligence Pod, weighted proportionally	Must Have
MK-14	Confidence Score	The matchmaking engine shall accompany each match score with a confidence indicator (High, Medium, Low) based on data completeness — candidates with incomplete portfolios or missing assessments shall receive lower confidence ratings	Should Have

7.6  Recruiter Platform Pod
Responsible for all recruiter and hiring manager workflows — job creation, candidate management, pipeline, interviews, campus drives, and analytics.

ID	Category	Requirement	Priority
RP-01	Authentication	The system shall support role-based access for Recruiters, Hiring Managers, and Administrators with appropriate permission boundaries	Must Have
RP-02	Dashboard	The system shall provide a recruiter dashboard displaying active jobs, candidate counts, interview pipeline, offers sent, hiring funnel, and recent activity	Must Have
RP-03	Job Requisitions	The system shall allow recruiters to create and manage job requisitions including title, department, location, employment type, priority level, target hire date, and role description	Must Have
RP-04	Hiring Requirements	The system shall provide a Hiring Requirement Builder enabling recruiters to define and weight evaluation criteria such as creativity, problem-solving, communication, execution, leadership, and innovation	Must Have
RP-05	Candidate Pipeline	The system shall provide a candidate pipeline view tracking candidate stages: Applied, Matched, Assessment Completed, Shortlisted, Interviewing	Must Have
RP-06	Candidate Review	The system shall present integrated candidate intelligence to recruiters including portfolio analysis summary, assessment scores, match score, skill alignment, and behavioral indicators	Must Have
RP-07	Interview Management	The system shall allow recruiters to schedule, track, and manage interviews including interviewer assignment, format selection, and status tracking	Must Have
RP-08	Campus Hiring	The system shall support campus drive management including drive creation, registration tracking, shortlist management, and status monitoring	Should Have
RP-09	Notifications	The system shall send recruiters notifications for interview reminders, assessment completions, and offer workflow updates via email and in-platform alerts	Must Have
RP-10	Analytics	The system shall provide recruitment analytics covering time-to-shortlist, pipeline conversion rates, source performance, and hiring outcomes	Should Have
RP-11	Admin Console	The system shall provide an administrator console for user management, role assignment, system configuration, and data governance	Must Have

7.7  Scheduling & Communication Pod
Responsible for application lifecycle management, interview scheduling, task management, follow-up tracking, and communication workflows.

ID	Category	Requirement	Priority
SC-01	Application Tracking	The system shall maintain and display complete application lifecycle status from submission through final decision	Must Have
SC-02	Interview Scheduling	The system shall support interview scheduling with calendar integration, availability selection, and confirmation workflows	Must Have
SC-03	Interview Scheduling	The system shall support both online and offline interview formats and send automated confirmations to all parties	Must Have
SC-04	Task Management	The system shall allow candidates to track preparation tasks, upcoming interviews, and pending action items	Should Have
SC-05	Follow-Up Management	The system shall track follow-up actions and reminders for both candidates and recruiters	Should Have
SC-06	Notifications	The system shall deliver timely notifications for interview reminders, application updates, and action required alerts	Must Have
SC-07	Communication	The system shall support in-platform messaging between candidates and recruiters for interview coordination	Could Have
SC-08	Calendar Integration	The system shall support calendar synchronization for interview scheduling workflows	Should Have


7.8  Admin & Platform Management Pod
Responsible for platform governance, user management, recruiter verification, system configuration, audit logging, and administrative analytics.

ID	Category	Requirement	Priority
AD-01	User Management	The system shall allow administrators to create, view, edit, suspend, and delete user accounts for candidates and recruiters	Must Have
AD-02	Recruiter Verification	The system shall support a recruiter verification workflow where administrators can approve or reject recruiter registrations before platform access is granted	Must Have
AD-03	Opportunity Source Management	The system shall allow administrators to configure, enable, or disable opportunity data sources used by the Opportunity Intelligence Pod	Must Have
AD-04	Assessment Monitoring	The system shall provide administrators with visibility into assessment completion rates, flagged assessments, and proctoring risk distributions	Must Have
AD-05	Matchmaking Monitoring	The system shall allow administrators to monitor matchmaking engine performance, review score distributions, and flag anomalous results for investigation	Should Have
AD-06	Audit Logs	The system shall maintain audit logs of all administrative actions including user modifications, role changes, and configuration updates, with timestamps and actor identity	Must Have
AD-07	Analytics Dashboard	The system shall provide an administrative analytics dashboard displaying platform-wide KPIs including registered users, active opportunities, assessment throughput, and match acceptance rates	Should Have
AD-08	Platform Configuration	The system shall allow administrators to configure platform-wide settings including assessment scoring weights, matching thresholds, notification templates, and feature flags	Must Have

8.1  User Stories
User stories describe platform capabilities from the perspective of each stakeholder. Each story follows the format: As a [role], I want [capability], so that [benefit].
ID	Persona	User Story	Benefit / Outcome
US-001	Candidate	As a candidate, I want to register and create a profile so that I can be discovered by recruiters based on my actual skills and work	Profile visibility without relying on resume formatting
US-002	Candidate	As a candidate, I want to connect my Behance or Dribbble portfolio so that the platform can analyze my work automatically	Portfolio intelligence report generated without manual data entry
US-003	Candidate	As a candidate, I want to complete a multi-stage assessment so that my real capabilities are verified beyond self-reported skills	Assessment intelligence report shared with matched recruiters
US-004	Candidate	As a candidate, I want to receive AI-matched job and internship recommendations so that I can discover relevant opportunities faster	Personalized opportunity feed ranked by match score
US-005	Candidate	As a candidate, I want to track my application status in real time so that I always know where I stand in the hiring process	Clear status visibility from applied through selected or rejected
US-006	Candidate	As a candidate, I want to receive career readiness scores and skill gap feedback so that I can improve and become more competitive	Actionable improvement recommendations from AI analysis
US-007	Recruiter	As a recruiter, I want to create job requisitions and define hiring criteria so that candidates are evaluated consistently against role-specific standards	Hiring Requirement Blueprint generated for AI matching
US-008	Recruiter	As a recruiter, I want to view AI-analyzed candidate intelligence summaries so that I can make shortlisting decisions without manually reviewing each portfolio	Faster time-to-shortlist with portfolio and assessment data consolidated
US-009	Recruiter	As a recruiter, I want to manage candidates through a pipeline so that I can track every candidate from application to offer in one place	Full ATS pipeline visibility from Applied to Hired
US-010	Recruiter	As a recruiter, I want to schedule and manage interviews so that the hiring process moves forward without manual coordination overhead	Automated interview scheduling with confirmation to all parties
US-011	Recruiter	As a recruiter, I want to create and manage campus drives so that I can run institutional hiring alongside individual job postings	Campus drive registrations, shortlists, and status tracked centrally
US-012	Hiring Manager	As a hiring manager, I want to review candidate intelligence summaries and submit evaluation feedback so that my domain expertise contributes to the final hiring decision	Structured feedback captured for each evaluated candidate
US-013	Administrator	As an administrator, I want to manage users, roles, and system configuration so that platform governance and access control remain consistent	All user accounts and permissions governed from admin console

8.2  Acceptance Criteria
Acceptance criteria define the conditions that must be met for each key requirement to be considered complete. These criteria prevent ambiguous interpretation during development and provide clear test targets.
AC ID	Requirement ID	Acceptance Criteria
AC-001	CE-01 / CE-02	Candidate can register using email or Google OAuth; duplicate email registration is rejected with a clear error; login with valid credentials succeeds; login with invalid credentials fails with an appropriate message; password reset email is delivered within 2 minutes
AC-002	CE-07	Candidate can connect a Behance or Dribbble profile URL; PDF portfolio can be uploaded and stored; uploaded portfolio triggers Portfolio Intelligence analysis automatically; candidate receives a confirmation that analysis has started
AC-003	CE-15	Application status updates are reflected in the candidate dashboard within 60 seconds of a recruiter action; all seven status stages are displayed correctly; candidate receives a notification when status changes
AC-004	OI-01 / OI-03	Collected opportunities display title, company, description, skills, location, work type, compensation range, experience level, deadline, apply URL, and source platform; opportunities missing title or company are excluded from listings
AC-005	OI-08	Duplicate opportunities from multiple sources are merged into a single listing; the deduplicated listing retains data from the highest-priority source; no duplicate opportunity appears in search results
AC-006	PI-04	Portfolio Intelligence Report is generated within 5 minutes of portfolio submission; report includes candidate summary, extracted skills list, tool proficiency, project highlights, strengths, target roles, and aggregate portfolio score; report is accessible to both candidate and matched recruiters
AC-007	AI-01 / AI-09	Assessment flow progresses from Adaptive Quiz to AI Hackathon to AI Interview in the correct sequence; candidate cannot skip stages; composite score is calculated using the defined weightage (Quiz 30%, Hackathon 40%, Interview 30%); Final Intelligence Report is generated upon completion
AC-008	AI-08	Proctoring system logs tab switch events, copy-paste events, idle time periods, and deletion behavior throughout the assessment; a risk classification of Low, Medium, or High is assigned at the end of the session; High Risk assessments are flagged in the recruiter view
AC-009	MK-03 / MK-04	Match scores are computed for all candidate-job pairs where candidate has an active profile; scores reflect the defined weights (Skills 30%, Portfolio 25%, Assessment 20%, Experience 15%, Domain 10%); scores update when new portfolio or assessment data is available
AC-010	RP-03	Recruiter can create a job requisition with all required fields (title, department, location, employment type, priority, target hire date, description); mandatory field validation prevents submission with missing required data; newly created job appears in the recruiter dashboard immediately; job is registered in the matchmaking engine within 5 minutes
AC-011	RP-04	Hiring Requirement Builder allows recruiters to set individual weights for at least 8 evaluation criteria; total weights must sum to 100%; saved requirement blueprint is applied to candidate scoring for that specific job; changes to requirements trigger re-scoring of existing candidates
AC-012	RP-05	Candidate pipeline displays all stages correctly; drag-and-drop or stage-change action moves candidate between stages; stage change triggers notification to candidate; pipeline count updates in real time
AC-013	SC-02 / SC-03	Interview can be scheduled by recruiter with date, time, format, and interviewer assignment; candidate receives interview invitation with details; both parties receive confirmation; calendar integration syncs the event; cancellation triggers notification to both parties

08	Non-Functional Requirements

8.1  Performance
ID	Category	Requirement	Priority
NF-01	Performance	Standard user interface interactions shall respond within acceptable timeframes for a smooth experience	Must Have
NF-02	Performance	Opportunity search and candidate search shall return results efficiently without significant delay	Must Have
NF-03	Performance	Portfolio analysis and assessment processing shall complete within a reasonable background processing window	Must Have
NF-04	Performance	The matchmaking engine shall generate candidate and job recommendations at a pace appropriate for interactive use	Should Have

8.2  Security
ID	Category	Requirement	Priority
NF-05	Security	The system shall enforce secure authentication and authorization for all user types and roles	Must Have
NF-06	Security	Candidate and recruiter personal data shall be stored and transmitted securely with appropriate encryption	Must Have
NF-07	Security	Portfolio documents and assessment submissions shall be stored in secure, access-controlled storage	Must Have
NF-08	Security	Role-based access control shall prevent unauthorized access to cross-pod data and admin functions	Must Have

8.3  Scalability
ID	Category	Requirement	Priority
NF-09	Scalability	The platform architecture shall support increasing numbers of users, opportunities, portfolios, and assessments without structural rework	Must Have
NF-10	Scalability	The AI intelligence pipeline shall be designed to accommodate additional data sources and model upgrades	Should Have

8.4  Usability
ID	Category	Requirement	Priority
NF-11	Usability	The platform shall provide intuitive, consistent user interfaces for both candidate and recruiter personas	Must Have
NF-12	Usability	The platform shall be responsive and functional on both desktop and mobile form factors	Should Have
NF-13	Usability	Application status and candidate intelligence shall be communicated clearly without requiring domain expertise to interpret	Must Have

8.5  Availability
ID	Category	Requirement	Priority
NF-14	Availability	The platform shall maintain high availability during the pilot phase with minimal scheduled downtime	Must Have
NF-15	Availability	Critical candidate-facing functions including application submission and status tracking shall be highly reliable	Must Have

09	Scope

9.1  In Scope (MVP)
Feature Area	Included in MVP
Candidate Onboarding & Profile	Full onboarding flow, profile builder, portfolio linking
Portfolio Management	Upload, link, case study management, portfolio preview
Opportunity Discovery	Search, filters, AI recommendations, saved opportunities
Portfolio Intelligence	Automated analysis, skill extraction, quality scoring, intelligence report
Multi-Stage Assessment	Adaptive quiz, AI hackathon, integrity monitoring, intelligence report
AI Matchmaking	Hybrid scoring, candidate rankings, job recommendations
Recruiter Hiring Workflow	Job posting, hiring requirement builder, candidate pipeline, reviews
Interview Scheduling	Interview creation, scheduling, confirmations, tracking
Application Tracking	Real-time candidate status updates across all stages
Notifications	In-platform notifications for key workflow events

9.2  Out of Scope
Feature	Reason Excluded
Payroll & Salary Management	Outside hiring platform scope; belongs to HRMS systems
Employee Management System	Post-hire management is beyond the platform's hiring focus
Background Verification	Specialized service; best handled via third-party integration in future
Financial Transactions	Payments and invoicing are not part of MVP scope
Full HRMS Functionality	Platform is a talent discovery and hiring tool, not an enterprise HR suite
AI Interview Module (MVP)	Planned as Should Have; may be deferred to post-MVP sprint based on complexity
Video Interview Platform	Live video conferencing not part of MVP; scheduling links to external tools only
Offer Letter Generation	Document generation and e-signature workflows are post-MVP; platform marks candidate as Selected only
Enterprise ATS Integrations	Two-way sync with Workday, Greenhouse, Lever etc. is post-MVP; platform is standalone for the pilot
Advanced Analytics & BI	Custom dashboards, funnel exports, and BI reporting beyond pilot KPIs are post-MVP scope
Multi-Language Support	Platform is English-only for MVP; internationalisation (i18n) is a post-pilot roadmap item

10	Success Metrics

10.1  Pilot Launch Targets
Metric Area	Metric	Target (MVP)
Candidate Engagement	Profile completion rate	> 70% of registered candidates
Candidate Engagement	Portfolio submission rate	> 60% of active profiles
Candidate Engagement	Assessment completion rate	> 50% of candidates who start
Application Flow	Application conversion rate	Minimum 1 application submitted per active candidate within 7 days of registration
Recruiter Efficiency	Time-to-shortlist reduction	40% reduction vs. baseline manual screening time
Recruiter Efficiency	Candidate review satisfaction	70% of pilot recruiters rate candidate intelligence summaries as useful or very useful
Platform Intelligence	Match acceptance rate	> 40% of top recommendations reviewed
Platform Intelligence	Portfolio analysis accuracy	80% agreement rate between AI portfolio scores and manual assessor scores in pilot validation
Hiring Outcomes	Interview scheduling success rate	> 80% of scheduled interviews confirmed
Hiring Outcomes	End-to-end flow completion	At least one full hiring cycle completed in pilot

11	Assumptions & Constraints

11.1  Assumptions
Assumption	Statement
Portfolio Availability	Candidates possess at least one portfolio, resume, or project artifact to submit
Recruiter Data Quality	Recruiters provide accurate and complete job requirements when creating postings
Assessment Participation	Candidates understand and accept the multi-stage assessment process as part of applications
Recruiter Judgment	Matchmaking recommendations support recruiter decisions but do not replace human judgment
Opportunity Data	Sufficient publicly available opportunity data exists for the platform to populate meaningful discovery
AI Model Access	Required AI/LLM services remain available and accessible throughout the sprint

11.2  Constraints
Constraint	Description
Time Constraint	MVP must be delivered within a six-week sprint with pilot launch at Week 6
Simplified Workflows	Initial implementation may use simplified versions of complex AI workflows pending model integration
External AI Dependencies	Some intelligence features depend on external LLM and AI services which may introduce latency or availability constraints
Data Quality Dependency	Platform effectiveness is proportional to the completeness and quality of candidate and recruiter data
Opportunity Data	Opportunity collection scope is constrained by publicly available data and supported source integrations
Team Capacity	Feature prioritization reflects the capacity of a multi-pod student sprint team over six weeks
Public Opportunity Data Only	MVP collects only publicly accessible opportunity data; authenticated or paywalled sources are excluded from the pilot
English Language Only	All platform interfaces, assessments, and AI outputs are English-only for the pilot sprint; regional language support is a post-MVP roadmap item
Design Roles Focus	Assessment content, portfolio evaluation criteria, and matchmaking weights are calibrated for design disciplines (UI/UX, graphic design, product design); extension to other domains is post-MVP
Limited Recruiter Onboarding	Pilot recruiter access is manually approved and limited to a small cohort; self-service recruiter sign-up with automated verification is post-MVP
Manual Content Moderation	Opportunity listings, user-generated content, and flagged assessments are moderated manually by the administrator in MVP; automated moderation pipelines are post-MVP

12	User Roles & Permission Matrix
12.1  Role-Based Access Matrix
The following matrix defines feature-level access permissions for each platform role. This serves as the authoritative reference for access control implementation and prevents ambiguity during development.

Feature / Permission	Candidate	Recruiter	Hiring Manager	Admin
Profile Management (own)	✓	✓	✓	✓
Profile Management (all users)	✗	✗	✗	✓
Portfolio Upload & Management	✓	✗	✗	✗
Opportunity Discovery & Search	✓	✓	✓	✓
Job / Opportunity Creation	✗	✓	✗	✓
Hiring Requirement Builder	✗	✓	✗	✓
Candidate Pipeline Management	✗	✓	✓	✓
Assessment Participation	✓	✗	✗	✗
Assessment Review & Results	✗	✓	✓	✓
Interview Scheduling	✗	✓	✓	✓
Interview Feedback Submission	✗	✗	✓	✓
Campus Drive Management	✗	✓	✗	✓
Recruiter Verification & Approval	✗	✗	✗	✓
User Suspension & Deactivation	✗	✗	✗	✓
Role Assignment	✗	✗	✗	✓
Platform Configuration	✗	✗	✗	✓
Audit Log Access	✗	✗	✗	✓
Admin Analytics Dashboard	✗	✗	✗	✓
Opportunity Source Configuration	✗	✗	✗	✓
Application Status Tracking (own)	✓	✗	✗	✗
Recruitment Analytics	✗	✓	✓	✓

Functional Dependency Matrix
The following matrix defines the directional dependencies between pods. A pod listed under 'Depends On' cannot fully function until the listed upstream pods have produced their outputs. This matrix is authoritative for sprint sequencing and integration planning.
Pod	Depends On	Produces Output For
Candidate Experience Pod	None — entry point of the system	Portfolio Intelligence Pod, Assessment & Intelligence Pod, AI Matchmaking Pod, Scheduling & Communication Pod
Opportunity Intelligence Pod	None — independent data collection layer	Candidate Experience Pod (opportunity listings), AI Matchmaking Pod (job embeddings and metadata)
Portfolio Intelligence Pod	Candidate Experience Pod (portfolio links and candidate context)	AI Matchmaking Pod (Portfolio Intelligence Report + embeddings), Recruiter Platform Pod (portfolio summary)
Assessment & Intelligence Pod	Candidate Experience Pod (candidate context), Recruiter Platform Pod (job requirements and scoring weights)	AI Matchmaking Pod (Assessment Intelligence Report), Recruiter Platform Pod (intelligence summary), Candidate Experience Pod (score feedback)
AI Matchmaking Pod	Portfolio Intelligence Pod (Portfolio Report), Assessment & Intelligence Pod (Assessment Report), Opportunity Intelligence Pod (Job Metadata), Candidate Experience Pod (Candidate Profile)	Recruiter Platform Pod (ranked candidates), Candidate Experience Pod (job recommendations)
Recruiter Platform Pod	AI Matchmaking Pod (match scores and candidate rankings)	Scheduling & Communication Pod (interview requests), Assessment & Intelligence Pod (job requirements for assessment configuration)
Scheduling & Communication Pod	Recruiter Platform Pod (interview creation requests), Candidate Experience Pod (application submissions)	Candidate Experience Pod (status updates and notifications)

A	Appendix — Pod Ecosystem Summary

A.1  Pod Overview
Pod	Primary Role	Key Output
Candidate Experience	Student-facing platform	Candidate Profile + Applications
Opportunity Intelligence	Opportunity aggregation & enrichment	Enriched Opportunity Listings
Portfolio Intelligence	Automated portfolio analysis	Portfolio Intelligence Report
Assessment & Intelligence	Multi-stage candidate evaluation	Assessment Intelligence Report
AI Matchmaking	Candidate-job matching engine	Match Scores + Rankings
Recruiter Platform	Recruiter hiring workflows	Pipeline + Hiring Decisions
Scheduling & Communication	Interview & application lifecycle	Interviews + Status Updates

A.2  Data Flow Summary
Opportunity Intelligence Pod  →  Candidate Experience Pod (opportunity listings)
Candidate Experience Pod  →  Portfolio Intelligence Pod (portfolio links)
Candidate Experience Pod  →  Assessment & Intelligence Pod (candidate context)
Portfolio Intelligence Pod  →  AI Matchmaking Pod (portfolio report + embeddings)
Assessment & Intelligence Pod  →  AI Matchmaking Pod (assessment report)
AI Matchmaking Pod  →  Recruiter Platform Pod (ranked candidates)
AI Matchmaking Pod  →  Candidate Experience Pod (job recommendations)
Recruiter Platform Pod  →  Scheduling & Communication Pod (interview requests)
Scheduling & Communication Pod  →  Candidate Experience Pod (status updates)

Document 1 of 4  |  AI-Powered Design Talent Platform  |  Project Requirements Document
Prepared by  ATHARVA S GANDHI

B	Future Roadmap
B.1  Phase 2 — Post-MVP Sprint (Weeks 7–16)
Phase 2 features are planned for the sprint immediately following a successful MVP pilot launch. These capabilities extend the core platform to close the most critical functional gaps identified during the pilot.

Feature	Description
AI Interview Agent	Full AI-driven video/audio interview with real-time question generation, response analysis, and structured debrief report; replaces manual first-round interviews
Enterprise ATS Integrations	Two-way sync with Greenhouse, Lever, and Workday; bi-directional candidate and job data exchange; webhook support for pipeline stage updates
Advanced Analytics & BI	Custom recruiter dashboards; funnel conversion analytics; cohort analysis; exportable hiring reports; time-series KPI tracking across campaigns
Offer Letter Generation	Templated offer letter creation with e-signature integration; offer status tracking (sent, viewed, accepted, declined); offer expiry automation
Multi-Language Support	UI and assessment localisation starting with Hindi and regional Indian languages; multilingual opportunity discovery for non-English postings

B.2  Phase 3 — Enterprise & Scale (Post-Pilot)
Phase 3 features target enterprise adoption, platform monetization, and long-term ecosystem growth. These are scoped for development after the platform achieves product-market fit validation through the pilot.

Feature	Description
Enterprise Hiring Suite	Multi-seat enterprise accounts; team-level hiring dashboards; department-wise hiring quotas; enterprise SLA and data isolation; dedicated account management
Referral & Alumni Network	Candidate referral system; alumni network for placement outcomes; referral tracking; institution-linked talent pipelines for partner colleges
Freelance & Project Marketplace	Project-based hiring flow; milestone tracking; freelance contract management; client and freelancer ratings; escrow payment integration
Predictive Hiring Intelligence	Predictive scoring for candidate success post-hire; model training on historical placement outcomes; benchmarking against industry hiring patterns
Mobile-Native Applications	Dedicated iOS and Android apps for candidates and recruiters; push notifications; mobile assessment flow; offline profile management
