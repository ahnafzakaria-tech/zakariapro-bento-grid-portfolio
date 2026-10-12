import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight, Sparkles, Box, MapPin } from "lucide-react";
import { Portal } from "./ui/portal";
import { useBackButton } from "../hooks/useBackButton";
import { FULL_NAME } from "../lib/slugs";

declare global {
  interface Window {
    LeonSans: any;
  }
}

export function NameTile() {
  const [isOpen, setIsOpen] = useState(false);

  // FIXED: Added useCallback to prevent the hook from misfiring
  const handleCloseModal = useCallback(() => setIsOpen(false), []);
  useBackButton(isOpen, handleCloseModal);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  // --- LeonSans Animation Effect (Unchanged) ---
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;

    if (!container || !canvas || typeof window.LeonSans === "undefined") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 2;
    let leons: any[] = [];

    const init = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      canvas.width = w * pixelRatio;
      canvas.height = h * pixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      ctx.scale(pixelRatio, pixelRatio);

      const fontSize = Math.min(w / 5, 100);

      const computedStyle = getComputedStyle(container);
      const initialColor = computedStyle.color || "#000000";

      const lines = ["ZAKARIA", "HOSSAIN"];
      const lineHeight = fontSize * 0.85;

      leons = [];

      let totalOffsetY = (h - lines.length * lineHeight) / 2 - fontSize * 0.1;

      lines.forEach((lineText, lineIndex) => {
        let cursorX = 0;
        const chars = lineText.split("");

        chars.forEach((char, charIndex) => {
          const leon = new window.LeonSans({
            text: char,
            color: [initialColor],
            size: fontSize,
            weight: 400,
            tracking: 0,
            pathGap: 0.5,
          });

          leon.baseX = cursorX;
          leon.baseY = totalOffsetY + lineIndex * lineHeight;

          leon.position(leon.baseX, leon.baseY);

          leons.push({
            instance: leon,
            waveIndex: lineIndex * 10 + charIndex,
          });

          cursorX += leon.rect.w + fontSize * 0.05;
        });
      });

      const animateFrame = (t: number) => {
        ctx.clearRect(0, 0, w, h);

        const time = t * 0.003;

        const currentStyle = getComputedStyle(container);
        const currentColor = currentStyle.color;

        leons.forEach((item) => {
          const leon = item.instance;

          leon.color = [currentColor];

          const wave = Math.sin(time - item.waveIndex * 0.4);
          const weightMap = (wave + 1) / 2;
          const newWeight = 100 + weightMap * 700;

          leon.weight = newWeight;
          leon.position(leon.baseX, leon.baseY);
          leon.draw(ctx);
        });

        animationRef.current = requestAnimationFrame(animateFrame);
      };

      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animateFrame);
    };

    init();

    const resizeObserver = new ResizeObserver(() => init());
    resizeObserver.observe(container);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* --- TILE FACE --- */}
      <motion.button
        type="button"
        aria-label={`About ${FULL_NAME} — Project Document Controller, EPC & EDMS specialist based in Riyadh`}
        className="bg-card text-card-foreground border border-border rounded-[2rem] p-6 sm:p-8 flex flex-col justify-center h-full w-full min-h-[220px] relative overflow-hidden group transition-colors duration-300 cursor-pointer shadow-sm hover:shadow-lg hover:border-primary/50 text-left"
        whileHover={{ scale: 1.01 }}
        onClick={() => setIsOpen(true)}
      >
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div
            ref={containerRef}
            className="w-full flex-1 min-h-[140px] pointer-events-none text-card-foreground"
          >
            {/* SEO heading for Google */}
            <h1 className="sr-only">{FULL_NAME} – Project Document Controller</h1>
            <canvas ref={canvasRef} />
          </div>

          <div className="flex items-center gap-3 mt-2 bg-card">
            <div className="h-[2px] w-8 sm:w-12 bg-current transition-all duration-300 group-hover:w-16 opacity-80"></div>
            <p className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
              Project Document Controller
            </p>
          </div>

          <div className="flex items-center gap-1.5 mt-3 text-text-secondary bg-card">
            <MapPin size={14} className="shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]">
              CEEC · Riyadh, KSA
            </span>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-current opacity-[0.05] rounded-full blur-3xl group-hover:opacity-[0.1] transition-opacity duration-500" />
        <ArrowUpRight
          className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all text-current"
          size={24}
        />
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
                aria-label={`About ${FULL_NAME}`}
                // FIXED: Full screen on mobile (100dvh, no border, no radius). Floating on md+.
                className="bg-card border-none md:border border-border text-card-foreground rounded-none md:rounded-[2.5rem] sm:rounded-[3rem] p-6 pt-20 sm:p-16 max-w-5xl w-full relative h-[100dvh] md:h-auto md:max-h-[90vh] overflow-y-auto no-scrollbar md:shadow-2xl"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* FIXED: Adjusted positioning, increased padding to p-3, added shadow and z-50 to ensure the circle background renders properly */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 md:top-8 md:right-8 p-3 bg-secondary hover:bg-secondary/80 rounded-full text-foreground transition-all z-50 shadow-md hover:scale-105 active:scale-95"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-16 items-start">
                  {/* --- 1. PROFILE IMAGE BLOCK --- */}
                  <div className="order-1 md:order-2 relative md:pt-16 w-full">
                    <div className="aspect-square rounded-[2.5rem] overflow-hidden border border-border bg-muted relative shadow-2xl group">
                      <img
                        src="./pfp/profile.png"
                        alt="Md Zakaria Hossain"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />

                      <div className="absolute bottom-8 left-8 flex items-center gap-3 bg-border/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                        <Sparkles className="text-accent" size={18} />
                        <span className="text-sm text-white font-bold uppercase tracking-widest">
                          Riyadh, KSA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* --- 2. INTRO TEXT BLOCK --- */}
                  <div className="order-2 md:order-1 space-y-10 md:row-start-1">
                    <div className="space-y-4">
                      <p className="text-primary font-bold uppercase tracking-[0.3em] text-xs">
                        Introduction
                      </p>
                      <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-none">
                        {FULL_NAME.split(" ").slice(0, 2).join(" ").toUpperCase()}
                        <br />
                        <span className="text-green">
                          {FULL_NAME.split(" ")[2].toUpperCase()}
                        </span>
                      </h2>
                    </div>

                    <div className="space-y-0 text-[18px] text-text-secondary leading-[1.7] font-normal">
                      <p className="mb-[1em]">
                        I'm a Project Document Controller with almost 4 years of
                        experience managing engineering and construction
                        documentation on large-scale power generation and
                        renewable energy EPC projects in Bangladesh and Saudi
                        Arabia.
                      </p>
                      <p className="mb-[1em]">
                        Currently at CEEC (Energy China) on the Starah 2GW
                        Onshore Wind Project, previously with Samsung C&T on the
                        Meghnaghat 718MW Combined Cycle Power Plant.
                      </p>
                      <p className="mb-[1em]">
                        Document integrity is my craft. Controlled accuracy is
                        my goal.
                      </p>
                      <p className="mb-[1em]">
                        A background in Law (LL.B, LL.M) brings a disciplined,
                        compliance-focused approach to every record I manage.
                      </p>
                      <p className="mb-0">
                        Hands-on with Thinkproject and Samsung Knox Portal.
                      </p>
                    </div>
                  </div>

                  {/* --- 3. BENTO TEXT BLOCK --- */}
                  <div className="order-3 md:order-3 md:col-start-1 pt-8 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <Box className="text-primary" size={20} />
                      <h3 className="text-foreground font-bold uppercase tracking-widest text-xs">
                        About This Website
                      </h3>
                    </div>
                    <div className="space-y-0 text-[16px] leading-[1.7] text-muted-foreground font-medium">
                      <p className="mb-[1em]">
                        This portfolio uses a{" "}
                        <span className="text-foreground font-bold">
                          modular grid inspired by the tangram (七巧板)
                        </span>
                        , where a few simple pieces fit together to form one
                        complete picture.
                      </p>
                      <p className="mb-0">
                        My work spans document control, EDMS administration and
                        compliance across EPC projects. Instead of separating
                        everything, I organised it the way I work: small pieces
                        forming one bigger picture.
                      </p>
                    </div>
                  </div>

                  {/* --- 4. TANGRAM IMAGE BLOCK --- */}
                  <div className="order-4 md:order-4 md:col-start-2 w-full pb-8 md:pb-0">
                    <div className="aspect-video md:aspect-[4/3] rounded-[2rem] overflow-hidden border border-border shadow-lg relative group bg-secondary/40">
                      <img
                        src="./pfp/tangram-4x3.svg"
                        alt="Tangram — seven scattered pieces coming together into one complete square"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                        Tangram
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
