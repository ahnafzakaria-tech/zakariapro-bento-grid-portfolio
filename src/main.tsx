import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import App from "./app/App.tsx";
import "./styles/index.css";
import { ThemeProvider } from "./app/components/theme-provider";
import { StoryPage } from "./app/pages/StoryPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            {/* /projects and /projects/:slug both open the Projects modal
                on home. CompactProjectsTile reads the pathname on cold
                load and sets isOpen + selectedProject accordingly, so
                refreshing at /projects/arova-technologies reopens the
                modal at that exact project. */}
            <Route path="/projects" element={<App />} />
            <Route path="/projects/:slug" element={<App />} />
            <Route path="/story" element={<StoryPage />} />
            {/* Fallback: unknown paths (corrupted URLs, old deep links,
                typos) bounce back to the bento home so the URL bar stays
                clean and asset resolution stays sane. */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  </StrictMode>,
);
