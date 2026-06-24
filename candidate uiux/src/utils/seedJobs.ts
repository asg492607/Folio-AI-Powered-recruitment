import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const defaultCompanyDescription = "A fast-growing creative product company building next-generation tools. The design team works cross-functionally with product, research, and engineering to craft delightful user-centric experiences.";
const defaultCompanyTags = ['Design-led', 'Product Tech', 'Series B', '120 employees'];
const defaultRoleDescription = "We are looking for a passionate designer to join our product team. You will have full ownership of core features from discovery to high-fidelity prototyping and shipping.";
const defaultKeyResponsibilities = [
  "Collaborate with product managers and engineers to conceptualize and design new features.",
  "Create user flows, wireframes, and production-ready high-fidelity UI mockups.",
  "Contribute to and maintain our design system components.",
  "Conduct user interviews and usability tests to gather qualitative feedback."
];
const defaultHiringSteps = [
  { step: 1, title: 'Portfolio review', duration: '2–4 days' },
  { step: 2, title: 'App critique & culture check', duration: '45 mins' },
  { step: 3, title: 'Team design exercise', duration: '1 hour' },
  { step: 4, title: 'Founder / Creative director round', duration: '30 mins' }
];

const defaultOppDetails = {
  companyOverview: defaultCompanyDescription,
  description: defaultRoleDescription,
  requiredSkills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
  compensation: 'Competitive pay',
  teamInfo: 'A collaborative design team.',
  hiringProcess: ['Portfolio Review', 'Team Interview'],
  postedAt: '2026-06-20',
  companyDescription: defaultCompanyDescription,
  companyTags: defaultCompanyTags,
  roleDescription: defaultRoleDescription,
  keyResponsibilities: defaultKeyResponsibilities,
  hiringSteps: defaultHiringSteps,
};

const customOpportunities = [
  {
    id: 'opp-app-1',
    companyName: 'Razorpay',
    title: 'Product Designer',
    workType: 'full_time',
    locationType: 'remote',
    location: 'Remote',
    discipline: 'UI/UX',
    matchPercentage: 92,
    ...defaultOppDetails,
    compensation: '₹18–24 LPA',
    requiredSkills: ['Figma', 'Prototyping', 'User Research', 'Design Systems', 'Interaction Design', 'Wireframing'],
    companyDescription: "Razorpay is India's leading full-stack financial solutions company. The design team of 24 works across payments, banking, and capital products used by 8M+ businesses.",
    companyTags: ['Fintech', 'B2B SaaS', 'Series F', '2,800 employees'],
    roleDescription: "You'll work within the Checkout product team designing flows for high-stakes payment moments. This is a craft-heavy role — you'll ship features independently and partner with PMs and engineers through the full cycle.",
    keyResponsibilities: [
      "Own end-to-end design for checkout and post-payment flows",
      "Run usability testing and synthesize findings directly into design decisions",
      "Maintain and extend the checkout component library",
      "Collaborate with 2 senior designers and document your decisions"
    ],
    hiringSteps: [
      { step: 1, title: 'Portfolio review', duration: '3–5 days' },
      { step: 2, title: 'Take-home design challenge (3 hours)', duration: '1 week deadline' },
      { step: 3, title: 'Design critique call with hiring manager', duration: '45 min' },
      { step: 4, title: 'Final loop with PM and tech lead', duration: '1.5 hours' }
    ],
    sidebarDetails: [
      { label: '₹18–24 LPA', icon: 'dollar' },
      { label: 'Remote (India)', icon: 'map-pin' },
      { label: 'Full-time', icon: 'clock' },
      { label: 'Design team of 24', icon: 'users' }
    ]
  },
  {
    id: 'opp-app-2',
    companyName: 'Figma',
    title: 'UX Researcher',
    workType: 'full_time',
    locationType: 'hybrid',
    location: 'San Francisco',
    discipline: 'UI/UX',
    matchPercentage: 88,
    ...defaultOppDetails,
    compensation: '$120K–160K',
    requiredSkills: ['User Research', 'Usability Testing', 'Survey Design', 'Figma'],
    companyDescription: "Figma is the collaborative interface design tool that helps teams brainstorm, design, and build digital products together.",
    companyTags: ['Product Design', 'SaaS', 'San Francisco', '800 employees'],
    roleDescription: "We are seeking a UX Researcher to design and execute foundational, generative, and evaluative research studies for the Figma Editor team.",
  }
];

export async function seedJobsToFirestore() {
  for (const opp of customOpportunities) {
    try {
      await setDoc(doc(db, "jobs", opp.id), opp);
      console.log(`Seeded job: ${opp.title}`);
    } catch (error) {
      console.error(`Failed to seed job: ${opp.title}`, error);
    }
  }
}
