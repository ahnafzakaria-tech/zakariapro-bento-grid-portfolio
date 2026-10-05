// src/ts/resume-data.ts

export const resumeData = {
  header: {
    title: "Career Timeline",
    lastUpdated: "Oct 2026",
    status: "Open to Opportunities",
    resumeLink: "https://zakariapro.vercel.app/assets/MD_Zakaria_Hossain_CV.pdf"
  },
  education: [
    {
      degree: "Master of Laws (LL.M)",
      institution: "Bangladesh University of Business and Technology (BUBT)",
      year: "Dec 2021 - Dec 2022",
      score: "CGPA 3.79 / 4.00",
      isCurrent: false,
    },
    {
      degree: "Bachelor of Laws (LL.B)",
      institution: "Bangladesh University of Business and Technology (BUBT)",
      year: "Oct 2017 - Nov 2021",
      score: "CGPA 3.70 / 4.00",
      isCurrent: false,
    },
  ],
  experience: [
    {
      role: "Project Document Controller",
      company: "CEEC (China Energy Engineering Corporation)",
      year: "Nov 2025 - Present",
      description:
        "Managing engineering and construction documentation for the Starah 2GW Onshore Wind Project in Riyadh, operating under CEEC — China Energy Engineering Corporation.",
      tags: ["Thinkproject", "Document Coding", "Revision Control", "MOM & MSRA", "MAR & FCR"],
      highlights: [
        "[Add measurable result: e.g. number of documents or transmittals handled]",
        "[Add measurable result: e.g. turnaround time or audit outcome]",
      ],
    },
    {
      role: "Project Document Controller",
      company: "Samsung C&T Corporation",
      year: "Nov 2022 - Oct 2025",
      description:
        "Delivered end-to-end document control for the Meghnaghat 718MW Combined Cycle Power Plant EPC project under Samsung C&T Corporation. Project reached Commercial Operation Date (COD).",
      tags: ["Samsung Knox Portal (S-PMIS)", "S-PMIS", "Samsung Knox", "Transmittal Mgmt", "Close-out & Handover"],
      highlights: [
        "[Add measurable result: e.g. number of documents or transmittals handled]",
        "[Add measurable result: e.g. turnaround time or audit outcome]",
      ],
    },
    {
      role: "Apprentice Lawyer",
      company: "District and Sessions Judge Court, Dhaka",
      year: "Jan 2022 - Oct 2022",
      description:
        "Legal apprenticeship providing a disciplined compliance foundation that informs a rigorous approach to contractual documentation and regulatory record-keeping.",
      tags: ["Legal Research", "Document Drafting", "Compliance"],
    },
  ],

  // Split into two categories
  certifications: {
    professional: [
      {
        name: "AI Foundations",
        issuer: "OpenAI Academy",
        year: "2026",
        link: "https://academy.openai.com/home/certificate/yea3a36dgn",
        type: "tech" 
      },
      {
        name: "Applied AI Foundations",
        issuer: "OpenAI Academy",
        year: "2026",
        link: "https://academy.openai.com/home/certificate/vu1gu9y6hx",
        type: "tech"
      },
      {
        name: "Agents and Workflows",
        issuer: "OpenAI Academy",
        year: "2026",
        link: "https://academy.openai.com/home/certificate/ctaiyhopjy",
        type: "tech"
      },
      {
        name: "Oracle Aconex — Document Control & EDMS Workflow",
        issuer: "Professional Training",
        year: "Training",
        type: "creative"
      }
    ],
    extracurricular: []
  }
};