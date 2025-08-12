// src/components/Chatbot/ChatbotSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import logo from "../../assets/Perspectiv.svg";

export default function ChatbotSection({
  messages: controlledMessages,
  setMessages: setControlledMessages,
  draft: controlledDraft,
  setDraft: setControlledDraft,
  onSubmit,                    // optional; parent can still hook submit
  showInlineInput = true,
  fadeInline = true,
  className = "",
  webhookUrl,                  // optional prop (overrides env)
  userId,                      // optional: pass your app's user ID if available
}) {
  // -------------------------
  // Stable session_id per tab
  // -------------------------
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

  // ---------------------------------
  // Controlled vs Uncontrolled wiring
  // ---------------------------------
  const isMessagesControlled =
    typeof controlledMessages !== "undefined" &&
    typeof setControlledMessages === "function";

  const isDraftControlled =
    typeof controlledDraft !== "undefined" &&
    typeof setControlledDraft === "function";

  // Uncontrolled defaults: seed the first bot bubble so UI looks identical on load
  const [uncontrolledMessages, setUncontrolledMessages] = useState([
    { id: 1, isBot: true, text: "Hi! How can I help you today?" },
  ]);
  const [uncontrolledDraft, setUncontrolledDraft] = useState("");

  // Effective state
  const messages = isMessagesControlled ? controlledMessages : uncontrolledMessages;
  const setMessages = isMessagesControlled ? setControlledMessages : setUncontrolledMessages;
  const draft = isDraftControlled ? controlledDraft : uncontrolledDraft;
  const setDraft = isDraftControlled ? setControlledDraft : setUncontrolledDraft;

  // Refs / utilities
  const endRef = useRef(null);
  const didWelcome = useRef(false);

  // Auto-scroll when messages change
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Stable log id if you're using it for aria labels
  const logId = useMemo(
    () => `chat-log-${Math.random().toString(36).slice(2)}`,
    []
  );

  // ----------------------------
  // Response extractor (n8n-safe)
  // ----------------------------
  function extractText(payload, fallback = "Sorry, I didn’t get a response.") {
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

  // ---------------------------------------
  // Welcome webhook → replace first bot bubble
  // ---------------------------------------
  useEffect(() => {
    if (isMessagesControlled) return;   // parent owns messages; don't auto-welcome
    if (didWelcome.current) return;
    didWelcome.current = true;

    const WELCOME_URL = import.meta?.env?.VITE_N8N_WELCOME_WEBHOOK_URL || null;
    if (!WELCOME_URL) return; // keep seeded greeting if no backend welcome

    (async () => {
      try {
        const res = await fetch(WELCOME_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId,
          }),
        });
        if (!res.ok) throw new Error(`Welcome webhook error ${res.status}`);
        const data = await res.json().catch(() => ({}));
        const reply = extractText(data, "👋");

        // Replace text of the FIRST bot message only — no new elements added
        setMessages(prev => {
          const idx = prev.findIndex(m => m.isBot);
          if (idx === -1) return prev;
          const next = prev.slice();
          next[idx] = { ...next[idx], text: reply };
          return next;
        });
      } catch (err) {
        // Silently keep the seeded greeting to avoid any visual change
        console.warn("Welcome webhook failed:", err);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------
  // Default submit logic
  // --------------------
  const defaultSubmit = async () => {
    const text = draft.trim();
    if (!text) return;

    // Optimistic echo (your own message visible immediately)
    const userMsg = { id: Date.now(), isBot: false, text };
    setMessages(prev => [...prev, userMsg]);
    setDraft("");

    // Show typing placeholder bubble
    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, isBot: true, text: "…" }]);

    // Use prop URL if provided, else env var
    const DECISION_URL =
      webhookUrl || import.meta?.env?.VITE_N8N_DECISION_WEBHOOK_URL;

    if (!DECISION_URL) {
      // Fallback behavior (no backend): keep appearance identical
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { id: Date.now() + 2, isBot: true, text: "Got it! I'll think about that…" },
        ]);
      }, 300);
      return;
    }

    try {
      const res = await fetch(DECISION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // New backend contract — include old keys for compatibility
          session_id: sessionId,
          user_id: userId,
          chatInput: text,
          message: text,
          history: messages.map(m => ({
            role: m.isBot ? "assistant" : "user",
            content: m.text,
          })),
        }),
      });

      if (!res.ok) throw new Error(`Webhook error ${res.status}`);

      const data = await res.json().catch(() => ({}));
      const reply = extractText(data);

      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: Date.now() + 3, isBot: true, text: reply },
      ]);
    } catch (err) {
      console.error("Chatbot webhook error:", err);
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: Date.now() + 4, isBot: true, text: "Error talking to server." },
      ]);
    }
  };

  // ---------------------------------------------------------
  // Submit handler: ALWAYS echo user's message before delegating
  // ---------------------------------------------------------
  function handleSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    if (typeof onSubmit === "function") {
      // Optimistic echo so the user's message is immediately visible
      const userMsg = { id: Date.now(), isBot: false, text };
      setMessages(prev => [...prev, userMsg]);
      setDraft("");

      // Delegate to parent (it can handle sending / typing indicator as it wishes)
      // Provide text + sessionId if parent wants them.
      onSubmit(e, { text, sessionId });
      return;
    }

    // Uncontrolled (or no parent handler): do the full default flow
    defaultSubmit();
  }

  // ----------------
  // Render (no CSS changes)
  // ----------------
  return (
    <section className={className}>
      {/* Chat Log */}
      <div role="log" id={logId} aria-live="polite" className="flex flex-col gap-4 h-110 px-4 overflow-y-auto">
        {messages.map((m) => (
          <ChatMessage key={m.id} isBot={m.isBot} text={m.text} logo={logo} />
        ))}
        <div ref={endRef} />
      </div>

      {/* Inline input stays fully visible; fade behavior preserved via your classes */}
      {showInlineInput && (
        <div
          className={
            fadeInline
              ? "transition-opacity duration-300 opacity-100"
              : ""
          }
        >
          <form onSubmit={handleSubmit} className="flex gap-2 px-4">
            <input
              type="text"
              className="flex-1 rounded-full border-2 border-[#33ccff] py-2 px-4 text-sm text-white placeholder:text-white/50 outline-none bg-black/30 backdrop-blur-md"
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Message"
            />
            <button type="submit" className="sr-only">Send</button>
          </form>
        </div>
      )}
    </section>
  );
}
