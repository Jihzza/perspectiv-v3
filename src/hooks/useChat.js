// src/hooks/useChat.js
import { useCallback, useEffect, useRef, useState } from "react";

function genSessionId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {}
  const rnd = (globalThis.crypto?.getRandomValues)
    ? globalThis.crypto.getRandomValues(new Uint8Array(16))
    : Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  return `${Date.now()}-${Array.from(rnd).map(x => x.toString(16).padStart(2, "0")).join("")}`;
}

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

export function useChat({ webhookUrl, welcomeWebhookUrl, userId }) {
  const sessionIdRef = useRef(genSessionId());
  const sessionId = sessionIdRef.current;

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedWelcome = useRef(false);

  // Welcome message (once per mount & userId change)
  useEffect(() => {
    if (userId === undefined || hasFetchedWelcome.current) return;
    hasFetchedWelcome.current = true;

    if (!welcomeWebhookUrl) {
      setMessages([{ id: Date.now(), isBot: true, text: "Hi! How can I help you today?" }]);
      return;
    }

    const typingId = Date.now();
    setMessages(prev => [...prev, { id: typingId, isBot: true, text: "…", type: "typing" }]);

    (async () => {
      try {
        const res = await fetch(welcomeWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: sessionId,
            user_id: userId ?? globalThis.localStorage?.getItem("user_id") ?? null,
            id: userId ?? globalThis.localStorage?.getItem("user_id") ?? null,
          }),
        });
        if (!res.ok) throw new Error(`Webhook error ${res.status}`);
        const data = await res.json().catch(() => ({}));
        const reply = extractText(data, "👋 Welcome!");
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { id: Date.now() + 1, isBot: true, text: reply },
        ]);
      } catch (err) {
        console.error("Welcome webhook error:", err);
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { id: Date.now() + 2, isBot: true, text: "Sorry, I couldn’t fetch the welcome message." },
        ]);
      }
    })();
  }, [userId, welcomeWebhookUrl, sessionId]);

  const send = useCallback(async (textArg) => {
    const text = (textArg ?? draft).trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), isBot: false, text };
    setMessages(prev => [...prev, userMsg]);
    setDraft("");
    setIsLoading(true);

    const typingId = Date.now() + 1;
    setMessages(prev => [...prev, { id: typingId, isBot: true, text: "…", type: "typing" }]);

    if (!webhookUrl) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { id: Date.now() + 2, isBot: true, text: "I'm not connected to a backend yet. Configure VITE_N8N_WEBHOOK_URL." },
        ]);
      }, 600);
      setIsLoading(false);
      return;
    }

    try {
      const uid = userId ?? globalThis.localStorage?.getItem("user_id") ?? null;
      const payload = {
        session_id: sessionId,
        user_id: uid,
        chatInput: text,
        message: text,
        history: messages.concat(userMsg).map(m => ({
          role: m.isBot ? "assistant" : "user",
          content: m.text,
        })),
      };

      console.log("Sending to webhook:", { url: webhookUrl, payload });

      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let details = "";
        try { details = await res.text(); } catch {}
        throw new Error(`Webhook error ${res.status}${details ? ` - ${details}` : ""}`);
      }

      const data = await res.json().catch(() => ({}));
      const reply = extractText(data);
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: Date.now() + 2, isBot: true, text: reply },
      ]);
    } catch (err) {
      console.error("Chat webhook error:", err);
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      const msg = String(err?.message || "");
      if (msg.includes("500")) errorMessage = "Server error (500) — check n8n execution logs.";
      else if (msg.includes("404")) errorMessage = "Webhook not found (404) — check URL config.";
      else if (msg.includes("403")) errorMessage = "Access denied (403) — check permissions.";

      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { id: Date.now() + 3, isBot: true, text: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [draft, isLoading, messages, userId, webhookUrl, sessionId]);

  const resetHistory = useCallback(() => setMessages([]), []);

  return { sessionId, messages, draft, setDraft, isLoading, send, resetHistory };
}