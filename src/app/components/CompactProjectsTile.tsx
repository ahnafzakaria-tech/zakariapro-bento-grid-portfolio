import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { projectSlug, canonical, findProjectBySlug } from "../lib/slugs";
import {
  X,
  FileText,
  Layers,
  Maximize2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Wind,
  Zap,
  Scale,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { Portal } from "./ui/portal";
import {
  myProjects,
  Category,
  Project,
} from "../ts/projects";
import { openStory, openContact } from "../lib/modalBridge";
// FIXED: Import the new powerful hook
import { useHashRouter, useHashInit } from "../hooks/useHashRouter";
import { setLastProject } from "./utils/analyticsContext";

// --- SWIPER IMPORTS ---
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import {
  Navigation,
  Pagination,
  A11y,
  EffectCreative,
  Autoplay,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-creative";

const swiperStyles = `
  .inline-gallery .swiper-pagination-bullets { bottom: 20px !important; }
  .fullscreen-gallery .swiper-pagination-bullets { bottom: 100px !important; }
  .swiper-pagination-bullet { background: white; opacity: 0.4; width: 8px; height: 8px; border-radius: 999px; transition: all 0.4s ease; }
  .swiper-pagination-bullet-active { background: #d8ffc7; opacity: 1; width: 32px; border-radius: 999px; }
  .inline-gallery .swiper-button-next, .inline-gallery .swiper-button-prev { display: none !important; }
`;

const SLIDE_INTERVAL_MS = 2500;
const FADE_MS = 1000;

// First photo of each project folder (CEEC, Samsung, Dhaka), then the
// remaining photos of each folder in alphabetical order. The gallery paths
// are already URL-encoded (%20) and are the single source of truth.
const TILE_SLIDES: string[] = (() => {
  const first = myProjects.map((p) => p.gallery?.[0] || p.image);
  const rest = myProjects.flatMap((p) => p.gallery?.slice(1) ?? []);
  return [...first, ...rest].filter(Boolean);
})();

type Filter = "All" | Category;

const FILTERS: Filter[] = [
  "All",
  ...new Set<Category>(myProjects.map((p) => p.category)),
];

const isVideo = (url: string) => url.match(/\.(mp4|webm|ogg)$/i);

const MediaDisplay = ({
  src,
  className,
  isActive,
  alt = "Project media",
}: {
  src: string;
  className?: string;
  isActive: boolean;
  alt?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);

  if (isVideo(src)) {
    return (
      <video
        ref={videoRef}
        src={src}
        className={className}
        muted
        loop
        playsInline
        controls={false}
      />
    );
  }
  return <img src={src} alt={alt} className={className} />;
};

const getCategoryIcon = (cat: Category) => {
  switch (cat) {
    case "Renewable":
      return <Wind size={14} />;
    case "Power":
      return <Zap size={14} />;
    case "Legal":
      return <Scale size={14} />;
    default:
      return <Layers size={14} />;
  }
};

export function CompactProjectsTile() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // --- FIXED: DEEP LINKING LOGIC ---

  // --- FIXED: DEEP LINKING LOGIC ---

  const initConfig = useMemo(
    () => [
      {
        // LAYER 3: Matches #projects/id/lightbox
        match: /^#projects\/([^/]+)\/lightbox$/,
        // Dynamically build the parent history using the regex match group `m[1]`
        parentHashes: (m: RegExpMatchArray) => ["projects", `projects/${m[1]}`],
        onMatch: (m: RegExpMatchArray) => {
          const projectId = m[1];
          const project = myProjects.find((p) => String(p.id) === projectId);
          if (!project) return;
          setSelectedProject(project);
          setIsLightboxOpen(true);
          setIsOpen(true);
        },
      },
      {
        // LAYER 2: Matches #projects/id
        match: /^#projects\/([^/]+)$/,
        parentHashes: ["projects"],
        onMatch: (m: RegExpMatchArray) => {
          const projectId = m[1];
          const project = myProjects.find((p) => String(p.id) === projectId);
          if (!project) return;
          setSelectedProject(project);
          setIsLightboxOpen(false); // Ensure lightbox is closed if they just hit the detail page
          setIsOpen(true);
        },
      },
      {
        // LAYER 1: Matches #projects
        match: /^#projects$/,
        parentHashes: [],
        onMatch: () => {
          setIsOpen(true);
          setSelectedProject(null); // Ensure project is closed if they just hit the grid
        },
      },
    ],
    [],
  );

  useHashInit(initConfig);

  // Real-path cold-load:
  //   /projects              → open modal on gallery
  //   /projects/<slug>       → open modal + jump straight to project detail
  // Refreshing at either URL reopens the modal in the correct state
  // instead of falling through to a standalone page.
  const location = useLocation();
  useEffect(() => {
    const m = location.pathname.match(/^\/projects(?:\/([^/]+))?\/?$/);
    if (!m) return;
    const slug = m[1];
    setIsOpen(true);
    if (slug) {
      const project = findProjectBySlug(slug);
      if (project) {
        setSelectedProject(project);
        setIsLightboxOpen(false);
      }
    } else {
      setSelectedProject(null);
      setIsLightboxOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Router bindings to handle the back button state changes.
  // Top-level modal and per-project detail push real URLs so the address bar
  // shows /projects and /projects/<slug>. The lightbox stays hash-based
  // because it doesn't have a real route.
  const closeMain = useHashRouter(
    isOpen,
    "/projects",
    useCallback(() => setIsOpen(false), []),
  );

  const projectPathBase = selectedProject
    ? `/projects/${projectSlug(selectedProject)}`
    : "/projects";

  const closeProject = useHashRouter(
    !!selectedProject && !isLightboxOpen,
    projectPathBase,
    useCallback(() => setSelectedProject(null), []),
  );

  const closeLightbox = useHashRouter(
    isLightboxOpen,
    `${projectPathBase}#lightbox`,
    useCallback(() => setIsLightboxOpen(false), [selectedProject]),
  );
  // ----------------------------------
  // ----------------------------------

  const [activeCategory, setActiveCategory] = useState<Filter>("All");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [inlineIndex, setInlineIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const fullscreenSwiperRef = useRef<SwiperRef>(null);

  // Every slide stays in the list; failures are logged, never hidden.
  const validIndicesRef = useRef<number[]>([]);
  const validIndices = TILE_SLIDES.map((_, i) => i);
  validIndicesRef.current = validIndices;
  const activeSlide = validIndices.includes(currentSlide)
    ? currentSlide
    : validIndices[0] ?? 0;

  useEffect(() => {
    if (TILE_SLIDES.length === 0) return;

    // Preload every image so no layer fades in blank.
    TILE_SLIDES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce || validIndicesRef.current.length <= 1) {
      setCurrentSlide(validIndicesRef.current[0] ?? 0);
      return;
    }

    let timer: number | undefined;
    const start = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = window.setInterval(() => {
        const list = validIndicesRef.current;
        if (list.length === 0) return;
        setCurrentSlide((prev) => {
          const idx = list.indexOf(prev);
          return list[(idx + 1) % list.length] ?? list[0];
        });
      }, SLIDE_INTERVAL_MS);
    };
    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const filteredProjects =
    activeCategory === "All"
      ? myProjects
      : myProjects.filter((p) => p.category === activeCategory);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fullscreenSwiperRef.current && fullscreenSwiperRef.current.swiper) {
      if (isPlaying) {
        fullscreenSwiperRef.current.swiper.autoplay.stop();
      } else {
        fullscreenSwiperRef.current.swiper.autoplay.start();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setInlineIndex(0);

    // 🔥 remember last project
    setLastProject(project.title);

    window.gtag?.("event", "project_open", {
      project_name: project.title,
      project_category: project.category,
    });
  };

  const projectCanonical = selectedProject
    ? canonical(`/projects/${projectSlug(selectedProject)}`)
    : null;

  const currentIdx = selectedProject
    ? myProjects.findIndex((p) => p.id === selectedProject.id)
    : -1;
  const nextProject =
    currentIdx >= 0 ? myProjects[(currentIdx + 1) % myProjects.length] : null;

  const openNextProject = () => {
    if (!nextProject) return;
    openProject(nextProject);
  };

  const openTimeline = () => {
    if (selectedProject) openStory(selectedProject.timelineId);
  };

  return (
    <>
      <style>{swiperStyles}</style>

      {projectCanonical && (
        <Helmet>
          <link rel="canonical" href={projectCanonical} />
          <title>{`${selectedProject!.title} — Md Zakaria Hossain`}</title>
        </Helmet>
      )}

      {/* --- TILE FACE --- */}
      <motion.a
        href="/projects"
        aria-label="Open Selected Work"
        className="h-full w-full min-h-[300px] md:min-h-[500px] relative rounded-[2rem] overflow-hidden cursor-pointer group block no-underline text-inherit"
        whileHover={{ scale: 1.01 }}
        onClick={(e) => {
          if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        {TILE_SLIDES.length > 0 && (
          <div className="absolute inset-0 z-0">
            {TILE_SLIDES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                loading="eager"
                onError={() =>
                  console.error("Selected Work image failed:", src)
                }
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  opacity: i === activeSlide ? 1 : 0,
                  transition: `opacity ${FADE_MS}ms ease-in-out`,
                }}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
          <div className="flex justify-between items-start">
            <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                {myProjects.length} Featured
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 leading-[0.9]">
              Selected
              <br />
              Work
            </h3>
          </div>
        </div>
      </motion.a>

      {/* --- MAIN MODAL --- */}
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 bg-background/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-0 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              // FIXED: Use the programmatic close to keep history clean
              onClick={closeMain}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={selectedProject ? selectedProject.title : "Selected Work"}
                className="bg-card border-none md:border border-border text-card-foreground rounded-none md:rounded-[2.5rem] p-6 sm:p-10 max-w-7xl w-full h-[100dvh] md:h-[90vh] flex flex-col md:shadow-2xl overflow-hidden relative"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeMain}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-secondary hover:bg-secondary/80 rounded-full text-foreground transition-colors z-50 shadow-md"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>

                {!selectedProject ? (
                  /* --- GRID VIEW --- */
                  <div className="flex flex-col h-full pt-4 md:pt-0">
                    <div className="mb-8 shrink-0">
                      <h2 className="text-4xl sm:text-6xl font-black text-foreground tracking-tighter uppercase mb-6 pr-16 md:pr-0">
                        Selected <span className="text-green">Work</span>
                      </h2>
                      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {FILTERS.map((cat) => (
                          <button
                            key={cat}
                            onClick={(e) => {
                              setActiveCategory(cat);
                              // Slide the clicked tab to the center of the
                              // horizontally-scrolling row so the tabs after
                              // it stay visible instead of getting clipped
                              // off the right edge.
                              e.currentTarget.scrollIntoView({
                                behavior: "smooth",
                                block: "nearest",
                                inline: "center",
                              });
                            }}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all flex items-center gap-2 shrink-0
                                    ${
                                      activeCategory === cat
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-secondary text-muted-foreground border-transparent hover:border-border hover:text-foreground"
                                    }`}
                          >
                            {cat === "All" ? (
                              <Layers size={14} />
                            ) : (
                              getCategoryIcon(cat)
                            )}{" "}
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-y-auto pr-2 pb-4 no-scrollbar">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProjects.map((project) => (
                          <motion.a
                            layout
                            key={project.id}
                            href={`/projects/${projectSlug(project)}`}
                            aria-label={`Open ${project.title} case study`}
                            onClick={(e) => {
                              // Only intercept plain left-click. Ctrl/Cmd/middle
                              // click still opens the real URL in a new tab.
                              if (
                                e.button === 0 &&
                                !e.metaKey &&
                                !e.ctrlKey &&
                                !e.shiftKey
                              ) {
                                e.preventDefault();
                                openProject(project);
                              }
                            }}
                            className="group cursor-pointer bg-secondary/20 rounded-[2rem] p-3 border border-border hover:border-primary/50 transition-colors block no-underline text-inherit"
                          >
                            <div className="aspect-video rounded-[1.5rem] overflow-hidden mb-3 relative">
                              <img
                                src={project.image}
                                alt={project.title}
                                className="w-full h-full object-cover transition-all duration-500"
                              />
                            </div>
                            <div className="px-2 pb-2">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="text-lg font-black text-foreground uppercase leading-tight">
                                  {project.title}
                                </h3>
                                <ArrowRight
                                  size={18}
                                  className="text-primary shrink-0 mt-1"
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-bold uppercase tracking-wider">
                                <span className="px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary">
                                  {project.category}
                                </span>
                                <span className="text-muted-foreground">
                                  {project.status}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-muted-foreground mt-1">
                                {project.period}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {project.role}
                              </p>
                            </div>
                          </motion.a>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* --- DETAIL VIEW --- */
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col h-full overflow-y-auto no-scrollbar pt-12 md:pt-8"
                  >
                    <div className="flex items-center justify-between mb-8 shrink-0">
                      <button
                        // FIXED: Close specific layer
                        onClick={closeProject}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        <ArrowLeft size={14} /> Back to Gallery
                      </button>
                      <button
                        onClick={openNextProject}
                        className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-green focus-visible:ring-offset-2"
                      >
                        Next project <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 pb-12">
                      {/* --- INLINE GALLERY --- */}
                      <div className="rounded-[2.5rem] overflow-hidden border border-border aspect-square relative bg-secondary shadow-xl group/gallery">
                        <Swiper
                          modules={[Pagination, A11y, EffectCreative, Autoplay]}
                          spaceBetween={0}
                          slidesPerView={1}
                          loop={true}
                          autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                          }}
                          pagination={{ clickable: true }}
                          effect="creative"
                          creativeEffect={{
                            prev: { shadow: true, translate: [0, 0, -400] },
                            next: { translate: ["100%", 0, 0] },
                          }}
                          onSlideChange={(swiper) =>
                            setInlineIndex(swiper.realIndex)
                          }
                          className="w-full h-full inline-gallery"
                        >
                          {(selectedProject.gallery
                            ? selectedProject.gallery
                            : [selectedProject.image]
                          ).map((src, idx) => (
                            <SwiperSlide
                              key={idx}
                              className="w-full h-full bg-black"
                            >
                              <div
                                className="w-full h-full cursor-zoom-in"
                                onClick={() => {
                                  setIsLightboxOpen(true);
                                  setLightboxIndex(idx);
                                }}
                              >
                                <MediaDisplay
                                  src={src}
                                  className="w-full h-full object-cover"
                                  isActive={idx === inlineIndex}
                                  alt={selectedProject.title}
                                />
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-full text-white pointer-events-none z-10 opacity-0 group-hover/gallery:opacity-100 transition-opacity">
                          <Maximize2 size={20} />
                        </div>
                      </div>

                      {/* --- INFO --- */}
                      <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            {getCategoryIcon(selectedProject.category)}{" "}
                            {selectedProject.category}
                          </span>
                          <span className="px-4 py-2 rounded-full border border-border bg-secondary/50 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                            {selectedProject.status}
                          </span>
                        </div>

                        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground mb-6 leading-[0.95] uppercase tracking-tighter">
                          {selectedProject.title}
                        </h2>

                        {/* FACTS STRIP */}
                        <div className="grid grid-cols-2 gap-3 mb-8">
                          {selectedProject.facts.map((fact) => (
                            <div
                              key={fact.label}
                              className="bg-secondary/20 border border-border rounded-2xl p-3"
                            >
                              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                {fact.label}
                              </div>
                              <div className="text-sm font-bold text-foreground leading-snug">
                                {fact.value}
                              </div>
                            </div>
                          ))}
                        </div>

                        <p className="text-muted-foreground text-lg mb-4 leading-relaxed font-medium">
                          {selectedProject.description}
                        </p>

                        {/* RESPONSIBILITIES */}
                        {selectedProject.responsibilities.length > 0 && (
                          <ul className="mb-6 space-y-1.5 pl-1">
                            {selectedProject.responsibilities.map((r, i) => (
                              <li
                                key={i}
                                className="flex gap-2 text-muted-foreground text-base leading-snug"
                              >
                                <span className="text-primary shrink-0 mt-1">
                                  <ArrowRight size={14} />
                                </span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* TECH STACK */}
                        {selectedProject.tech && (
                          <div className="flex flex-wrap gap-2 mb-8">
                            {selectedProject.tech.map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1.5 rounded-lg bg-secondary/50 border border-border text-xs font-bold uppercase tracking-widest text-muted-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={openTimeline}
                            className="flex items-center gap-2 px-7 py-4 bg-foreground text-background rounded-full font-black text-sm uppercase tracking-widest border border-transparent hover:bg-background hover:text-foreground hover:border-foreground transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-green focus-visible:ring-offset-2"
                          >
                            See in career timeline
                          </button>
                          <button
                            onClick={openContact}
                            className="flex items-center gap-2 px-7 py-4 border border-border text-foreground rounded-full font-black text-sm uppercase tracking-widest hover:bg-foreground hover:text-background transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-green focus-visible:ring-offset-2"
                          >
                            Get in touch
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>

      {/* --- FULLSCREEN PRO LIGHTBOX --- */}
      <Portal>
        <AnimatePresence>
          {isLightboxOpen && selectedProject && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${selectedProject.title} — fullscreen gallery`}
              className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-3xl flex flex-col justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-full p-6 flex justify-between items-center z-50 pointer-events-none h-[80px]">
                <div className="pointer-events-auto">
                  <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-tighter">
                    {selectedProject.title}
                  </h2>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
                    {selectedProject.gallery
                      ? selectedProject.gallery.length
                      : 1}{" "}
                    Media Assets
                  </p>
                </div>
                <button
                  // FIXED: Use the programmatic close
                  onClick={closeLightbox}
                  className="pointer-events-auto p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md shadow-md"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="relative flex-1 w-full overflow-hidden flex items-center justify-center">
                <Swiper
                  ref={fullscreenSwiperRef}
                  modules={[Navigation, Pagination, A11y, Autoplay]}
                  spaceBetween={40}
                  slidesPerView={1}
                  loop={true}
                  initialSlide={lightboxIndex}
                  autoplay={{ delay: 4000, disableOnInteraction: false }}
                  pagination={{ clickable: true }}
                  onSlideChange={(swiper) => setLightboxIndex(swiper.realIndex)}
                  className="w-full h-full fullscreen-gallery"
                >
                  {(selectedProject.gallery
                    ? selectedProject.gallery
                    : [selectedProject.image]
                  ).map((src, idx) => (
                    <SwiperSlide
                      key={idx}
                      className="!flex !items-center !justify-center w-full h-full p-4 md:p-8"
                    >
                      <MediaDisplay
                        src={src}
                        className="max-w-full max-h-full object-contain shadow-2xl rounded-md mx-auto"
                        isActive={idx === lightboxIndex}
                        alt={selectedProject.title}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              <div className="h-[100px] w-full flex items-center justify-center z-50 pb-8 shrink-0">
                <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl border border-white/10 p-3 rounded-full shadow-2xl">
                  <button
                    onClick={() =>
                      fullscreenSwiperRef.current?.swiper.slidePrev()
                    }
                    className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    <SkipBack size={20} fill="currentColor" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className={`p-4 rounded-full transition-all flex items-center gap-2 font-bold uppercase tracking-widest text-xs
                                ${
                                  isPlaying
                                    ? "bg-[#d8ffc7] text-black hover:bg-[#c5eeb2]"
                                    : "bg-white text-black hover:bg-gray-200"
                                }`}
                  >
                    {isPlaying ? (
                      <Pause size={18} fill="currentColor" />
                    ) : (
                      <Play size={18} fill="currentColor" />
                    )}
                    <span className="hidden sm:block">
                      {isPlaying ? "Auto" : "Play"}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      fullscreenSwiperRef.current?.swiper.slideNext()
                    }
                    className="p-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                  >
                    <SkipForward size={20} fill="currentColor" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}
