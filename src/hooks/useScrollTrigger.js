// src/hooks/useScrollTrigger.js
import { useEffect, useState } from "react";

export default function useScrollTrigger(offsetPx = 32) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setTriggered(window.scrollY > offsetPx);
        ticking = false;
      });
    };

    // run once on mount in case we're already scrolled
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offsetPx]);

  return triggered;
}
