import {
  Scale,
  Building2,
  FolderClock,
  Wind,
  Cable,
  ShieldCheck,
} from "lucide-react";

export interface Milestone {
  id: number;
  year: string;
  title: string;
  icon: any;
  color: string;
  bg: string;
  description: string;
  image?: string;
}

export const myJourney: Milestone[] = [
  {
    id: 1,
    year: "2017",
    title: "A Foundation in Law & Discipline",
    icon: Scale,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    description: `I began my legal education pursuing a Bachelor of Laws (LL.B) at the Bangladesh University of Business and Technology. Law taught me precision, attention to detail, and a rigorous, compliance-focused mindset — skills that would later define my entire career in document control.

My legal training in drafting, regulatory analysis, and risk assessment became the foundation for how I approach contractual documentation and record-keeping on large-scale EPC projects.`,
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    year: "2021",
    title: "Master of Laws & the Courtroom",
    icon: ShieldCheck,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
    description: `I completed my LL.M in December 2022, deepening my understanding of regulatory frameworks and corporate compliance. Shortly after, I entered the District and Sessions Judge Court in Dhaka as an Apprentice Lawyer, where I drafted legal documents, conducted legal research, performed risk assessment, supported case strategy, and maintained organized case files.`,
    image: "/projects/Dhaka%20Judge%20Court/Supreme%20Court%20of%20Bangladesh.jpg",
  },
  {
    id: 3,
    year: "2022",
    title: "Into EPC Documentation — Meghnaghat",
    icon: Building2,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    description: `In November 2022, I joined Samsung C&T Corporation, managing document control for the Meghnaghat 718MW Combined Cycle Power Plant in Bangladesh. I delivered end-to-end documentation across the full project lifecycle — from registration, coding, revision, and submission, through to close-out and handover.`,
    image:
      "/projects/Samsung/Project%20Night%20View.jpg",
  },
  {
    id: 4,
    year: "2025",
    title: "Commercial Operation Date Reached",
    icon: Cable,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    description: `The Meghnaghat 718MW Combined Cycle Power Plant under Samsung C&T reached its Commercial Operation Date (COD) in 2025 — a major milestone and the culmination of disciplined, traceable, and controlled document management supporting a successful handover.`,
    image:
      "/projects/Samsung/COD%20Celebration.jpg",
  },
  {
    id: 5,
    year: "2025 - Present",
    title: "Scaling Up — Starah 2GW Wind",
    icon: Wind,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    description: `In November 2025, I moved to Riyadh, Saudi Arabia to manage engineering and construction documentation for the Starah 2GW Onshore Wind Project — one of the largest onshore wind installations in the region, operating under CEEC (China Energy Engineering Corporation) and managing documentation across 273+ km² of desert terrain.`,
    image:
      "/projects/CEEC/Hybrid%20Tower%20Building.png",
  },
  {
    id: 6,
    year: "Ongoing",
    title: "Document Control as a Discipline",
    icon: FolderClock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    description: `Today, I bring together almost four years of EPC document control experience, a legal (LL.B / LL.M) foundation, and hands-on administration of Thinkproject, Samsung Knox S-PMIS, and Aconex to keep document integrity, controlled accuracy, and full compliance at the core of every project I support.`,
  },
];