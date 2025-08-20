// MessageInput.jsx
import { useRef, useLayoutEffect, useEffect, forwardRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import sendIcon from "../../assets/Send.svg";

/** ======= TUNING KNOBS ======= */
const NAV_H = 64;        // bottom navbar height (px)
const MAX_VH = 40;       // textarea max height as % of viewport
const SPRING = {         // speed/snappiness of corner morph (physics)
  stiffness: 220,        // ↑ faster/snappier, ↓ slower/softer
  damping: 28,           // ↑ more damping = slower settle
  mass: 1
};
const LAYOUT_TRANSITION = {
  layout: { duration: 0.22, ease: "easeOut" } // form height/position tween
};
// How many line-heights it takes to morph from pill -> xl (perceived speed):
const BLEND_LINES = 1.25; // ↑ larger = slower morph, ↓ smaller = faster morph
/** ============================ */

const PILL = 9999; // ~ rounded-full
const XL = 12;     // ~ rounded-xl (px)

// Auto-size the textarea to its content (upward growth; bottom pinned by the wrapper)
function useAutosize(textarea, value, maxVH = MAX_VH) {
  useLayoutEffect(() => {
    if (!textarea) return;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const maxPx = Math.round(vh * (maxVH / 100));

    textarea.style.height = "0px";
    const next = Math.min(textarea.scrollHeight, maxPx);
    textarea.style.height = next + "px";
    textarea.style.overflowY = textarea.scrollHeight > maxPx ? "auto" : "hidden";

    // Keep chat log padding in sync with composer height
    const wrapper = textarea.closest("[data-composer]");
    if (wrapper) {
      requestAnimationFrame(() => {
        const h = wrapper.offsetHeight;
        document.documentElement.style.setProperty("--composer-h", `${h}px`);
      });
    }
  }, [textarea, value, maxVH]);
}

const MessageInput = forwardRef(function MessageInput(
  { value, onChange, onSubmit, sendLocked = false, inputDisabled = false },
  _ref
) {
  const areaRef = useRef(null);
  const formRef = useRef(null);

  useAutosize(areaRef.current, value, MAX_VH);

  // Motion: map live height -> smooth height -> borderRadius
  const h = useMotionValue(0);
  const hSmooth = useSpring(h, SPRING); // control reaction speed here

  const baseHRef = useRef(null);  // baseline height (1-line)
  const blendRef = useRef(24);    // pixels to blend from pill -> xl

  useEffect(() => {
    if (!formRef.current) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const height = entry.contentRect.height; // reliable size read
      if (height <= 0) return;

      // First measure: set baseline and blend distance
      if (baseHRef.current == null) {
        baseHRef.current = height;

        // derive blend distance from textarea line-height × BLEND_LINES
        let lh = 24;
        const ta = areaRef.current;
        if (ta) {
          const cs = window.getComputedStyle(ta);
          const parsed = parseFloat(cs.lineHeight);
          if (!Number.isNaN(parsed)) lh = parsed;
        }
        blendRef.current = Math.max(12, Math.round(lh * BLEND_LINES));
      }

      h.set(height);
    });

    ro.observe(formRef.current);
    return () => ro.disconnect();
  }, [h]);

  // height -> radius (continuous), clamped between PILL and XL
  const borderRadius = useTransform(hSmooth, (height) => {
    const base = baseHRef.current ?? height;
    const blend = blendRef.current || 24;
    const t = Math.max(0, Math.min(1, (height - base) / blend)); // 0..1
    return PILL + (XL - PILL) * t; // lerp
  });

  const handleSend = () => {
    if (sendLocked) return; // locked while bot is “writing”
    if (!String(value || "").trim()) return;
    onSubmit?.();
  };

  return (
    <div
      data-composer
      className="fixed left-0 right-0 z-50 px-4 pb-[calc(env(safe-area-inset-bottom))]"
      style={{ bottom: `calc(${NAV_H}px + env(safe-area-inset-bottom))` }}
    >
      <motion.form
        ref={formRef}
        layout
        style={{ borderRadius }}
        transition={LAYOUT_TRANSITION}
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative justify-center items-center flex bg-black/30 backdrop-blur-md border-2 border-[#33ccff] p-2"
      >
        <textarea
          ref={areaRef}
          rows={1}
          className="w-full text-white placeholder:text-white/50 bg-transparent resize-none outline-none max-h-[40vh] pr-12 pl-1"
          placeholder="Type a message…"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => {
            // Enter = send, Shift+Enter = newline
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (!sendLocked) handleSend();
            }
          }}
          disabled={inputDisabled}
          aria-label="Message"
          aria-multiline="true"
          enterKeyHint="send"
        />

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full"
          aria-label="Send message"
          title="Send"
          disabled={sendLocked || !String(value || "").trim()}
        >
          <img src={sendIcon} alt="Send" className="w-5 h-5" />
        </button>
      </motion.form>
    </div>
  );
});

export default MessageInput;
