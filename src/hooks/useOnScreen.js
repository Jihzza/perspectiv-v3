import { useEffect, useState } from "react";

export default function useOnScreen(ref, { root = null, rootMargin = "0px", threshold = 0.1 } = {}) {
  const [isOnScreen, setIsOnScreen] = useState(true);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry.isIntersecting),
      { root, rootMargin, threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, root, rootMargin, threshold]);

  return isOnScreen;
}
