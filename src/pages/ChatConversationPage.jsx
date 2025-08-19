import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ChatMessage from "../components/Chatbot/ChatMessage";
import logo from "../assets/Perspectiv.svg";
import send from "../assets/Send.svg";

const PAGE = 50; // messages per page
const SESSION_KEY = "chatbot-session-id"; // must match ChatbotSection

export default function ChatConversationPage({ webhookUrl }) {
  const { sessionId } = useParams();
  const initialHydrateAt = useRef(Date.now());

  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]); // { id, role, content, created_at }
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  const logRef = useRef(null);
  const endRef = useRef(null);

  // Sync session id to match the main chatbot session handling
  useEffect(() => {
    if (sessionId) sessionStorage.setItem(SESSION_KEY, sessionId);
  }, [sessionId]);

  // Auth user
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => mounted && setUser(data?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  // Fetch messages for this session (ascending so newest at bottom)
  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      setLoading(true);
      const from = page * PAGE;
      const to = from + PAGE - 1;
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("id, role, content, created_at")
          .eq("session_id", sessionId)
          .order("created_at", { ascending: true })
          .range(from, to);
        if (error) throw error;
        setMessages(prev => (page === 0 ? (data ?? []) : [...prev, ...(data ?? [])]));
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, page]);

  // Auto-scroll like main chatbot
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Same extractor as ChatbotSection
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

  async function sendMessage(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;

    // optimistic user message
    const now = new Date().toISOString();
    const userMsg = { id: Date.now(), role: "user", content: text, created_at: now };
    setMessages(prev => [...prev, userMsg]);
    setDraft("");
    setIsSending(true);

    // temporary typing bubble
    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, role: "assistant", content: "…", created_at: now }]);

    const resolvedWebhook =
      webhookUrl || import.meta.env.VITE_N8N_WEBHOOK_URL || import.meta.env.VITE_N8N_DECISION_WEBHOOK_URL;

    if (!resolvedWebhook) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { id: Date.now() + 2, role: "assistant", content: "I'm sorry, but I'm not connected to a backend service yet. Please configure the VITE_N8N_WEBHOOK_URL environment variable.", created_at: new Date().toISOString() },
        ]);
        setIsSending(false);
      }, 600);
      return;
    }

    try {
      const payload = {
        session_id: sessionId,
        user_id: user?.id,
        chatInput: text,
        message: text,
        history: messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
      };

      // Send as form-encoded to avoid CORS preflight (OPTIONS).
      // All fields the workflow expects stay the same keys as before.
      const form = new URLSearchParams();
      form.set("session_id", sessionId ?? "");
      form.set("user_id", user?.id ?? "");
      form.set("chatInput", text);
      form.set("message", text);
      // History is an array -> stringify it
      form.set(
        "history",
        JSON.stringify(messages.map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        })))
      );

      const res = await fetch(resolvedWebhook, {
        method: "POST",
        body: form,            // no headers -> browser sets x-www-form-urlencoded
      });

      if (!res.ok) {
        let details = "";
        try { details = await res.text(); } catch { }
        throw new Error(`Webhook error ${res.status}${details ? ` - ${details}` : ""}`);
      }

      const data = await res.json().catch(() => ({}));
      const reply = extractText(data);

      // replace typing w/ reply
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: Date.now() + 3, role: "assistant", content: reply, created_at: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error("sendMessage error", err);
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: Date.now() + 4, role: "assistant", content: "Sorry, an error occurred.", created_at: new Date().toISOString() },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-3xl py-6">
        {/* Match main chatbot layout: log + input */}
        <section>
          {/* Chat Log */}
          <div
            role="log"
            aria-live="polite"
            ref={logRef}
            className="flex flex-col gap-4 h-90 px-4 overflow-y-auto"
            style={{ overflowAnchor: "none" }}
          >
            {loading && messages.length === 0 ? (
              <div className="text-white/70">Loading conversation…</div>
            ) : (
              messages.map((m) => {
                const isBot = m.role === "assistant";
                const created = new Date(m.created_at).getTime();
                const animate = isBot && created > initialHydrateAt.current;
                return (
                  <ChatMessage
                    key={m.id}
                    isBot={isBot}
                    text={m.content}
                    logo={logo}
                    animate={animate}
                  />
                );
              })
            )}
            <div ref={endRef} />
          </div>

          {/* Input form (identical classes to ChatbotSection) */}
          <form onSubmit={sendMessage} className="flex gap-2 px-4 mt-2">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full rounded-full border-2 border-[#33ccff] py-2 pr-12 pl-4 text-sm text-white placeholder:text-white/50 outline-none bg-black/30 backdrop-blur-md"
                placeholder="Type a message…"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={isSending}
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={isSending || !draft.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full disabled:cursor-not-allowed"
                aria-label="Send message"
                title="Send"
              >
                <img src={send} alt="Send" className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Back link (subtle) */}
          <div className="px-4 mt-4 text-xs text-white/60">
            <Link to="/profile/chat-history" className="underline hover:text-white/80">← Back to history</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
