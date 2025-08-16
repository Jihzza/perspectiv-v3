// src/components/Chatbot/ChatbotSection.jsx
import { endRef, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import logo from "../../assets/Perspectiv.svg";
import send from "../../assets/Send.svg"

export default function ChatbotSection({
  webhookUrl,                  // n8n workflow webhook URL
  userId,                      // optional: pass your app's user ID if available
  className = "",
}) {
  // Stable session_id per tab
  const SESSION_KEY = "chatbot-session-id";
  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id =
      (globalThis.crypto && typeof crypto.randomUUID === "function")
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  });

  // Chat state
  const [messages, setMessages] = useState([
    { id: 1, isBot: true, text: "Hi! How can I help you today?" },
  ]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Refs
  const logRef = useRef(null);

  // Extract text from n8n workflow response
  function extractText(payload, fallback = "Sorry, I didn't get a response.") {
    const item = Array.isArray(payload) ? payload[0] : payload;
    return (
      item?.content ??
      item?.value ??
      item?.output ??
      item?.reply ??
      item?.text ??
      item?.answer ??
      item?.choices?.[0]?.message?.content ??
      fallback
    );
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isLoading) return;

    // Add user message immediately
    const userMsg = { id: Date.now(), isBot: false, text };
    setMessages(prev => [...prev, userMsg]);
    setDraft("");
    setIsLoading(true);

    // Show typing indicator
    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, isBot: true, text: "…" }]);

    // Check if webhook URL is provided
    if (!webhookUrl) {
      // Fallback behavior when no webhook is configured
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { id: Date.now() + 2, isBot: true, text: "I'm sorry, but I'm not connected to a backend service yet. Please configure the VITE_N8N_WEBHOOK_URL environment variable." },
        ]);
      }, 1000);
      setIsLoading(false);
      return;
    }

    try {
      // Prepare the payload
      const payload = {
        session_id: sessionId,
        user_id: userId,
        chatInput: text,
        message: text,
        history: messages.map(m => ({
          role: m.isBot ? "assistant" : "user",
          content: m.text,
        })),
      };

      // Log the payload for debugging
      console.log("Sending to webhook:", {
        url: webhookUrl,
        payload: payload
      });

      // Call n8n workflow
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Get error details if possible
        let errorDetails = "";
        try {
          const errorData = await res.text();
          errorDetails = errorData ? ` - ${errorData}` : "";
        } catch (e) {
          // Ignore error parsing errors
        }

        throw new Error(`Webhook error ${res.status}${errorDetails}`);
      }

      const data = await res.json().catch(() => ({}));
      const reply = extractText(data);

      // Replace typing indicator with actual response
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: Date.now() + 2, isBot: true, text: reply },
      ]);
    } catch (err) {
      console.error("Chatbot webhook error:", err);

      // Show more helpful error message
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (err.message.includes("500")) {
        errorMessage = "Server error (500) - The backend workflow is having issues. Please check the n8n execution logs.";
      } else if (err.message.includes("404")) {
        errorMessage = "Webhook not found (404) - Please check the webhook URL configuration.";
      } else if (err.message.includes("403")) {
        errorMessage = "Access denied (403) - Please check the webhook permissions.";
      }

      // Replace typing indicator with error message
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: Date.now() + 3, isBot: true, text: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={className}>
      {/* Chat Log */}
      <div
        role="log"
        aria-live="polite"
        ref={logRef}
        className="flex flex-col gap-4 h-90 px-4 overflow-y-auto"
        style={{ overflowAnchor: "none" }}
      >        {messages.map((m) => (
        <ChatMessage key={m.id} isBot={m.isBot} text={m.text} logo={logo} />
      ))}
        <div ref={endRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2 px-4">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full rounded-full border-2 border-[#33ccff] py-2 pr-12 pl-4 text-sm text-white placeholder:text-white/50 outline-none bg-black/30 backdrop-blur-md"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={isLoading}
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={isLoading || !draft.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <img src={send} alt="Send" className="w-5 h-5" />
          </button>
        </div>
      </form>
    </section>
  );
}
