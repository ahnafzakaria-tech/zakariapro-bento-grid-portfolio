import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-500">
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            Md Zakaria Hossain
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="/projects" className="hover:text-foreground transition-colors">
              Projects
            </Link>
            <Link to="/story" className="hover:text-foreground transition-colors">
              Story
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16">{children}</main>

      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-border mt-16 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span>© {new Date().getFullYear()} Md Zakaria Hossain</span>
          <div className="flex gap-4">
            <a href="mailto:ahnafzakariaaz@gmail.com" className="hover:text-foreground transition-colors">
              Email
            </a>
            <a
              href="https://www.linkedin.com/in/workwithzakariapro"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://wa.me/8801517813524"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
