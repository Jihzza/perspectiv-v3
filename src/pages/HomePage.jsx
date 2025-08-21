import { useEffect, useRef, useState } from "react";
import HeroSection from "../components/Hero/HeroSection";
import ChatbotSection from "../components/Chatbot/ChatbotSection";
import Consultations from "../components/Services/Consultations";
import Training from "../components/Services/Training";
import Software from "../components/Services/Software";
import DashboardSection from "../components/Dashboard/DashboardSection";
import useScrollTrigger from "../hooks/useScrollTrigger";
import { supabase } from "../lib/supabaseClient";

export default function HomePage() {
  const started = useScrollTrigger(16); // when the user scrolls down a bit
  const chatbotRef = useRef(null);

  const [userId, setUserId] = useState(undefined);

  useEffect(() => {
    window.scrollTo(0, 0);
    supabase.auth.getUser().then(({ data }) => setUserId(data?.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      if (userId) localStorage.setItem("user_id", userId);
      else localStorage.removeItem("user_id");
    } catch {}
  }, [userId]);

  return (
    <main className="min-h-screen">
      <HeroSection />
      <div
        ref={chatbotRef}
        className={[
          "grid overflow-hidden",
          "transition-[grid-template-rows,opacity,margin,filter] duration-300 ease-out",
          "will-change-[grid-template-rows,opacity,filter]",
          started
            ? "grid-rows-[0fr] opacity-0 -mt-4 blur-[0.5px] pointer-events-none"
            : "grid-rows-[1fr] opacity-100 mt-0 blur-0"
        ].join(" ")}
      >
        <div className="min-h-0">
          <ChatbotSection
            webhookUrl={import.meta.env.VITE_N8N_DECISION_WEBHOOK_URL}
            welcomeWebhookUrl={import.meta.env.VITE_N8N_WELCOME_WEBHOOK_URL}
            userId={userId}
          />
        </div>
      </div>
      <Consultations />
      <Training />
      <Software />
      <DashboardSection />
    </main>
  );
}
