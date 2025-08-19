import { useEffect, useRef, useState } from "react";
import HeroSection from "../components/Hero/HeroSection";
import ChatbotSection from "../components/Chatbot/ChatbotSection";
import ServicesDescriptionSection from "../components/Services/ServicesDescriptionSection";
import DashboardSection from "../components/Dashboard/DashboardSection";
import useScrollTrigger from "../hooks/useScrollTrigger";
import { supabase } from "../lib/supabaseClient";
import { toPng } from "html-to-image";
import GenieEffectOverlay from "../components/Effects/GenieEffectOverlay";

export default function HomePage() {
  const started = useScrollTrigger(16);
  const chatbotRef = useRef(null);
  const [userId, setUserId] = useState(undefined);

  const [overlay, setOverlay] = useState(null); // { imgSrc, fromRect, toRect }

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

    const fr = chatEl.getBoundingClientRect();
    const tr = logoEl.getBoundingClientRect();

    // Snapshot the chat area at 1:1 CSS pixels
    toPng(chatEl, { pixelRatio: 1, cacheBust: true, backgroundColor: null })
      .then((dataUrl) => setOverlay({ imgSrc: dataUrl, fromRect: fr, toRect: tr }))
      .catch(() => setOverlay(null));
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
          onDone={() => setOverlay(null)}
        />
      )}

      <ServicesDescriptionSection />
      <DashboardSection />
    </main>
  );
}
