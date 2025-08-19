// src/components/Chatbot/ChatMessage.jsx
import { useEffect, useRef, useState } from "react";

export default function ChatMessage({ isBot, text, logo, onTypingStart, onTypingEnd, animate = true }) {
  const [shown, setShown] = useState(isBot && animate ? "" : text);
  const timerRef = useRef(null);

  useEffect(() => {
    // Only animate bot messages
    if (!isBot || !animate) {
      setShown(text);
      return;
    }

    // reset any prior run
    if (timerRef.current) clearInterval(timerRef.current);

    const full = String(text ?? "");
    if (!full) {
      setShown("");
      return;
    }

    // kick off animation
    onTypingStart?.();
    setShown("");
    let i = 0;
    const STEP_MS = 18; // ~55 chars/sec; tweak if you want slower/faster

    timerRef.current = setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        onTypingEnd?.();
      }
    }, STEP_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBot, text, animate]); // run when any of these change

  return (
    <div className={`flex items-start gap-1 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
      {isBot ? <img src={logo} alt="" className="h-8 w-8 shrink-0 rounded-full" /> : null}
      <div
        className={`py-2 px-2 rounded-xl rounded-br-sm max-w-xs text-sm leading-relaxed ${isBot ? "text-white" : "bg-[#33ccff]/15 px-4 backdrop-blur-md text-white ml-auto"
          }`}
        // Announce the full message once to screen readers; hide the animated characters from AT
        aria-label={text}
      >
        <span aria-hidden="true">{isBot ? shown : text}</span>
      </div>
    </div>
  );
}
