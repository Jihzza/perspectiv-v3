import { useEffect, useState, useCallback } from "react";

export default function ScrollToTopButton({ threshold = 160 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll(); // initialize
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const scrollToTop = useCallback(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      title="Back to top"
      onClick={scrollToTop}
      // Position: bottom-right, just above the bottom nav (4rem) + some gap + safe-area
      style={{
        bottom: "calc(4rem + env(safe-area-inset-bottom, 0px) + 1rem)",
      }}
      className={[
        "fixed right-4 z-[60]",
        "w-10 h-10 rounded-full",
        "bg-gradient-to-b from-[#33ccff]/50 to-[#33ccff]/5 border border-white/50 text-white",
        "shadow-lg backdrop-blur-sm",
        "flex items-center justify-center",
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        "focus:outline-none focus:ring-1 focus:ring-white/10 focus:ring-offset-1",
      ].join(" ")}
    >
      {/* Simple arrow icon (no external deps) */}
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 4l-7 7h4v7h6v-7h4z" />
      </svg>
    </button>
  );
}
