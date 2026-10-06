import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Code2,
  ArrowUpRight,
  Tags,
  MailCheck,
  PackageCheck,
  DraftingCompass,
  ClipboardList,
  Archive,
  ShieldCheck,
  Workflow,
  Scale,
} from "lucide-react";
import { Portal } from "./ui/portal";
import { useBackButton } from "../hooks/useBackButton";

import type { LucideIcon } from "lucide-react";

const marqueeStyles = `
  @keyframes bento-marquee {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }
  .bento-marquee {
    animation: bento-marquee 28s linear infinite;
    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent);
    mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent);
  }
  .group:hover .bento-marquee,
  .group:focus-within .bento-marquee {
    animation-play-state: paused;
  }
`;

interface TechStackEntry {
  name: string;
  color: string;
  icon?: string; // brand logo path
  iconEl?: LucideIcon; // lucide icon component
  invertDark?: boolean;
}

const techStack: TechStackEntry[] = [
  {
    name: "Thinkproject",
    color: "#D4AF37",
    icon: "./Skill Logos/thinkproject_group_logo.jpg",
  },
  {
    name: "Samsung Knox (S-PMIS)",
    color: "#F59E0B",
    icon: "./Skill Logos/Samsung.svg",
  },
  {
    name: "Oracle Aconex",
    color: "#60A5FA",
    icon: "./Skill Logos/aconex.png",
  },
  { name: "Doc Coding & Classification", color: "#34D399", iconEl: Tags },
  { name: "Transmittals & Correspondence", color: "#F87171", iconEl: MailCheck },
  { name: "Close-out & Handover", color: "#A78BFA", iconEl: PackageCheck },
  { name: "Drawing & Rev. Control", color: "#FBBF24", iconEl: DraftingCompass },
  { name: "MSRA / MAR / MOM / FCR", color: "#38BDF8", iconEl: ClipboardList },
  { name: "Archive & Records Management", color: "#FB7185", iconEl: Archive },
  { name: "Audit Ready Records", color: "#2DD4BF", iconEl: ShieldCheck },
  { name: "EDMS Workflows", color: "#F472B6", iconEl: Workflow },
  { name: "Compliance Awareness", color: "#C084FC", iconEl: Scale },
];

export function TechStackTile({ active = true }: { active?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  
  // FIXED: Wrapped the close function in useCallback
  const handleCloseModal = useCallback(() => setIsOpen(false), []);
  useBackButton(isOpen, handleCloseModal);

  // Duplicate the list for a seamless infinite loop in the background marquee
  const duplicatedStack = [...techStack, ...techStack];

  return (
    <>
      <style>{marqueeStyles}</style>
      <motion.button
        type="button"
        aria-label="Open Tech Stack — Thinkproject, Aconex, S-PMIS, document control and EDMS skills"
        className="h-full w-full p-6 flex flex-col justify-between cursor-pointer group relative overflow-hidden transition-colors text-left bg-transparent"
        whileHover={{ scale: 1.01 }}
        onClick={() => setIsOpen(true)}
      >
        <div className="flex justify-between items-start z-10">
          <div className="bg-black/10 p-2.5 rounded-full text-inherit transition-all group-hover:bg-foreground group-hover:text-background">
            <Code2 size={24} />
          </div>
          <ArrowUpRight className="text-inherit opacity-40 group-hover:opacity-100 transition-colors" />
        </div>

        {/* COOL ANIMATION: The Infinite Marquee */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center pointer-events-none opacity-100"
        >
          <div
            className={`flex gap-4 whitespace-nowrap text-skills-marquee ${
              active ? "bento-marquee motion-reduce:[animation:none]" : ""
            }`}
          >
            {duplicatedStack.map((tech, i) => (
              <span
                key={i}
                className="text-4xl md:text-6xl font-black uppercase tracking-tighter"
              >
                {tech.name} •
              </span>
            ))}
          </div>
        </div>

        <div className="z-10 mt-auto">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["Thinkproject", "Samsung Knox", "Oracle Aconex"].map((chip) => (
              <span
                key={chip}
                className="px-2.5 py-1 rounded-full bg-foreground text-background text-[11px] sm:text-xs font-bold uppercase tracking-wider"
              >
                {chip}
              </span>
            ))}
          </div>
          <h3 className="text-inherit text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-none mb-1">
            Skills
          </h3>
          <p className="text-inherit opacity-60 text-xs font-bold uppercase tracking-widest">
            Document Control Toolkit
          </p>
        </div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')]" />
      </motion.button>

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              // FIXED: p-0 on mobile, md:p-4 on desktop
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-[9999] flex items-center justify-center p-0 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Tech stack"
                // FIXED: Full screen on mobile (100dvh, no border, no radius). Floating on md+.
                className="bg-card border-none md:border border-border text-card-foreground rounded-none md:rounded-[2.5rem] p-6 pt-20 sm:p-12 max-w-3xl w-full relative h-[100dvh] md:h-auto md:max-h-[90vh] overflow-y-auto no-scrollbar md:shadow-2xl"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* FIXED: Absolute positioned X button with shadow-md */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-secondary hover:bg-secondary/80 rounded-full text-foreground transition-colors z-50 shadow-md"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>

                <h2 className="text-4xl sm:text-6xl font-black text-foreground mb-8 tracking-tighter leading-none uppercase pr-12">
                  Skill
                  <br />
                  <span className="text-[#22c55e]">Matrix</span>
                </h2>

                {/* FIXED: Grid layout. Used grid-cols-2 but reduced gap and padding on mobile to prevent overflow */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pb-8 md:pb-0">
                  {techStack.map((tech, index) => (
                    <motion.div
                      key={tech.name}
                      className="bg-secondary/50 rounded-2xl p-3 md:p-4 flex flex-col md:flex-row items-center md:justify-start justify-center text-center md:text-left gap-2 md:gap-3 border border-border group hover:border-primary/50 transition-colors h-[84px] md:h-[68px] lg:h-[76px]"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0 transition-all duration-300 ${tech.invertDark ? "dark:invert" : ""}`}>
                        {tech.icon ? (
                          <img
                            src={tech.icon}
                            alt={tech.name}
                            className="w-full h-full object-contain"
                          />
                        ) : tech.iconEl ? (
                          <tech.iconEl
                            size={20}
                            strokeWidth={1.75}
                            color={tech.color}
                          />
                        ) : (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: tech.color,
                              boxShadow: `0 0 10px ${tech.color}40`,
                            }}
                          />
                        )}
                      </div>

                      {/* FIXED: Reduced text size slightly on mobile so long names fit */}
                      <span className="text-foreground font-black text-[11px] lg:text-sm uppercase tracking-wide group-hover:text-primary transition-colors leading-snug break-words">
                        {tech.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}