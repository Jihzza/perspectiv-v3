import { useRef, useState, useCallback } from "react";
import HeroSection from "../components/Hero/HeroSection";
import ChatbotSection from "../components/Chatbot/ChatbotSection";
import ServicesDescriptionSection from "../components/Services/ServicesDescriptionSection";
import DashboardSection from "../components/Dashboard/DashboardSection";
import ChatInputBar from "../components/Chatbot/ChatInputBar";
import useOnScreen from "../hooks/useOnScreen";
import useScrollTrigger from "../hooks/useScrollTrigger";


export default function HomePage() {
  // Chat state lives here now
  const [messages, setMessages] = useState([{ id: 1, isBot: true, text: "Hi! How can I help you today?" }]);
  const [draft, setDraft] = useState("");
  const started = useScrollTrigger(32);

  const onSubmit = useCallback((e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const userMsg = { id: Date.now(), isBot: false, text: draft.trim() };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    // TODO: call backend and push bot reply
  }, [draft]);

  // Observe the chatbot wrapper
  const chatbotRef = useRef(null);
  const chatVisible = useOnScreen(chatbotRef, { threshold: 0.25 });

  // Collapsing styles when not visible
  const collapsed = !chatVisible;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#1B2537] to-[#000000] pb-12">
      <HeroSection />

      {/* Chatbot wrapper that collapses when out of view */}
      <div
        ref={chatbotRef}
        className={[
          "overflow-hidden",
          "motion-safe:transition-[max-height,opacity,margin] motion-safe:duration-500 motion-safe:ease-out",
          started ? "max-h-0 opacity-0 -mt-4 pointer-events-none" : "max-h-[700px] opacity-100"
        ].join(" ")}
      >
        <ChatbotSection
          messages={messages}
          draft={draft}
          setDraft={setDraft}
          onSubmit={onSubmit}
          // as soon as we start scrolling, move the input out
          showInlineInput={!started}
        />
      </div>

      {/* These naturally move up when chat collapses */}
      <ServicesDescriptionSection />
      <DashboardSection />

      {/* Docked input appears at bottom when chat isn't visible */}
      {started && (
        <div
          className="fixed inset-x-0 z-40"
          style={{ bottom: "calc(4rem + env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-3xl px-2 py-2">
            <ChatInputBar draft={draft} setDraft={setDraft} onSubmit={onSubmit} />
          </div>
        </div>
      )}
    </main>
  );
}
