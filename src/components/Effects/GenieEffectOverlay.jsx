import { useEffect, useRef } from "react";

export default function GenieEffectOverlay({
  imgSrc, fromRect, toRect, duration = 700, rowPx = 6, onDone,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = 1; // keep 1:1 with CSS pixels for sane math
    canvas.width = Math.ceil(window.innerWidth * dpr);
    canvas.height = Math.ceil(window.innerHeight * dpr);
    const ctx = canvas.getContext("2d");

    const img = new Image();
    imgRef.current = img;
    img.onload = () => {
      run();
    };
    img.src = imgSrc;

    function easeQuadInOut(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    function run() {
      const start = performance.now();
      const moveUp = (toRect.bottom < fromRect.bottom);

      // Initial and final frames (in viewport/CSS pixels)
      const initial = {
        left: fromRect.left, right: fromRect.right,
        top: fromRect.top, bottom: fromRect.bottom,
        width: fromRect.width, height: fromRect.height
      };

      // Shrink toward the logo’s center; small final size feels like macOS
      const tipCx = toRect.left + toRect.width / 2;
      const tipCy = toRect.top + toRect.height / 2;
      const finalW = Math.max(20, Math.min(40, toRect.width * 0.6));
      const finalH = Math.max(18, Math.min(34, toRect.height * 0.6));

      const final = {
        left: tipCx - finalW / 2, right: tipCx + finalW / 2,
        top: tipCy - finalH / 2, bottom: tipCy + finalH / 2,
        width: finalW, height: finalH
      };

      // Blog timing: shear ends ~50%, translate starts ~40% (overlap)
      const SLIDE_END = 0.5;
      const TRANSLATE_START = 0.4;

      // Curvature range (Bezier "top" = initial top, "bottom" = final top)
      const bezierTopY = initial.top;
      const bezierBottomY = final.top;
      const bezierHeight = bezierTopY - bezierBottomY;

      // Distances
      const leftEdgeDistance = final.left - initial.left;
      const rightEdgeDistance = final.right - initial.right;
      const topDistance = final.top - initial.top; // vertical translation

      // Rows (blog suggests ~5–10 px per row → smooth but fast)
      const rowCount = Math.max(12, Math.round(initial.height / rowPx));
      const srcSliceH = img.naturalHeight / rowCount;

      // Convert Y → X on the left/right Bezier edges
      function leftBezierXForY(y, slideProgress) {
        const bottomX = initial.left + slideProgress * leftEdgeDistance;
        if (y <= bezierBottomY) return bottomX;
        if (y >= bezierTopY) return initial.left;
        const t = (y - bezierBottomY) / bezierHeight;
        return bottomX + easeQuadInOut(t) * (initial.left - bottomX);
      }
      function rightBezierXForY(y, slideProgress) {
        const bottomX = initial.right + slideProgress * rightEdgeDistance;
        if (y <= bezierBottomY) return bottomX;
        if (y >= bezierTopY) return initial.right;
        const t = (y - bezierBottomY) / bezierHeight;
        return bottomX + easeQuadInOut(t) * (initial.right - bottomX);
      }

      let rafId = 0;
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
      const dur = reduceMotion ? Math.min(220, duration * 0.35) : duration;

      const draw = (now) => {
        const t = clamp01((now - start) / dur);
        const slideProgress = clamp01(t / SLIDE_END);
        const translateProgress = clamp01((t - TRANSLATE_START) / (1 - TRANSLATE_START));
        const translation = translateProgress * topDistance;

        // Evolving top/bottom edges
        let topY = initial.top + translation;
        let bottomY = initial.bottom + translation;

        // Clamp edges toward final rect to avoid overshoot
        if (moveUp) {
          topY = Math.max(topY, final.top);
          bottomY = Math.max(bottomY, final.bottom);
        } else {
          topY = Math.min(topY, final.top);
          bottomY = Math.min(bottomY, final.bottom);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const destHeight = bottomY - topY;
        const destRowH = destHeight / rowCount;

        for (let i = 0; i < rowCount; i++) {
          const pos = i / (rowCount - 1); // 0..1 top→bottom
          const y = topY + destHeight * pos;
          const xL = leftBezierXForY(y, slideProgress);
          const xR = rightBezierXForY(y, slideProgress);
          const destW = Math.max(1, xR - xL);

          const sy = i * srcSliceH;

          // Draw this horizontal slice stretched between xL..xR at y
          ctx.drawImage(
            img,
            0, sy, img.naturalWidth, srcSliceH,   // source slice
            xL, y, destW, destRowH               // destination quad (approx via rect)
          );
        }

        if (t < 1) {
          rafId = requestAnimationFrame(draw);
        } else {
          onDone?.();
        }
      };

      rafId = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(rafId);
    }

    return () => {
      // cleanup if needed
    };
  }, [imgSrc, fromRect, toRect, duration, rowPx, onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100vw", height: "100vh",
        pointerEvents: "none", zIndex: 80
      }}
      aria-hidden
    />
  );
}
