import { useState, useCallback, useEffect, useRef } from "react"; // FIXED: Imported useCallback
import { motion, AnimatePresence } from "motion/react";
import { Helmet } from "react-helmet-async";
import {
  X,
  History,
  ArrowRight,
  TrendingUp,
  ArrowDownUp,
} from "lucide-react";
import { Portal } from "./ui/portal";
import { myJourney } from "../ts/story";
import { useBackButton } from "../hooks/useBackButton";
import { canonical } from "../lib/slugs";
import { onOpenStory } from "../lib/modalBridge";

const journeyStats = [
  { value: "Almost 4 yrs", label: "EPC document control" },
  { value: "2", label: "Power EPC projects" },
  { value: "LL.B · LL.M", label: "Legal foundation" },
];

const journeyMilestones = [
  { leftPct: 8, label: "2022 LL.M / Apprenticeship" },
  { leftPct: 48, label: "2022 EPC" },
  { leftPct: 85, label: "2025 Starah" },
];

// Cubic bezier for the growth curve, in the SVG's 400x150 viewBox.
// P0=(0,150) bottom-left → P3=(400,50) at the right edge (~60% container height).
const CURVE = {
  p0: { x: 0, y: 150 },
  p1: { x: 120, y: 135 },
  p2: { x: 240, y: 95 },
  p3: { x: 400, y: 50 },
};

function curveTopPct(xPct: number): number {
  const targetX = (xPct / 100) * 400;
  // Solve t for x via binary search (x(t) is monotonic).
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 40; i++) {
    const t = (lo + hi) / 2;
    const x =
      Math.pow(1 - t, 3) * CURVE.p0.x +
      3 * Math.pow(1 - t, 2) * t * CURVE.p1.x +
      3 * (1 - t) * t * t * CURVE.p2.x +
      t * t * t * CURVE.p3.x;
    if (x < targetX) lo = t;
    else hi = t;
  }
  const t = (lo + hi) / 2;
  const y =
    Math.pow(1 - t, 3) * CURVE.p0.y +
    3 * Math.pow(1 - t, 2) * t * CURVE.p1.y +
    3 * (1 - t) * t * t * CURVE.p2.y +
    t * t * t * CURVE.p3.y;
  // Return vertical position as a percentage of the curve container (150 tall).
  return (y / 150) * 100;
}

export function StoryTile() {
  const [isOpen, setIsOpen] = useState(false);
  
  // FIXED: Wrapped the close function in useCallback so the hook doesn't glitch on state changes
  const handleCloseModal = useCallback(() => setIsOpen(false), []);
  useBackButton(isOpen, handleCloseModal);
  
  const [isNewestFirst, setIsNewestFirst] = useState(false);
  const focusRef = useRef<number | null>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [labelsHidden, setLabelsHidden] = useState<Record<string, boolean>>({});

  // Allow the Work Gallery detail view to open the timeline at a milestone.
  useEffect(() => {
    return onOpenStory((milestoneId) => {
      focusRef.current = milestoneId ?? null;
      setIsOpen(true);
    });
  }, []);

  // Scroll to the focused milestone once the modal is open and painted.
  useEffect(() => {
    if (!isOpen || focusRef.current == null) return;
    const id = focusRef.current;
    const raf = requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-milestone="${id}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  // Collision guard: hide milestone labels that would overlap the stat row
  // or the READ JOURNEY button. Below 640px only the dots are shown.
  useEffect(() => {
    const intersects = (a: HTMLElement, b: HTMLElement) => {
      const r1 = a.getBoundingClientRect();
      const r2 = b.getBoundingClientRect();
      return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
    };
    const recompute = () => {
      const statsEl = statsRef.current;
      const btnEl = btnRef.current;
      const isDesktop = window.matchMedia("(min-width: 640px)").matches;
      const next: Record<string, boolean> = {};
      if (!isDesktop) {
        journeyMilestones.forEach((m) => (next[m.label] = true));
      } else {
        journeyMilestones.forEach((m) => {
          const label = labelRefs.current.get(m.label);
          let hide = !label;
          if (label) {
            if (statsEl && intersects(label, statsEl)) hide = true;
            if (btnEl && intersects(label, btnEl)) hide = true;
          }
          next[m.label] = hide;
        });
      }
      setLabelsHidden(next);
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  // Sort Logic for Modal
  const sortedJourney = [...myJourney].sort((a, b) => {
    return isNewestFirst
      ? parseInt(b.year) - parseInt(a.year)
      : parseInt(a.year) - parseInt(b.year);
  });

  return (
    <>
      {isOpen && (
        <Helmet>
          <link rel="canonical" href={canonical("/story")} />
          <title>Career Timeline — Md Zakaria Hossain</title>
        </Helmet>
      )}
      {/* --- TILE FACE: MINIMAL GRAPH --- */}
      <motion.button
        type="button"
        aria-label="Open Career Timeline — a timeline of how Md Zakaria Hossain grew into EPC document control"
        className="bg-card border border-border rounded-[2rem] overflow-hidden cursor-pointer group h-full w-full relative flex flex-col justify-between shadow-lg transition-all duration-500 hover:shadow-2xl hover:border-journey-accent/30 text-left"
        whileHover={{ scale: 1.005 }}
        onClick={() => setIsOpen(true)}
      >
        {/* 1. ANIMATED GRAPH BACKGROUND */}
        <div className="absolute inset-x-0 bottom-0 h-[75%] pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-500">
          <svg
            className="w-full h-full"
            viewBox="0 0 400 150"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  stopOpacity="0.5"
                  className="text-journey-accent"
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0"
                  className="text-journey-accent"
                />
              </linearGradient>
            </defs>

            <motion.path
              d="M0,150 C120,135 240,95 400,50"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              vectorEffect="non-scaling-stroke"
              className="text-journey-accent"
              initial={{ pathLength: 0, pathOffset: 0 }}
              animate={{
                pathLength: [0, 1, 1],
                pathOffset: [0, 0, 1], 
              }}
              transition={{
                duration: 2.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            />

            <path
              d="M0,150 C120,135 240,95 400,50 V150 H0 Z"
              fill="url(#graphGradient)"
            />
          </svg>
        </div>

        {/* Milestones overlay (HTML, not scaled by the SVG) */}
        <div className="absolute inset-x-0 bottom-0 h-[75%] pointer-events-none z-0">
          {journeyMilestones.map((m, idx) => {
            const topPct = curveTopPct(m.leftPct);
            const isLast = idx === journeyMilestones.length - 1;
            return (
              <div
                key={m.label}
                className="absolute"
                style={{ left: `${m.leftPct}%`, top: `${topPct}%` }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2">
                  <div className="h-3 w-3 rounded-full bg-journey-accent ring-2 ring-tile" />
                  <div
                    ref={(el) => {
                      if (el) labelRefs.current.set(m.label, el);
                      else labelRefs.current.delete(m.label);
                    }}
                    className={`absolute top-full mt-1.5 text-xs font-medium text-text-secondary whitespace-nowrap bg-card px-1.5 py-0.5 rounded-md ${
                      isLast ? "right-0" : "left-1/2 -translate-x-1/2"
                    } ${labelsHidden[m.label] ? "invisible" : ""}`}
                  >
                    {m.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Header */}
        <div className="p-8 relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="bg-journey-accent/15 text-journey-accent p-3 rounded-2xl shadow-lg">
              <History size={24} strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-journey-accent/40 bg-journey-accent/30 text-journey-accent text-[11px] font-bold uppercase tracking-widest">
              <TrendingUp size={12} />
              Growth
            </div>
          </div>
          <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter text-foreground leading-[0.9]">
            Career
            <br />
            <span className="text-journey-accent">Journey</span>
          </h3>

          {/* Stats row */}
          <div ref={statsRef} className="mt-5 flex items-center flex-wrap">
            {journeyStats.map((s, i) => (
              <div key={s.label} className="flex items-center">
                {i > 0 && (
                  <div className="mx-4 sm:mx-5 h-8 w-px bg-border" aria-hidden="true" />
                )}
                <div>
                  <div className="text-xl sm:text-2xl font-black text-foreground leading-none tabular-nums whitespace-nowrap">
                    {s.value}
                  </div>
                  <div className="text-[11px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-1 whitespace-nowrap">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 pt-0 flex justify-end relative z-10 mt-auto">
          <div ref={btnRef} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-journey-accent transition-colors bg-card/50 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50">
            Read Journey <ArrowRight size={14} />
          </div>
        </div>
      </motion.button>

      {/* --- MODAL: TIMELINE --- */}
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
                aria-label="My Evolution — timeline"
                // FIXED: Full screen on mobile (100dvh, no border, no radius). Floating on md+.
                className="bg-card border-none md:border border-border text-card-foreground rounded-none md:rounded-[2.5rem] p-6 pt-20 sm:p-12 max-w-5xl w-full relative h-[100dvh] md:h-[90vh] overflow-y-auto no-scrollbar md:shadow-2xl"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* FIXED: Close Button is now absolutely positioned at top right so it never misaligns */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-secondary hover:bg-secondary/80 rounded-full transition-colors text-foreground shrink-0 z-50 shadow-md"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>

                {/* Modal Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 md:mb-16 gap-6 border-b border-border pb-8">
                  <div>
                    <h2 className="text-5xl sm:text-7xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
                      Career
                      <br />
                      <span className="text-journey-accent">
                        Timeline
                      </span>
                    </h2>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsNewestFirst(!isNewestFirst)}
                      className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 rounded-full border border-border bg-secondary/50 hover:bg-secondary text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      <ArrowDownUp size={14} />
                      {isNewestFirst ? "Newest First" : "Oldest First"}
                    </button>
                  </div>
                </div>

                {/* THE TIMELINE */}
                <div className="relative border-l-2 border-border/50 ml-2 md:ml-6 space-y-16 pb-12">
                  {sortedJourney.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        data-milestone={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative pl-6 md:pl-16 group"
                      >
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 md:w-5 md:h-5 rounded-full bg-journey-accent ring-4 ring-card transition-transform group-hover:scale-125" />

                        {/* Year Marker */}
                        <div className="flex items-center gap-4 mb-6">
                          <span className="text-4xl md:text-5xl font-black text-journey-accent/90 tracking-tighter">
                            {item.year}
                          </span>
                        </div>

                        {/* Content Card */}
                        <div className="bg-secondary/20 border border-border rounded-3xl p-5 md:p-8 hover:border-journey-accent/30 transition-colors shadow-sm">
                          <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                            <div className={`p-2.5 md:p-3 rounded-xl ${item.bg} ${item.color}`}>
                              <Icon size={20} className="md:w-6 md:h-6" />
                            </div>
                            <h3 className="text-xl md:text-3xl font-black uppercase text-foreground leading-none tracking-tight break-words">
                              {item.title}
                            </h3>
                          </div>

                          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                            {/* Text Container */}
                            <div className="flex-1 w-full">
                              <p className="text-muted-foreground text-sm md:text-lg leading-relaxed whitespace-pre-line font-medium break-words">
                                {item.description}
                              </p>
                            </div>

                            {/* Optional Image */}
                            {item.image && (
                              <div className="w-full md:w-1/3 aspect-video md:aspect-square shrink-0 rounded-2xl overflow-hidden border border-border">
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}