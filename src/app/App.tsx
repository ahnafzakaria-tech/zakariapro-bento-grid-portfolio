import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { NameTile } from "./components/NameTile";
import { ResumeTile } from "./components/ResumeTile";
import { TechStackTile } from "./components/TechStackTile";
import { CompactProjectsTile } from "./components/CompactProjectsTile";
import { ContactTile } from "./components/ContactTile";
import { StoryTile } from "./components/StoryTile";
import { ClockTile } from "./components/ClockTile";
import { ThemeToggle } from "./components/ThemeToggle";
import { SEOContentIndex } from "./components/SEOContentIndex";
import { Helmet } from "react-helmet-async";
import { FULL_NAME } from "./lib/slugs";

const SESSION_KEY = "bento-intro-played";

const TILE_ORDER = [
  "journey",
  "projects",
  "skills",
  "name",
  "resume",
  "clock",
  "contact",
];

const TILE_ROTATION: Record<string, number> = {
  journey: -5,
  projects: 4,
  skills: -3,
  name: 3,
  resume: -4,
  clock: 5,
  contact: -2,
};

const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export default function App() {
  const gridRef = useRef<HTMLDivElement>(null);
  const tilesRef = useRef<Map<string, HTMLElement>>(new Map());
  const animationsRef = useRef<Animation[]>([]);
  const [phase, setPhase] = useState<"loading" | "done">("loading");
  const [enabled, setEnabled] = useState(false);

  const setTileRef = useCallback((name: string) => {
    return (el: HTMLElement | null) => {
      if (el) tilesRef.current.set(name, el);
      else tilesRef.current.delete(name);
    };
  }, []);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    let cancelled = false;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 639px)").matches;
    const params = new URLSearchParams(window.location.search);
    const override = params.get("intro");
    let played = false;
    try {
      played = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* ignore */
    }

    const skip = () => {
      if (cancelled) return;
      setPhase("done");
      setEnabled(true);
    };

    const run = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
        await nextFrame();
        await nextFrame();
        if (cancelled || !grid) return skip();

        const rect = grid.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const offsets: Record<string, { x: number; y: number }> = {};
        tilesRef.current.forEach((el, name) => {
          const r = el.getBoundingClientRect();
          offsets[name] = {
            x: r.left + r.width / 2 - cx,
            y: r.top + r.height / 2 - cy,
          };
        });
        if (Object.keys(offsets).length === 0) return skip();

        const animations: Animation[] = [];

        TILE_ORDER.forEach((name, idx) => {
          const el = tilesRef.current.get(name);
          if (!el) return;
          const o = offsets[name] || { x: 0, y: 0 };
          const rot = TILE_ROTATION[name] ?? 0;

          // Apply the starting pose before paint so the cluster is the
          // first thing painted, never the finished grid.
          if (mobile) {
            el.style.transform = "translateY(16px)";
            el.style.opacity = "0";
          } else {
            el.style.transform = `translate(${o.x}px, ${o.y}px) scale(0.6) rotate(${rot}deg)`;
          }

          const keyframes = mobile
            ? [
                { transform: "translateY(16px)", opacity: 0 },
                { transform: "translateY(0px) scale(1) rotate(0deg)", opacity: 1 },
              ]
            : [
                {
                  transform: `translate(${o.x}px, ${o.y}px) scale(0.6) rotate(${rot}deg)`,
                  opacity: 0,
                },
                {
                  transform: "translate(0px, 0px) scale(1) rotate(0deg)",
                  opacity: 1,
                },
              ];

          const options: KeyframeAnimationOptions = {
            delay: 200 + idx * (mobile ? 60 : 70),
            duration: mobile ? 350 : 600,
            easing: mobile ? "ease-out" : "cubic-bezier(.34,1.35,.5,1)",
            fill: "both",
          };

          const anim = el.animate(keyframes as Keyframe[], options);
          animations.push(anim);
        });

        animationsRef.current = animations;

        const onDone = async () => {
          try {
            await Promise.all(animations.map((a) => a.finished));
          } catch {
            /* cancelled — ignore */
          }
          if (cancelled) return;
          tilesRef.current.forEach((el) => {
            el.style.transform = "";
            el.style.opacity = "";
          });
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
          setPhase("done");
          setEnabled(true);
        };

        void onDone();
      } catch {
        skip();
      }
    };

    if (import.meta.env.DEV) {
      const reason =
        override === "1"
          ? "forced via ?intro=1"
          : override === "0"
            ? "forced skip via ?intro=0"
            : reduce
              ? "prefers-reduced-motion"
              : played
                ? "already played this session"
                : null;
      // eslint-disable-next-line no-console
      console.log("[bento-intro]", reason ? `skipped: ${reason}` : "started");
    }

    if (override === "0" || reduce || played) {
      skip();
      return;
    }

    void run();

    return () => {
      cancelled = true;
      animationsRef.current.forEach((a) => a.cancel());
      animationsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderTile = (
    name: string,
    aria: string,
    className: string,
    children: React.ReactNode,
  ) => {
    return (
      <div
        ref={setTileRef(name)}
        data-tile={name}
        aria-label={aria}
        className={`${className} rounded-[2rem] will-change-transform`}
      >
        {children}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{`${FULL_NAME} – Portfolio | Project Document Controller`}</title>
        <meta
          name="description"
          content={`Portfolio of ${FULL_NAME} — Project Document Controller, EPC & EDMS specialist. EPC documentation, EDMS administration, and document compliance across Saudi Arabia and Bangladesh.`}
        />
        <meta property="og:site_name" content={`${FULL_NAME} Portfolio`} />
        <meta name="application-name" content={`${FULL_NAME} Portfolio`} />
      </Helmet>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start px-4 md:px-10 py-12 md:py-14 font-sans transition-colors duration-500 overflow-x-clip">
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        <header className="sr-only">
          <h1>
            Md Zakaria Hossain — Project Document Controller | Portfolio
          </h1>
          <p>
            Portfolio of Md Zakaria Hossain, a Project Document Controller and
            EPC & EDMS specialist based in Riyadh, Saudi Arabia. Open to
            opportunities. Sections below include: about, skills, resume,
            selected EPC projects, career timeline, and contact.
          </p>
        </header>

        <main
          id="main-content"
          aria-label="Portfolio bento grid"
          className="w-full max-w-[1400px] h-auto"
        >
          <div
            ref={gridRef}
            className={`bento-grid overflow-x-clip ${enabled ? "" : "pointer-events-none"}`}
          >
            {renderTile(
              "name",
              "About",
              "bento-name min-h-[160px] md:min-h-0 bg-tile border border-tile-border",
              <NameTile />,
            )}

            {renderTile(
              "skills",
              "Tech stack",
              "bento-skills min-h-[160px] md:min-h-0 bg-skills-bg text-skills-fg shadow-xl",
              <TechStackTile active={enabled} />,
            )}

            {renderTile(
              "clock",
              "Local time in Riyadh",
              "bento-clock min-h-[160px] md:min-h-0 bg-tile border border-tile-border",
              <ClockTile />,
            )}

            {renderTile(
              "projects",
              "Selected projects",
              "bento-projects min-h-[300px] md:min-h-0 bg-tile border border-tile-border",
              <CompactProjectsTile />,
            )}

            {renderTile(
              "journey",
              "Career timeline",
              "bento-journey min-h-[300px] md:min-h-0 bg-tile border border-tile-border",
              <StoryTile />,
            )}

            {renderTile(
              "resume",
              "Resume",
              "bento-resume min-h-[160px] md:min-h-0",
              <ResumeTile />,
            )}

            {renderTile(
              "contact",
              "Contact",
              "bento-contact min-h-[160px] md:min-h-0",
              <ContactTile />,
            )}
          </div>
        </main>

        <SEOContentIndex />
      </div>
    </>
  );
}