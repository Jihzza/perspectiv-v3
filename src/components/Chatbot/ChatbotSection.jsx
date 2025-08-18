// src/components/Chatbot/ChatbotSection.jsx
import { useRef, useState, useCallback } from "react";
import { useChat } from "../../hooks/useChat";
import ChatLog from "./ChatLog";
import MessageInput from "./MessageInput";
import logo from "../../assets/Perspectiv.svg";

export default function ChatbotSection({
  webhookUrl,
  userId,
  welcomeWebhookUrl = import.meta.env.VITE_N8N_WELCOME_WEBHOOK_URL,
  className = "",
}) {
  const { messages, draft, setDraft, isLoading, send } = useChat({
    webhookUrl,
    welcomeWebhookUrl,
    userId,
  });

  const inputRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleBotTypingStart = useCallback(() => setIsAnimating(true), []);
  const handleBotTypingEnd = useCallback(() => setIsAnimating(false), []);

  return (
    <section className={className}>
      <ChatLog
        messages={messages}
        logo={logo}
        onBotTypingStart={handleBotTypingStart}
        onBotTypingEnd={handleBotTypingEnd}
      />
      <MessageInput
        ref={inputRef}
        value={draft}
        onChange={setDraft}
        onSubmit={() => send()}
        sendLocked={isLoading || isAnimating}
        inputDisabled={false}
      />
    </section>
  );
}