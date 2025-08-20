// src/components/Chatbot/ChatLog.jsx
import { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

export default function ChatLog({ messages, logo, onBotTypingStart, onBotTypingEnd }) {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    return (
        <div
            role="log"
            aria-live="polite"
            className="flex flex-col gap-4 h-59 px-4 overflow-y-auto"
            style={{ overflowAnchor: "none" }}
        >
            {messages.map((m) =>
                m.type === "typing" ? (
                    <TypingIndicator key={m.id} isBot logo={logo} />
                ) : (
                    <ChatMessage
                        key={m.id}
                        isBot={m.isBot}
                        text={m.text}
                        logo={logo}
                        onTypingStart={onBotTypingStart}
                        onTypingEnd={onBotTypingEnd}
                    />
                )
            )}
            <div ref={endRef} />
        </div>
    );
}