import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Marker we stamp onto pushState entries we own. If the current
// history entry carries this marker, `history.back()` is guaranteed
// to land on whatever came before we opened the modal (typically the
// home page). If it doesn't, this tab loaded straight into the modal
// URL (fresh tab from a middle-click or a shared link) and there's
// no previous entry to go back to — closing must navigate to `/`
// explicitly.
const OWNED_MARKER = "__portfolio_modal_owned__";

/**
 * Modal-URL router.
 *
 * `path` can be either:
 *   - a real path starting with "/" (e.g. "/projects") — pushed as a full URL
 *   - a bare string (e.g. "projects/29/lightbox") — pushed as "#projects/29/lightbox"
 *
 * We keep hash form for nested modal state (project detail, lightbox, playground
 * item) because those states don't have real routes yet. Top-level tile modals
 * push real paths so the URL bar shows /projects instead of lying with a
 * hash fragment.
 */
export function useHashRouter(
  isOpen: boolean,
  path: string,
  onBack: () => void,
) {
  const prevIsOpen = useRef(false);
  const isRealPath = path.startsWith("/");
  const navigate = useNavigate();

  const readCurrent = () =>
    isRealPath
      ? window.location.pathname + window.location.search
      : window.location.hash.replace(/^#/, "");

  const matches = (current: string) =>
    current === path || current.startsWith(path + "/");

  useEffect(() => {
    const wasOpen = prevIsOpen.current;
    prevIsOpen.current = isOpen;

    if (isOpen && !wasOpen) {
      const current = readCurrent();
      if (!matches(current)) {
        // Push directly via history API. React Router's BrowserRouter doesn't
        // observe raw pushState calls, so the app doesn't re-render — the
        // modal stays open on top of whatever was rendering before.
        //
        // CRITICAL: hash-style paths must be prefixed with "#". Passing a
        // bare string like "playground/filmography/2" makes the browser
        // resolve it as a relative URL against the current document URL —
        // which corrupts the URL and cascades into 404s for every relative
        // image, video, and audio path in the app.
        const pushTarget = isRealPath ? path : `#${path}`;
        window.history.pushState(
          { [OWNED_MARKER]: true },
          "",
          pushTarget,
        );
      }
    }
  }, [isOpen, path]);

  const close = useCallback(() => {
    const current = readCurrent();
    if (matches(current)) {
      const ownedByUs =
        window.history.state && (window.history.state as any)[OWNED_MARKER];
      if (ownedByUs) {
        // We pushed the current entry ourselves — safe to unwind.
        window.history.back();
      } else {
        // Fresh tab / cold link landed straight on the modal URL. Nothing to
        // go back to. Navigate home via React Router (client-side, no reload).
        onBack();
        navigate("/", { replace: true });
      }
    } else {
      onBack();
    }
  }, [path, onBack, navigate]);

  // Keep closeRef.current in sync so the Escape handler always calls the
  // latest version of ``close``.
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    if (!isOpen) return;

    const onPopState = () => {
      const current = readCurrent();
      if (!matches(current)) {
        onBack();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      }
    };

    window.addEventListener("popstate", onPopState);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, path]);

  return close;

}

export function useHashInit(
  entries: Array<{
    match: RegExp;
    // Allow dynamic parent hashes based on the regex match!
    parentHashes: string[] | ((groups: RegExpMatchArray) => string[]);
    onMatch: (groups: RegExpMatchArray) => void;
  }>,
) {
  const initialized = useRef(false);

  useEffect(() => {
    const hash = window.location.hash;

    // --- 1. MOUNT LOGIC (Injects history so back button works for fresh deep links) ---
    if (!initialized.current && hash) {
      initialized.current = true;
      for (const entry of entries) {
        const m = hash.match(entry.match);
        if (m) {
          const currentHash = hash.replace(/^#/, "");
          const parents =
            typeof entry.parentHashes === "function"
              ? entry.parentHashes(m)
              : entry.parentHashes;

          if (parents.length > 0) {
            const baseUrl = window.location.pathname + window.location.search;
            window.history.replaceState(null, "", baseUrl);
            for (const p of parents) {
              window.history.pushState(
                { [OWNED_MARKER]: true },
                "",
                `#${p}`,
              );
            }
            window.history.pushState(
              { [OWNED_MARKER]: true },
              "",
              `#${currentHash}`,
            );
          }
          setTimeout(() => {
            entry.onMatch(m);

            if (window.gtag) {
              window.gtag("event", "page_view", {
                page_location: window.location.href,
                page_path: window.location.pathname + window.location.hash,
                page_title: document.title,
              });
            }
          }, 10);
          return;
        }
      }
      initialized.current = true;
    }

    // --- 2. HASHCHANGE LOGIC (Listens to manual URL edits while app is already open) ---
    const handleHashChange = () => {
      const currentHash = window.location.hash;
      if (window.gtag) {
        window.gtag("event", "page_view", {
          page_location: window.location.href,
          page_path: window.location.pathname + currentHash,
          page_title: document.title,
        });
      }
      for (const entry of entries) {
        const m = currentHash.match(entry.match);
        if (m) {
          entry.onMatch(m);
          break;
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [entries]);
}
