import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Download,
  FileText,
  Briefcase,
  GraduationCap,
  Trophy,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { Portal } from "./ui/portal";
import { resumeData } from "../ts/resume-data";
import { useBackButton } from "../hooks/useBackButton";
import { getLastProject } from "./utils/analyticsContext";

declare global {
  interface Window {
    gtag?: (event: string, eventName: string, eventParams?: Record<string, unknown>) => void;
  }
}

// Single source of truth for the "Last updated" line — edit here.
const LAST_UPDATED = "Oct 2026";

const cautionStyles = `
  @keyframes slide-stripes {
    0% { background-position: 0 0; }
    100% { background-position: 30px 0; }
  }
  .hazard-tape {
    background-image: repeating-linear-gradient(
      -45deg,
      #000,
      #000 10px,
      #FFD700 10px,
      #FFD700 20px
    );
    background-size: 200% 100%;
    animation: slide-stripes 2s linear infinite;
  }
`;

export function ResumeTile() {
  const [isOpen, setIsOpen] = useState(false);

  // FIXED: Added useCallback to prevent the hook from misfiring
  const handleCloseModal = useCallback(() => setIsOpen(false), []);
  useBackButton(isOpen, handleCloseModal);

  const { header, education, experience, certifications } = resumeData;

  return (
    <>
      <style>{cautionStyles}</style>

      {/* --- TILE FACE --- */}
      <motion.button
        type="button"
        aria-label="Open Resume — education, experience and certifications"
        className="relative overflow-hidden cursor-pointer group h-full w-full min-h-[220px] flex flex-col justify-between shadow-lg rounded-[2rem] border border-black/5 text-left"
        style={{ backgroundColor: "#FFD700" }}
        whileHover={{ scale: 1.01 }}
        onClick={() => {
          setIsOpen(true);

          console.log("RESUME LAST PROJECT =", getLastProject());

          window.gtag?.("event", "resume_modal_open", {
            project_name: getLastProject() || "direct",
            event_category: "engagement",
          });
        }}
      >
        <div className="relative z-10 p-6 flex flex-col justify-between h-full">
          <div className="flex justify-between items-start">
            <div className="bg-black text-[#FFD700] p-2.5 rounded-xl shadow-xl transition-transform duration-300 group-hover:-rotate-12 border border-black/10">
              <FileText size={24} strokeWidth={2.5} />
            </div>

            <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-black/5 group-hover:bg-black group-hover:text-[#FFD700] transition-colors duration-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-black group-hover:text-[#FFD700] transition-colors">
                {header.status}
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between items-end mb-3">
              <h3 className="text-black text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-[0.9] break-words">
                Resume
              </h3>
            </div>

            <div className="w-full h-8 bg-black rounded flex items-center overflow-hidden relative border border-black/10">
              <div className="hazard-tape w-full h-full opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black px-3 py-1 text-[#FFD700] text-sm font-black uppercase tracking-[0.15em] rounded-full shadow">
                  VIEW RESUME
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.button>

      {/* --- MODAL --- */}
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              // FIXED: p-0 on mobile, md:p-4 on desktop
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center p-0 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Resume — career timeline, education, experience"
                // FIXED: Full screen on mobile (100dvh, no border, no radius). Floating on md+.
                className="bg-card border-none md:border border-border text-card-foreground rounded-none md:rounded-[2.5rem] p-6 pt-20 sm:p-12 max-w-5xl w-full relative h-[100dvh] md:h-auto md:max-h-[90vh] overflow-y-auto no-scrollbar md:shadow-2xl"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* FIXED: Added shadow-md, increased padding, adjusted mobile positioning */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-secondary hover:bg-secondary/80 rounded-full transition-colors text-foreground z-50 border border-border shadow-md"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>

                <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-end mb-12 md:mb-16 border-b border-border pb-8">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4">
                      <span className="px-3 py-1 rounded bg-[#FFD700] text-black text-[11px] font-black uppercase tracking-widest">
                        Verified Profile
                      </span>
                      <span className="px-3 py-1 rounded border border-border text-muted-foreground text-[11px] font-black uppercase tracking-widest">
                        Last Updated: {header.lastUpdated}
                      </span>
                    </div>
                    <h2 className="text-5xl sm:text-7xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
                      Career
                      <br />
                      <span className="text-[#FFD700]">Timeline</span>
                    </h2>
                  </div>

                  <a
                    href={header.resumeLink}
                    download
                    onClick={() => {
                      window.gtag?.("event", "resume_download", {
                        project_name: getLastProject() || "direct",
                      });
                    }}
                    className="group flex items-center justify-center md:justify-start gap-3 px-8 py-4 bg-[#FFD700] text-black rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#ffe033] hover:scale-105 transition-all shadow-lg w-full md:w-auto"
                  >
                    <Download
                      size={18}
                      className="group-hover:animate-bounce"
                    />
                    Download CV
                  </a>
                </div>

                <div className="grid lg:grid-cols-[1fr_350px] gap-16">
                  <div className="space-y-16">
                    {/* --- EDUCATION --- */}
                    <section>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-secondary rounded-xl border border-border text-[#FFD700]">
                          <GraduationCap size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-widest">
                          Education
                        </h3>
                      </div>
                      <div className="relative border-l-2 border-border ml-4 md:ml-6 space-y-12 pb-4">
                        {education.map((item, index) => (
                          <div key={index} className="relative pl-6 md:pl-10">
                            <div
                              className={`absolute -left-[9px] top-2 h-4 w-4 rounded-full ring-4 ring-card ${
                                item.isCurrent ? "bg-[#FFD700]" : "bg-primary"
                              }`}
                            />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 md:gap-3 mb-2">
                              <h4 className="text-xl font-bold text-foreground uppercase">
                                {item.degree}
                              </h4>
                              <span
                                className={` whitespace-nowrap text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded w-fit ${
                                  item.isCurrent
                                    ? "bg-[#FFD700] text-black"
                                    : "border border-border text-foreground"
                                }`}
                              >
                                {item.year}
                              </span>
                            </div>
                            <p className="text-base md:text-lg text-muted-foreground font-semibold mb-3">
                              {item.institution}
                            </p>
                            <div className="inline-block px-3 py-1 bg-secondary rounded-lg border border-border">
                              <span className="text-sm font-bold text-foreground">
                                {item.score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* --- EXPERIENCE --- */}
                    <section>
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-secondary rounded-xl border border-border text-[#FFD700]">
                          <Briefcase size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-widest">
                          Experience
                        </h3>
                      </div>
                      <div className="relative border-l-2 border-border ml-4 md:ml-6 space-y-12 pb-8 md:pb-0">
                        {experience.map((job, index) => (
                          <div key={index} className="relative pl-6 md:pl-10">
                            <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full bg-[#FFD700] ring-4 ring-card" />
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 md:gap-3 mb-2">
                              <h4 className="text-xl font-bold text-foreground uppercase">
                                {job.role}
                              </h4>
                              <span className="whitespace-nowrap text-black text-xs md:text-sm font-bold uppercase tracking-widest bg-[#FFD700] px-3 py-1 rounded w-fit">
                                {job.year}
                              </span>
                            </div>
                            <p className="text-base md:text-lg text-foreground font-semibold mb-2">
                              {job.company}
                            </p>
                            <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-lg mb-4">
                              {job.description}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {job.tags.map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 md:px-3 md:py-1 bg-secondary border border-border rounded text-xs md:text-sm text-muted-foreground font-bold"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>

                  {/* --- RIGHT COLUMN (Split into 2 Sections) --- */}
                  <div className="space-y-6 pb-8 md:pb-0">
                    {/* 1. PROFESSIONAL CERTIFICATIONS */}
                    <div className="bg-secondary/30 p-6 rounded-3xl border border-border h-fit">
                      <div className="flex items-center gap-3 mb-6">
                        <Trophy size={20} className="text-[#FFD700]" />
                        <h3 className="text-lg font-black text-foreground uppercase tracking-widest">
                          Professional
                        </h3>
                      </div>

                      <div className="space-y-4">
                        {certifications.professional.map((cert, index) =>
                          cert.link ? (
                            <a
                              key={index}
                              href={cert.link}
                              onClick={() => {
                                window.gtag?.("event", "certification_click", {
                                  certification_name: cert.name,
                                });
                              }}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Verify ${cert.name} certificate on ${cert.issuer} (opens in new tab)`}
                              className="block group bg-card hover:bg-[#FFD700] border border-border hover:border-[#FFD700] p-5 rounded-2xl transition-all duration-300 shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] focus-visible:ring-offset-2 focus-visible:ring-offset-card hover:shadow-lg"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <Cpu
                                  size={20}
                                  className="text-foreground group-hover:text-black transition-colors"
                                />
                                <ExternalLink
                                  size={16}
                                  className="text-muted-foreground group-hover:text-black transition-colors"
                                />
                              </div>
                              <div className="font-bold text-base md:text-lg text-foreground group-hover:text-black transition-colors">
                                {cert.name}
                              </div>
                              <div className="text-xs md:text-sm text-muted-foreground group-hover:text-black/70 uppercase tracking-wider mt-1">
                                {cert.issuer} • {cert.year}
                              </div>
                            </a>
                          ) : (
                            <div
                              key={index}
                              className="block bg-card hover:bg-[#FFD700] border border-border hover:border-[#FFD700] p-5 rounded-2xl transition-all duration-300 shadow-sm"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <Cpu
                                  size={20}
                                  className="text-foreground group-hover:text-black transition-colors"
                                />
                              </div>
                              <div className="font-bold text-base md:text-lg text-foreground group-hover:text-black transition-colors">
                                {cert.name}
                              </div>
                              <div className="text-xs md:text-sm text-muted-foreground group-hover:text-black/70 uppercase tracking-wider mt-1">
                                {cert.issuer} • {cert.year}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
