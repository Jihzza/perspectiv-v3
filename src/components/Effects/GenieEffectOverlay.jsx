import { useEffect, useRef } from "react";

const DEBUG = false;
const dbg = (...args) => { if (DEBUG) console.log("[Genie]", ...args); };

/**
 * GenieEffectOverlay
 * Renders a one-off "genie" canvas animation that folds/sucks a snapshot
 * toward a target rect (e.g., your center nav icon).
 *
 * Props:
 *  - imgSrc: data/blob/http(s) URL of the raster to animate
 *  - fromRect: DOMRect-like {left, top, right, bottom, width, height}
 *  - toRect:   DOMRect-like {left, top, right, bottom, width, height}
 *  - duration: ms, default 700
 *  - rowPx:    approx pixels per row-slice, default 6
 *  - onDone:   callback when finished or canceled
 */
export default function GenieEffectOverlay({
  imgSrc,
  fromRect,
  toRect,
  duration = 700,
  rowPx = 6,
  onDone,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    dbg("mount/useEffect", { hasCanvas: !!canvas, hasImgSrc: !!imgSrc, fromRect, toRect, duration, rowPx });

    if (!canvas || !imgSrc || !fromRect || !toRect) {
      dbg("early-exit: missing required props/canvas");
      onDone?.();
      return;
    }

    // ---- Visual Viewport sizing/locking -----------------------------------
    const vv = typeof window !== "undefined" ? window.visualViewport : null;

    const lockViewportAndSizeCanvas = () => {
      const cssW = vv?.width ?? window.innerWidth;
      const cssH = vv?.height ?? window.innerHeight;
      const offX = vv?.offsetLeft ?? 0;
      const offY = vv?.offsetTop ?? 0;

      const s = canvas.style;
      s.position = "fixed";
      s.left = offX + "px";
      s.top = offY + "px";
      s.width = cssW + "px";
      s.height = cssH + "px";
      s.pointerEvents = "none";
      s.zIndex = "80";

      const dpr = 1; // 1 CSS px = 1 canvas px (simplifies geometry)
      canvas.width = Math.ceil(cssW * dpr);
      canvas.height = Math.ceil(cssH * dpr);

      dbg("lockViewportAndSizeCanvas", { cssW, cssH, offX, offY, canvasW: canvas.width, canvasH: canvas.height });
    };

    lockViewportAndSizeCanvas();

    // Cancel if the visual viewport changes mid-animation
    const cancelOnViewportChange = (ev) => {
      dbg("visualViewport change detected -> cancel animation", { type: ev?.type });
      stop();
      onDone?.();
    };

    if (vv) {
      vv.addEventListener("resize", cancelOnViewportChange, { once: true });
      vv.addEventListener("scroll", cancelOnViewportChange, { once: true });
      dbg("visualViewport listeners attached");
    } else {
      dbg("visualViewport not available; relying on layout viewport");
    }

    // ---------------- Load the raster (prefer ImageBitmap for blob:) --------
    let aborted = false;
    const isString = typeof imgSrc === "string";
    const isBlobURL = isString && imgSrc.startsWith("blob:");
    const isDataURL = isString && imgSrc.startsWith("data:");
    const isHttpURL = isString && /^https?:/i.test(imgSrc);

    const startWithBitmap = async () => {
      try {
        // fetch blob from blob: URL then create an ImageBitmap (fast path)
        const resp = await fetch(imgSrc);
        const blob = await resp.blob();
        const bitmap = await createImageBitmap(blob);
        if (aborted) return;
        runAnimation(canvas, bitmap, fromRect, toRect, {
          duration,
          rowPx,
          onDone: () => { stop(); onDone?.(); }
        });
      } catch (err) {
        dbg("bitmap path failed; falling back to <img>", err);
        startWithImage();
      }
    };

    const startWithImage = () => {
      const img = new Image();

      // Only set crossOrigin for real network URLs
      if (isHttpURL) img.crossOrigin = "anonymous";
      img.decoding = "async";

      img.onload = () => {
        if (aborted) return;
        try {
          runAnimation(canvas, img, fromRect, toRect, {
            duration,
            rowPx,
            onDone: () => { stop(); onDone?.(); }
          });
        } catch (err) {
          dbg("runAnimation threw error", err);
          stop();
          onDone?.();
        } finally {
          // Revoke blob URLs after load
          if (isBlobURL) URL.revokeObjectURL(imgSrc);
        }
      };

      img.onerror = (e) => {
        dbg("img.onerror", e);
        if (isBlobURL) URL.revokeObjectURL(imgSrc);
        stop();
        onDone?.();
      };

      dbg("img.src set", { isDataURL, isBlobURL, isHttpURL });
      img.src = imgSrc;
    };

    if (isBlobURL && "createImageBitmap" in window) {
      startWithBitmap();
    } else {
      startWithImage();
    }

    // ---- Cleanup ------------------------------------------------------------
    function stop() {
      aborted = true;
      dbg("stop() called");
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        dbg("cancelAnimationFrame", { rafId: rafRef.current });
      }
      rafRef.current = 0;
      vv?.removeEventListener("resize", cancelOnViewportChange);
      vv?.removeEventListener("scroll", cancelOnViewportChange);
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dbg("canvas cleared");
      }
    }

    return stop;
  }, [imgSrc, fromRect, toRect, duration, rowPx, onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 80 }}
      aria-hidden
    />
  );

  // -------------------- Implementation --------------------------------------
  function runAnimation(canvas, source, fromRect, toRect, opts) {
    const { duration, rowPx, onDone } = opts;
    const ctx = canvas.getContext("2d");
    const srcW = "naturalWidth" in source ? source.naturalWidth : source.width;
    const srcH = "naturalHeight" in source ? source.naturalHeight : source.height;

    if (!ctx || !srcW || !srcH) {
      dbg("runAnimation: missing ctx or invalid image; aborting");
      onDone?.();
      return;
    }

    // Respect reduced motion with a shorter duration
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const dur = Math.max(120, reduceMotion ? Math.min(220, duration * 0.35) : duration);

    dbg("runAnimation:start", {
      duration,
      durUsed: dur,
      reduceMotion,
      rowPx,
      fromRect,
      toRect,
      canvasW: canvas.width,
      canvasH: canvas.height,
      srcW,
      srcH,
    });

    const easeQuadInOut = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    const moveUp = toRect.bottom < fromRect.bottom;

    const initial = {
      left: fromRect.left,
      right: fromRect.right,
      top: fromRect.top,
      bottom: fromRect.bottom,
      width: fromRect.width,
      height: fromRect.height,
    };

    const tipCx = toRect.left + toRect.width / 2;
    const tipCy = toRect.top + toRect.height / 2;
    const finalW = Math.max(20, Math.min(40, toRect.width * 0.6));
    const finalH = Math.max(18, Math.min(34, toRect.height * 0.6));
    const final = {
      left: tipCx - finalW / 2,
      right: tipCx + finalW / 2,
      top: tipCy - finalH / 2,
      bottom: tipCy + finalH / 2,
      width: finalW,
      height: finalH,
    };

    const SLIDE_END = 0.5;
    const TRANSLATE_START = 0.4;
    const topDistance = final.top - initial.top;
    const bezierTopY = initial.top;
    const bezierBottomY = final.top;
    const bezierHeight = bezierTopY - bezierBottomY;
    const leftEdgeDistance = final.left - initial.left;
    const rightEdgeDistance = final.right - initial.right;

    const rowCount = Math.max(12, Math.round(initial.height / rowPx));
    const srcSliceH = srcH / rowCount;

    dbg("geometry", {
      moveUp,
      initial,
      final,
      topDistance,
      leftEdgeDistance,
      rightEdgeDistance,
      rowCount,
      srcSliceH,
      SLIDE_END,
      TRANSLATE_START,
    });

    ctx.imageSmoothingEnabled = true;

    const start = performance.now();
    let lastBucket = -1; // for sparse frame logs

    const draw = (now) => {
      const t = clamp01((now - start) / dur);
      const slideProgress = clamp01(t / SLIDE_END);
      const translateProgress = clamp01((t - TRANSLATE_START) / (1 - TRANSLATE_START));
      let translation = translateProgress * topDistance;

      let topY = initial.top + translation;
      let bottomY = initial.bottom + translation;

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
        const pos = i / (rowCount - 1);
        const y = topY + destHeight * pos;
        const bottomXLeft  = initial.left  + slideProgress * leftEdgeDistance;
        const bottomXRight = initial.right + slideProgress * rightEdgeDistance;

        // Bezier edges
        const leftBezierX = (() => {
          if (y <= bezierBottomY) return bottomXLeft;
          if (y >= bezierTopY) return initial.left;
          const t2 = (y - bezierBottomY) / bezierHeight;
          return bottomXLeft + easeQuadInOut(t2) * (initial.left - bottomXLeft);
        })();

        const rightBezierX = (() => {
          if (y <= bezierBottomY) return bottomXRight;
          if (y >= bezierTopY) return initial.right;
          const t2 = (y - bezierBottomY) / bezierHeight;
          return bottomXRight + easeQuadInOut(t2) * (initial.right - bottomXRight);
        })();

        const destW = Math.max(1, rightBezierX - leftBezierX);
        const sy = i * srcSliceH;

        ctx.drawImage(
          source,
          0, sy, srcW, srcSliceH,
          leftBezierX, y, destW, destRowH
        );
      }

      // Log milestones (0%, 50%, 100%)
      if (DEBUG) {
        const bucket = Math.floor(t * 10);
        if (bucket !== lastBucket && (bucket === 0 || bucket === 5 || bucket === 10)) {
          dbg("frame", { t, slideProgress, translateProgress, topY, bottomY, destHeight, bucket: bucket * 10 + "%" });
          lastBucket = bucket;
        }
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        dbg("animation complete");
        onDone?.();
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    dbg("requestAnimationFrame scheduled", { rafId: rafRef.current });
  }
}
