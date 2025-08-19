import { useEffect, useRef, useState, useCallback } from "react";
import HeroSection from "../components/Hero/HeroSection";
import ChatbotSection from "../components/Chatbot/ChatbotSection";
import ServicesDescriptionSection from "../components/Services/ServicesDescriptionSection";
import DashboardSection from "../components/Dashboard/DashboardSection";
import useScrollTrigger from "../hooks/useScrollTrigger";
import { supabase } from "../lib/supabaseClient";
import * as htmlToImage from "html-to-image";
import GenieEffectOverlay from "../components/Effects/GenieEffectOverlay";

export default function HomePage() {
  const started = useScrollTrigger(16);
  const chatbotRef = useRef(null);
  const [userId, setUserId] = useState(undefined);

  const [overlay, setOverlay] = useState(null); // { imgSrc, fromRect, toRect }

  // Stable onDone (avoids effect churn in React 18 Strict Mode dev)
  const handleOverlayDone = useCallback(() => setOverlay(null), []);

  // Wait until scrolling is idle before capturing/animating
  function waitForScrollIdle({ maxWait = 300, idle = 100 } = {}) {
    return new Promise((resolve) => {
      let done = false;
      const finish = () => { if (!done) { done = true; cleanup(); resolve(); } };

      const onEnd = () => finish();
      const onScroll = () => { last = performance.now(); };
      let last = performance.now();
      let poll;

      const cleanup = () => {
        document.removeEventListener("scrollend", onEnd);
        window.removeEventListener("scroll", onScroll, { passive: true });
        clearInterval(poll);
      };

      if ("onscrollend" in document) {
        document.addEventListener("scrollend", onEnd, { once: true });
        setTimeout(finish, maxWait); // safety
      } else {
        window.addEventListener("scroll", onScroll, { passive: true });
        poll = setInterval(() => {
          if (performance.now() - last >= idle) finish();
        }, 50);
        setTimeout(finish, maxWait);
      }
    });
  }

  // Cap snapshot pixel area & max side (safer for Safari/iOS)
  const MAX_PIXELS = 8_000_000; // ~8MP
  const MAX_SIDE = 4096;        // iOS per-side ceiling

  function scaledCanvasSize(w, h, maxPx = MAX_PIXELS, maxSide = MAX_SIDE) {
    let sw = Math.min(w, maxSide);
    let sh = Math.min(h, maxSide);
    const area = sw * sh;
    if (area <= maxPx) return [Math.floor(sw), Math.floor(sh)];
    const scale = Math.sqrt(maxPx / area);
    return [Math.max(1, Math.floor(sw * scale)), Math.max(1, Math.floor(sh * scale))];
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_evt, session) => setUserId(session?.user?.id ?? null));
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!started) return;
    const chatEl = chatbotRef.current;
    const logoEl = document.getElementById("perspectiv-nav-logo");
    if (!chatEl || !logoEl) return;

    (async () => {
      // Wait until scrolling is idle (iOS can throttle rAF during touch scroll)
      await waitForScrollIdle();

      const fr = chatEl.getBoundingClientRect();
      const tr = logoEl.getBoundingClientRect();

      try {
        // Downscale snapshot to stay within safe pixel limits
        const [cw, ch] = scaledCanvasSize(fr.width, fr.height);

        const canvas = await htmlToImage.toCanvas(chatEl, {
          pixelRatio: 1,          // keep math simple and predictable
          backgroundColor: null,  // preserve transparency
          cacheBust: true,
          canvasWidth: cw,
          canvasHeight: ch,
        });

        // Use a Blob URL (decodes more reliably on Safari than huge data URLs)
        const blob = await new Promise((res) => canvas.toBlob(res, "image/png", 0.92));
        if (!blob) throw new Error("Canvas toBlob returned null");
        const url = URL.createObjectURL(blob);

        setOverlay({ imgSrc: url, fromRect: fr, toRect: tr });
      } catch (_err) {
        setOverlay(null); // optional: add a simple CSS fallback here
      }
    })();
  }, [started]);

  return (
    <main className="min-h-screen">
      <HeroSection />

      <div
        ref={chatbotRef}
        className={[
          "overflow-hidden",
          "motion-safe:transition-[max-height,opacity,margin] motion-safe:duration-200 motion-safe:ease-out",
          started ? "max-h-0 opacity-0 -mt-4 pointer-events-none" : "max-h-[700px] opacity-100"
        ].join(" ")}
      >
        <ChatbotSection
          webhookUrl={import.meta.env.VITE_N8N_DECISION_WEBHOOK_URL}
          welcomeWebhookUrl={import.meta.env.VITE_N8N_WELCOME_WEBHOOK_URL}
          userId={userId}
        />
      </div>

      {overlay && (
        <GenieEffectOverlay
          imgSrc={overlay.imgSrc}
          fromRect={overlay.fromRect}
          toRect={overlay.toRect}
          duration={700}
          rowPx={6}
          onDone={handleOverlayDone}
        />
      )}

      <ServicesDescriptionSection />
      <DashboardSection />
    </main>
  );
}
