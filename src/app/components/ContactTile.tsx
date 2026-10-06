import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Linkedin,
  Mail,
  X,
  Phone,
  MessageCircle,
  ArrowUpRight,
  Send,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { Portal } from "./ui/portal";
import { useBackButton } from "../hooks/useBackButton";
import { getLastProject } from "./utils/analyticsContext";
import { resumeData } from "../ts/resume-data";
import { onOpenContact } from "../lib/modalBridge";

const EMAIL = "ahnafzakariaaz@gmail.com";

const contacts = [
  {
    name: "LinkedIn",
    icon: Linkedin,
    link: "https://www.linkedin.com/in/workwithzakariapro",
    handle: "@workwithzakariapro",
    reveal: false,
  },
  {
    name: "WhatsApp (Bangladesh)",
    icon: MessageCircle,
    link: "https://wa.me/8801517813524",
    handle: "+880 1517 813524",
    reveal: true,
  },
  {
    name: "Phone (KSA)",
    icon: Phone,
    link: "tel:+966530026787",
    handle: "+966 5300 26787",
    reveal: true,
  },
];

function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for browsers without the async Clipboard API.
  return new Promise((resolve, reject) => {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    try {
      document.execCommand("copy");
      resolve();
    } catch (err) {
      reject(err);
    } finally {
      document.body.removeChild(el);
    }
  });
}

export function ContactTile() {
  const [isOpen, setIsOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);

  const handleCloseModal = useCallback(() => setIsOpen(false), []);
  useBackButton(isOpen, handleCloseModal);

  // Allow the Work Gallery detail view to open this modal.
  useEffect(() => {
    return onOpenContact(() => setIsOpen(true));
  }, []);

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();

    window.gtag?.("event", "contact_click", {
      contact_type: "email",
      project_name: getLastProject() || "direct",
    });

    const subject = encodeURIComponent("Project Enquiry");
    const body = encodeURIComponent(
      "Hi Zakaria,\n\nI came across your portfolio and I'd like to discuss an opportunity with you.\n\nBest,\n[Your Name]",
    );

    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await copyText(EMAIL);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Ignore copy failures silently.
    }
  };

  const handleReveal = (name: string) => {
    setRevealed((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <>
      {/* --- TILE FACE --- */}
      <motion.button
        type="button"
        aria-label="Open Contact — email, LinkedIn, WhatsApp and phone links"
        className="bg-cta-bg text-cta-fg border-0 rounded-[2rem] overflow-hidden cursor-pointer group h-full w-full min-h-[140px] relative p-6 flex flex-col justify-between transition-all duration-200 text-left hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-green focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        whileHover={{ scale: 1.01 }}
        onClick={() => {
          setIsOpen(true);

          window.gtag?.("event", "contact_modal_open", {
            event_category: "engagement",
          });
        }}
      >
        <div className="flex justify-between items-start z-10">
          <div className="bg-white text-black dark:bg-black dark:text-white p-2.5 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
            <Mail size={24} />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 dark:bg-black/10 text-[10px] font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green"></span>
            </span>
            <span className="text-cta-fg">Replies in 1-2 days</span>
          </div>
        </div>

        <div className="relative z-10 mt-auto pt-4">
          <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-[0.9] text-cta-fg bg-cta-bg">
            Get In
          </h3>
          <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-[0.9] text-cta-green bg-cta-bg mt-0.5">
            Touch
          </h3>
        </div>

        <ArrowUpRight
          className="absolute top-5 right-5 text-cta-fg/60 group-hover:text-cta-fg opacity-0 group-hover:opacity-100 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          size={24}
        />
      </motion.button>

      {/* --- MODAL --- */}
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[9999] flex items-center justify-center p-0 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Contact Md Zakaria Hossain"
                className="bg-card border-none md:border border-border text-card-foreground rounded-none md:rounded-[2.5rem] p-6 pt-20 sm:p-10 max-w-3xl w-full relative h-[100dvh] md:h-auto overflow-y-auto no-scrollbar md:shadow-2xl flex flex-col justify-start md:justify-center"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-secondary hover:bg-secondary/80 rounded-full text-foreground transition-colors z-20 shadow-md"
                >
                  <X size={20} className="md:w-6 md:h-6" />
                </button>

                {/* Header */}
                <div className="mb-8 relative z-10">
                  <h2 className="text-4xl sm:text-5xl font-black text-foreground tracking-tighter uppercase leading-none mb-3">
                    Let's
                    <br />
                    <span className="text-cta-green">Connect</span>
                  </h2>
                  <p className="text-text-secondary text-lg max-w-md font-medium leading-relaxed">
                    Open to EPC project opportunities, document control roles,
                    and professional enquiries. I respond within 1-2 business
                    days.
                  </p>
                </div>

                {/* --- MAIN EMAIL CARD --- */}
                <div className="mb-6 shrink-0">
                  <div className="relative bg-secondary/20 border border-border rounded-[2rem] p-6 sm:p-8 transition-all">
                    <div className="flex items-center gap-4 sm:gap-5 w-full mb-5">
                      <div className="p-3 sm:p-4 bg-background rounded-2xl text-cta-green shadow-sm shrink-0">
                        <Mail size={28} className="sm:w-8 sm:h-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">
                          Send me a message
                        </h3>
                        <p className="text-[15px] sm:text-xl md:text-2xl font-black text-foreground tracking-tight truncate">
                          {EMAIL}
                        </p>
                        <p className="text-[13px] font-medium text-text-secondary mt-1">
                          Zakaria Hossain · Project Document Controller
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={handleEmail}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase text-xs sm:text-sm tracking-wide hover:opacity-90 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-green focus-visible:ring-offset-2"
                      >
                        <Send size={16} />
                        Send Email
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="flex items-center justify-center gap-2 px-6 py-3 border border-border bg-secondary/20 text-foreground rounded-xl font-bold uppercase text-xs sm:text-sm tracking-wide hover:bg-secondary/40 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-green focus-visible:ring-offset-2"
                      >
                        {isCopied ? (
                          <Check size={16} className="text-cta-green" />
                        ) : (
                          <Copy size={16} />
                        )}
                        <span>{isCopied ? "Copied" : "Copy email"}</span>
                      </button>
                    </div>

                    <span
                      className="sr-only"
                      role="status"
                      aria-live="polite"
                    >
                      {isCopied ? "Email copied to clipboard" : ""}
                    </span>
                  </div>
                </div>

                {/* --- SOCIAL / CONTACT GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0 pb-6 md:pb-0">
                  {contacts.map((contact, index) => {
                    const isRevealed = contact.reveal
                      ? !!revealed[contact.name]
                      : true;
                    const Icon = contact.icon;

                    if (contact.reveal && !isRevealed) {
                      // Hidden until revealed: show a "Tap to reveal" button.
                      return (
                        <motion.button
                          key={contact.name}
                          type="button"
                          onClick={() => handleReveal(contact.name)}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + index * 0.1 }}
                          className="flex flex-col items-center justify-center gap-3 bg-secondary/10 p-6 rounded-[2rem] border border-border transition-all group hover:border-primary/50 hover:bg-secondary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-green focus-visible:ring-offset-2 cursor-pointer min-h-[160px]"
                        >
                          <div className="p-3 bg-background rounded-full text-foreground group-hover:text-primary transition-colors shadow-sm group-hover:scale-110 duration-300">
                            <Icon size={24} />
                          </div>
                          <div className="text-center">
                            <h3 className="font-bold text-lg leading-none mb-1 text-foreground">
                              {contact.name}
                            </h3>
                            <span className="text-[13px] font-medium text-text-secondary">
                              Tap to reveal
                            </span>
                          </div>
                        </motion.button>
                      );
                    }

                    return (
                      <motion.a
                        key={contact.name}
                        href={contact.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          window.gtag?.("event", "contact_click", {
                            contact_type: contact.name.toLowerCase(),
                            project_name: getLastProject() || "direct",
                          });
                        }}
                        className="flex flex-col items-center justify-center gap-3 bg-secondary/10 p-6 rounded-[2rem] border border-border transition-all group hover:border-primary/50 hover:bg-secondary/20 min-h-[160px]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.1 }}
                      >
                        <div className="p-3 bg-background rounded-full text-foreground group-hover:text-primary transition-colors shadow-sm group-hover:scale-110 duration-300">
                          <Icon size={24} />
                        </div>
                        <div className="text-center">
                          <h3 className="font-bold text-lg leading-none mb-1 text-foreground">
                            {contact.name}
                          </h3>
                          <div className="flex items-center justify-center gap-1 text-[13px] font-medium text-text-secondary group-hover:text-primary/80 transition-colors">
                            <span className="truncate">{contact.handle}</span>
                            <ArrowUpRight size={13} />
                          </div>
                        </div>
                      </motion.a>
                    );
                  })}
                </div>

                {/* --- EXTRAS --- */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] font-medium text-text-secondary pb-8 md:pb-0">
                  <span>Based in Riyadh, KSA (AST, UTC+3)</span>
                  <a
                    href={resumeData.header.resumeLink}
                    download
                    className="inline-flex items-center gap-2 font-bold uppercase tracking-wider text-foreground hover:text-cta-green transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta-green focus-visible:ring-offset-2"
                  >
                    <Download size={14} />
                    Download CV
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
}