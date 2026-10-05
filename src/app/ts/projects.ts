export type Category = "Renewable" | "Power" | "Legal";

export interface Fact {
  label: string;
  value: string;
}

export interface Project {
  id: number;
  title: string;
  category: Category;
  image: string;
  gallery?: string[];
  status: string;
  period: string;
  role: string;
  facts: Fact[];
  responsibilities: string[];
  description: string;
  tech?: string[];
  timelineId: number;
  link?: string;
}

export const myProjects: Project[] = [
  {
id: 1,
    title: "Starah 2GW Onshore Wind Power Project",
    category: "Renewable",
    image: "/projects/CEEC/Hybrid%20Tower%20Building.png",
    gallery: [
      "/projects/CEEC/Hybrid%20Tower%20Building.png",
      "/projects/CEEC/Project%20desert%20view-1.jpg",
      "/projects/CEEC/Project%20Desert%20View-2.jpg",
      "/projects/CEEC/Turbine%20Fan%20Blade%20Transportation.jpg",
      "/projects/CEEC/Turbine%20Fan%20Installation.jpg",
    ],
    status: "Ongoing",
    period: "Nov 2025 - Present",
    role: "Project Document Controller, CEEC",
    facts: [
      { label: "Role", value: "Project Document Controller" },
      { label: "Employer", value: "CEEC (China Energy Engineering Corporation)" },
      { label: "Period", value: "Nov 2025 - Present" },
      { label: "Scope", value: "2,000 MW onshore wind" },
    ],
    responsibilities: [
      "Document numbering and coding",
      "Drawing and revision control",
      "MOM preparation and circulation",
      "Method Statement (MOS) and Risk Assessment (RA) review",
      "Field Change Request (FCR) control",
      "MAR tracking",
      "EDMS administration under Thinkproject",
    ],
    description: `Project Document Controller for one of the largest onshore wind power projects in the region — managing full-lifecycle documentation for a 2,000 MW installation across 273+ km² of desert terrain.`,
    tech: [
      "Thinkproject",
      "Document Coding",
      "Revision Control",
      "MOM & MSRA",
      "MAR & FCR",
      "Transmittal Mgmt",
    ],
    timelineId: 5,
  },
  {
id: 2,
    title: "Meghnaghat 718MW Combined Cycle Power Plant",
    category: "Power",
    image: "/projects/Samsung/COD%20Celebration%202.jpg",
    gallery: [
      "/projects/Samsung/COD%20Celebration%202.jpg",
      "/projects/Samsung/COD%20Celebration.jpg",
      "/projects/Samsung/Group%20Photo%201.jpg",
      "/projects/Samsung/Project%203d%20model.jpg",
      "/projects/Samsung/Project%20drone%20view.jpg",
      "/projects/Samsung/Project%20Night%20View.jpg",
    ],
    status: "COD reached 2025",
    period: "Nov 2022 - Oct 2025",
    role: "Project Document Controller, Samsung C&T",
    facts: [
      { label: "Role", value: "Project Document Controller" },
      { label: "Employer", value: "Samsung C&T Corporation" },
      { label: "Period", value: "Nov 2022 - Oct 2025" },
      { label: "Scope", value: "718MW combined cycle, COD 2025" },
    ],
    responsibilities: [
      "Administered submissions, workflows, review status and revisions",
      "Maintained controlled records and transmittals",
      "Delivered full close-out and handover packages",
    ],
    description: `Delivered end-to-end document control across the full lifecycle of a 718MW Combined Cycle Power Plant EPC project under Samsung C&T Corporation, reaching Commercial Operation Date (COD) in 2025.`,
    tech: [
      "S-PMIS",
      "Samsung Knox",
      "Transmittal Mgmt",
      "Close-out & Handover",
      "Reporting",
    ],
    timelineId: 3,
  },
  {
id: 3,
    title: "Apprentice Lawyer, District and Sessions Judge Court, Dhaka",
    category: "Legal",
    image:
      "/projects/Dhaka%20Judge%20Court/Supreme%20Court%20of%20Bangladesh.jpg",
    gallery: [
      "/projects/Dhaka%20Judge%20Court/Supreme%20Court%20of%20Bangladesh.jpg",
      "/projects/Dhaka%20Judge%20Court/With%20Barrister%20Sumon.jpg",
      "/projects/Dhaka%20Judge%20Court/With%20Senior%20Adv.jpg",
    ],
    status: "Completed",
    period: "Jan 2022 - Oct 2022",
    role: "Apprentice Lawyer",
    facts: [
      { label: "Role", value: "Apprentice Lawyer" },
      { label: "Court", value: "District and Sessions Judge Court, Dhaka" },
      { label: "Period", value: "Jan 2022 - Oct 2022" },
      { label: "Focus", value: "Legal research, drafting, risk assessment" },
    ],
    responsibilities: [
      "Drafting legal documents",
      "Conducting legal research",
      "Performing risk assessment and supporting case strategy",
      "Maintaining organized case files",
    ],
    description: `Legal apprenticeship at the District and Sessions Judge Court in Dhaka, drafting legal documents, conducting legal research, performing risk assessment, supporting case strategy and maintaining organized case files, alongside my LL.M studies.`,
    tech: ["Legal Research", "Document Drafting", "Compliance"],
    timelineId: 2,
  },
];

export const heroSlides = [
  "/projects/CEEC/Hybrid%20Tower%20Building.png",
];
