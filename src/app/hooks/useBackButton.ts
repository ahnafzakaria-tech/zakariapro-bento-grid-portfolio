// src/hooks/useBackButton.ts
import { useEffect, useRef } from "react";

export function useBackButton(isOpen: boolean, close: () => void) {
  // Store the latest close function in a ref so it doesn't trigger re-renders
  const closeRef = useRef(close);

  useEffect(() => {
    closeRef.current = close;
  }, [close]);

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modalOpen: true }, "", "#open");

    const handleBackButton = () => {
      closeRef.current(); // Uses the ref instead of the changing function
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
      if (window.location.hash === "#open") {
        window.history.back();
      }
    };
  }, [isOpen]); // Removed `close` from dependencies here
}