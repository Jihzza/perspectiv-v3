// src/pages/ChatLayoutPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import ChatbotSection from "../components/Chatbot/ChatbotSection";

export default function ChatLayoutPage() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let mounted = true;

    // hydrate current user
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUserId(data?.user?.id ?? null);
    });

    // listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Optional: persist user id like you already do on Home
  useEffect(() => {
    try {
      if (userId) localStorage.setItem("user_id", userId);
      else localStorage.removeItem("user_id");
    } catch {}
  }, [userId]);

  return (
    <main className="min-h-screen text-white">
      {/* Match normal chatbot layout: center column + safe bottom space for fixed composer */}
      <div className="mx-auto max-w-3xl py-6 pb-[calc(var(--composer-h,72px)+88px)]">
        <ChatbotSection
          webhookUrl={import.meta.env.VITE_N8N_DECISION_WEBHOOK_URL}
          welcomeWebhookUrl={import.meta.env.VITE_N8N_WELCOME_WEBHOOK_URL}
          userId={userId}
        />
      </div>
    </main>
  );
}
