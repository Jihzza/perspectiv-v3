import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, cubicBezier } from "framer-motion";

/**
 * SnapshotSuctionOverlay
 * Plays a minimize/restore using a pre-captured PNG (dataURL).
 * New: targetPosition = "center" | "bottom" | "outsideBottom"
 */

let _safeAreaBottom = null;
function getSafeAreaBottom() {
  if (_safeAreaBottom != null) return _safeAreaBottom;
  const probe = document.createElement("div");
  probe.style.cssText = "position:fixed;left:-9999px;bottom:0;padding-bottom:env(safe-area-inset-bottom)";
  document.body.appendChild(probe);
  _safeAreaBottom = parseFloat(getComputedStyle(probe).paddingBottom) || 0;
  probe.remove();
  return _safeAreaBottom;
}

export default function SnapshotSuctionOverlay({
  imgSrc,                          // required dataURL (html-to-image output)
  anchorRef,                       // Chat container ref
  targetSelector = "#perspectiv-nav-logo",
  targetPosition = "bottom",       // <— NEW default: pull to bottom edge
  targetYOffset = 0,               // px push when using "outsideBottom"
  mode = "minimize",               // "minimize" | "restore"
  duration = 0.28,
  endOpacity = 1,                // 50% opacity at end of minimize
  zStart = 40,                     // keep under BottomNav (ensure Nav has higher z-index)
  onComplete,
}) {
  const [chatRect, setChatRect] = useState(null);
  const [navRect, setNavRect] = useState(null);

  useLayoutEffect(() => {
    const chatEl = anchorRef?.current;
    const navEl = document.querySelector(targetSelector);
    if (!chatEl || !navEl) return;

    setChatRect(chatEl.getBoundingClientRect());
    setNavRect(navEl.getBoundingClientRect());

    const onResize = () => {
      setChatRect(chatEl.getBoundingClientRect());
      setNavRect(navEl.getBoundingClientRect());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [anchorRef, targetSelector]);

  // Compute a point (cx, cy) for "center" | "bottom" | "outsideBottom"
  function pointFor(rect, position) {
    const cx = rect.left + rect.width / 2;
  
    if (position === "center") return { cx, cy: rect.top + rect.height / 2 };
    if (position === "bottom") return { cx, cy: rect.bottom - 2 };
  
    // outsideBottom — use visual viewport for mobile toolbars, plus safe-area
    const vv = window.visualViewport?.height ?? window.innerHeight; // mobile-friendly viewport
    const safe = getSafeAreaBottom(); // iOS home indicator notch area
    const cy = vv + safe - Number(targetYOffset || 0); 
    // NOTE: If targetYOffset is NEGATIVE, cy = vv + safe + |offset| -> travels farther down
    return { cx, cy };
  }

  const {
    left,
    top,
    width,
    height,
    dx,
    dy,
    endScale,
    startClip,
    endClip,
  } = useMemo(() => {
    if (!chatRect || !navRect) {
      return {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        dx: 0,
        dy: 0,
        endScale: 0.25,
        startClip: "circle(80% at 50% 50%)",
        endClip: "circle(12% at 50% 50%)",
      };
    }

    // Start/end points by mode
    const start = mode === "minimize"
      ? pointFor(chatRect, "center")
      : pointFor(navRect, targetPosition);
    const end = mode === "minimize"
      ? pointFor(navRect, targetPosition)
      : pointFor(chatRect, "center");

    const dx = end.cx - start.cx;
    const dy = end.cy - start.cy;

    // Scale target — use element widths (or a small factor if outsideBottom)
    const targetW = targetPosition === "outsideBottom" ? chatRect.width * 0.25 : navRect.width;
    const scale = Math.max(0.18, Math.min(0.38, targetW / chatRect.width));

    // Suction circle
    const startClip = mode === "minimize" ? "circle(80% at 50% 50%)" : "circle(18% at 50% 50%)";
    const endClip   = mode === "minimize" ? "circle(12% at 50% 50%)" : "circle(75% at 50% 50%)";

    return {
      left: chatRect.left,
      top: chatRect.top,
      width: chatRect.width,
      height: chatRect.height,
      dx,
      dy,
      endScale: scale,
      startClip,
      endClip,
    };
  }, [chatRect, navRect, targetPosition, mode, targetYOffset]);

  // Easing: accelerate for minimize, gentler for restore
  const fluentAccelerate = cubicBezier(1, 0, 1, 1);
  const ease = mode === "minimize" ? fluentAccelerate : [0.2, 0.8, 0.2, 1];

  if (!imgSrc || !chatRect || !navRect) return null;

  return createPortal(
    <motion.img
      src={imgSrc}
      alt=""
      aria-hidden
      style={{
        position: "fixed",
        left,
        top,
        width,
        height,
        objectFit: "cover",
        pointerEvents: "none",
        zIndex: zStart,                // under the BottomNavigation if it has higher z-index
        transformOrigin: "50% 100%",   // <— center-bottom origin sells the “pull down”
        willChange: "transform, clip-path, opacity",
      }}
      initial={{
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        clipPath: startClip,           // MDN: clip-path basic-shape circle() is animatable
        boxShadow: "0 18px 42px rgba(0,0,0,0.24), 0 6px 18px rgba(0,0,0,0.18)",
      }}
      animate={{
        x: dx,
        y: dy,
        scale: endScale,
        opacity: mode === "minimize" ? endOpacity : 1,
        clipPath: endClip,
        boxShadow:
          mode === "minimize"
            ? "0 6px 16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)"
            : "0 18px 42px rgba(0,0,0,0.24), 0 6px 18px rgba(0,0,0,0.18)",
      }}
      transition={{ duration, ease }}
      onAnimationComplete={() => onComplete?.()}
    />,
    document.body
  );
}
