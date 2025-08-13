import { useEffect, useRef, useState } from "react";
import HeroSection from "../components/Hero/HeroSection";
import ChatbotSection from "../components/Chatbot/ChatbotSection";
import ServicesDescriptionSection from "../components/Services/ServicesDescriptionSection";
import DashboardSection from "../components/Dashboard/DashboardSection";
import useOnScreen from "../hooks/useOnScreen";
import useScrollTrigger from "../hooks/useScrollTrigger";
import { supabase } from "../lib/supabaseClient";
import ChatInputDock from "../components/Chatbot/ChatInputDock";

export default function HomePage() {
  const started = useScrollTrigger(16);
  const [showDock, setShowDock] = useState(false);
  const chatbotRef = useRef(null);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    // get current user now
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));
    // keep in sync with auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // Observe the chatbot wrapper
  const chatVisible = useOnScreen(chatbotRef, { threshold: 0.15 });

  const openChatAndFocus = (prefill = "") => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onChatTransitionEnd = (e) => {
    if (!started) return;                           // only care when collapsing
    if (e.target !== chatbotRef.current) return;    // only the wrapper
    if (["max-height", "opacity", "margin"].includes(e.propertyName)) {
      setShowDock(true);                            // 🎯 right after the animation
    }
  };

  // hide dock immediately when expanding again
  useEffect(() => {
    if (!started) setShowDock(false);
  }, [started]);


  return (
    <main className="min-h-screen">
      <HeroSection />

      {/* Chatbot wrapper that collapses when out of view */}
      <div
        ref={chatbotRef}
        onTransitionEnd={onChatTransitionEnd}
        className={[
          "overflow-hidden",
          "motion-safe:transition-[max-height,opacity,margin] motion-safe:duration-200 motion-safe:ease-out",
          started ? "max-h-0 opacity-0 -mt-4 pointer-events-none" : "max-h-[700px] opacity-100"
        ].join(" ")}
      >
        <ChatbotSection
          webhookUrl={import.meta.env.VITE_N8N_DECISION_WEBHOOK_URL}
          userId={userId}
        />
      </div>

      {/* Floating dock (same styling as chat input), appears AFTER animation ends */}
      {showDock && (
        <ChatInputDock
          onOpen={() => window.scrollTo({ top: 0, behavior: "smooth" })} // reopen full chat
        />
      )}

      {/* Floating dock appears only when chat is NOT visible */}
      {!chatVisible && <ChatInputDock onOpen={openChatAndFocus} />}

      <ServicesDescriptionSection />
      <DashboardSection />
    </main>
  );
}
