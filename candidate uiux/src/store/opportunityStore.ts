import { create } from 'zustand';
import type { Opportunity } from '../types';
import { trackEvent } from '../utils/analytics';

interface OpportunityState {
  opportunities: Opportunity[];
  savedIds: string[];
  toggleSaved: (id: string) => void;
}

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

const customOpportunities: Opportunity[] = [
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
    keyResponsibilities: [
      "Partner with product managers, designers, and engineers to define research questions.",
      "Conduct interviews, usability tests, survey designs, and tree testing.",
      "Translate research findings into actionable insights and product opportunities."
    ],
    hiringSteps: [
      { step: 1, title: 'Recruiter screen', duration: '20 mins' },
      { step: 2, title: 'Portfolio review & research presentation', duration: '1 hour' },
      { step: 3, title: 'Cross-functional team round', duration: '45 mins' },
      { step: 4, title: 'Hiring manager chat', duration: '30 mins' }
    ],
    sidebarDetails: [
      { label: '$120K–160K', icon: 'dollar' },
      { label: 'San Francisco (Hybrid)', icon: 'map-pin' },
      { label: 'Full-time', icon: 'clock' },
      { label: 'Research team of 15', icon: 'users' }
    ]
  },
  {
    id: 'opp-app-4',
    companyName: 'Cred',
    title: 'UI Designer',
    workType: 'full_time',
    locationType: 'hybrid',
    location: 'Bangalore',
    discipline: 'UI/UX',
    matchPercentage: 85,
    ...defaultOppDetails,
    compensation: '₹14–20 LPA',
    requiredSkills: ['Figma', 'Visual Design', 'Mobile Design', 'Design Systems'],
    companyDescription: "CRED is a members-only club that rewards creditworthy individuals with exclusive access to premium rewards, card payments management, and fintech services.",
    companyTags: ['Fintech', 'Premium Club', 'Series E', '600 employees'],
    roleDescription: "Join CRED's design-first product design team to craft premium visual layouts, high-fidelity micro-interactions, and visual design assets for member products.",
    keyResponsibilities: [
      "Own the high-fidelity visual design polish and UI execution for mobile apps.",
      "Build fluid micro-interactions and animations inside high-fidelity prototypes.",
      "Maintain CRED's bespoke design library and typography styling."
    ],
    hiringSteps: [
      { step: 1, title: 'Portfolio review', duration: '3 days' },
      { step: 2, title: 'Visual design execution test', duration: '2 days' },
      { step: 3, title: 'Design critique & craft review', duration: '1 hour' },
      { step: 4, title: 'Founder discussion', duration: '45 mins' }
    ],
    sidebarDetails: [
      { label: '₹14–20 LPA', icon: 'dollar' },
      { label: 'Bangalore (Hybrid)', icon: 'map-pin' },
      { label: 'Full-time', icon: 'clock' },
      { label: 'Design team of 12', icon: 'users' }
    ]
  },
  {
    id: 'opp-app-3',
    companyName: 'Notion',
    title: 'Design Intern',
    workType: 'internship',
    locationType: 'remote',
    location: 'Remote',
    discipline: 'UI/UX',
    matchPercentage: 81,
    ...defaultOppDetails,
    compensation: '₹40,000 / mo',
    requiredSkills: ['Figma', 'Wireframing', 'Prototyping', 'User Research'],
    companyDescription: "Notion is the all-in-one workspace for notes, tasks, wikis, database management, and project execution.",
    companyTags: ['Productivity', 'Workspace', 'Remote-friendly', '400 employees'],
    roleDescription: "We are seeking a Design Intern to support the Notion editor design team in exploring component library extensions and productivity workflows.",
    keyResponsibilities: [
      "Design wireframes, task flows, and component states under senior designer guidance.",
      "Conduct internal usability reviews and support documentation efforts.",
      "Participate in weekly team feedback and critique sessions."
    ],
    hiringSteps: [
      { step: 1, title: 'Portfolio review', duration: '2 days' },
      { step: 2, title: 'Design exercise review', duration: '45 mins' },
      { step: 3, title: 'Team mentor call', duration: '30 mins' }
    ],
    sidebarDetails: [
      { label: '₹40,000 / mo', icon: 'dollar' },
      { label: 'Remote', icon: 'map-pin' },
      { label: 'Internship', icon: 'clock' },
      { label: 'Design team of 10', icon: 'users' }
    ]
  },
  {
    id: 'opp-swiggy',
    companyName: 'Swiggy',
    title: 'Senior Product Designer',
    workType: 'full_time',
    locationType: 'hybrid',
    location: 'Bangalore',
    discipline: 'UI/UX',
    matchPercentage: 79,
    ...defaultOppDetails,
    compensation: '₹28–36 LPA',
    requiredSkills: ['Figma', 'Product Design', 'User Journey', 'Design Systems', 'Data Analysis'],
    companyDescription: "Swiggy is India's leading on-demand convenience platform, delivering food, groceries, and instant deliveries to millions.",
    companyTags: ['Food-tech', 'Hyperlocal', 'IPO', '4,500 employees'],
    roleDescription: "We are looking for a Senior Product Designer to lead design for Swiggy Instamart checkout and subscription systems, ensuring high conversion rates and fluid delivery tracking.",
    keyResponsibilities: [
      "Own product design end-to-end for food ordering or Instamart cart/payment modules.",
      "Lead cross-functional alignment workshops and user journey analysis.",
      "Mentor junior designers and raise the craft bar for the hyperlocal business design system."
    ],
    hiringSteps: [
      { step: 1, title: 'Portfolio evaluation', duration: '4 days' },
      { step: 2, title: 'Product case presentation', duration: '1 hour' },
      { step: 3, title: 'System design whiteboard', duration: '1.5 hours' },
      { step: 4, title: 'Bar Raiser culture interview', duration: '45 mins' }
    ],
    sidebarDetails: [
      { label: '₹28–36 LPA', icon: 'dollar' },
      { label: 'Bangalore (Hybrid)', icon: 'map-pin' },
      { label: 'Full-time', icon: 'clock' },
      { label: 'Design team of 30', icon: 'users' }
    ]
  },
  {
    id: 'opp-canva',
    companyName: 'Canva',
    title: 'Design Intern',
    workType: 'internship',
    locationType: 'remote',
    location: 'Remote',
    discipline: 'UI/UX',
    matchPercentage: 76,
    ...defaultOppDetails,
    compensation: '₹35,000 / mo',
    requiredSkills: ['Figma', 'Visual Design', 'Illustration', 'Prototyping'],
    companyDescription: "Canva is a free-to-use online graphic design tool used by millions worldwide to design business cards, resumes, social graphics, and presentations.",
    companyTags: ['Creative Tools', 'SaaS', 'Remote-first', '1,500 employees'],
    roleDescription: "Join Canva as a Design Intern inside the template and content library squad, helping create beautifully styled creative design templates for users.",
    keyResponsibilities: [
      "Create sample template layouts, icons, and illustration guidelines for users.",
      "Draft UI layout concepts and help test template usability patterns.",
      "Collaborate with template designers to review style parameters."
    ],
    hiringSteps: [
      { step: 1, title: 'Portfolio review', duration: '2 days' },
      { step: 2, title: 'Style Match design exercise', duration: '1 hour' },
      { step: 3, title: 'Creative lead call', duration: '30 mins' }
    ],
    sidebarDetails: [
      { label: '₹35,000 / mo', icon: 'dollar' },
      { label: 'Remote', icon: 'map-pin' },
      { label: 'Internship', icon: 'clock' },
      { label: 'Template team of 20', icon: 'users' }
    ]
  },
  {
    id: 'opp-app-5',
    companyName: 'Adobe',
    title: 'Product Designer',
    workType: 'full_time',
    locationType: 'hybrid',
    location: 'Noida',
    discipline: 'Product Design',
    matchPercentage: 72,
    ...defaultOppDetails,
    compensation: '₹18–25 LPA',
    requiredSkills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    companyDescription: "Adobe is the global leader in digital media and digital marketing solutions, helping creators build premium experiences.",
    companyTags: ['Creative Cloud', 'Enterprise SaaS', 'Noida', '5,000 employees'],
    roleDescription: "We are hiring a Product Designer for Creative Cloud assets integration, crafting asset discovery and library sharing experiences.",
    keyResponsibilities: [
      "Design assets browsing interfaces and drag-drop integration flows inside desktop apps.",
      "Run usability reviews and translate complex feature parameters into accessible visual UI.",
      "Collaborate with international teams to refine cross-app component guidelines."
    ],
    hiringSteps: [
      { step: 1, title: 'Portfolio review', duration: '5 days' },
      { step: 2, title: 'Take-home case presentation', duration: '1 hour' },
      { step: 3, title: 'Core skills and engineering panel', duration: '1.5 hours' },
      { step: 4, title: 'Hiring director chat', duration: '30 mins' }
    ],
    sidebarDetails: [
      { label: '₹18–25 LPA', icon: 'dollar' },
      { label: 'Noida (Hybrid)', icon: 'map-pin' },
      { label: 'Full-time', icon: 'clock' },
      { label: 'Design division of 50', icon: 'users' }
    ]
  }
];

export const useOpportunityStore = create<OpportunityState>((set) => ({
  opportunities: customOpportunities,
  savedIds: ['opp-app-2'],
  toggleSaved: (id) =>
    set((state) => {
      const saved = state.savedIds.includes(id) ? state.savedIds.filter((savedId) => savedId !== id) : [...state.savedIds, id];
      trackEvent('opportunity_saved', { opportunityId: id, saved: saved.includes(id) });
      return { savedIds: saved };
    }),
}));
