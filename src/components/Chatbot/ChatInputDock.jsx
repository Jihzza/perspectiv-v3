// src/components/Chatbot/ChatInputDock.jsx
import { useState } from "react";
import send from "../../assets/Send.svg";

/**
 * Floating mini input that mirrors ChatbotSection's styling.
 * Sits above BottomNavigation (z-50) and appears when parent asks.
 */
export default function ChatInputDock({ onOpen }) {
  const [draft, setDraft] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    // Let the parent reopen/scroll to the full chat; you can also lift state via context later
    onOpen?.(text);
  };

  return (
    <div className="fixed inset-x-4 bottom-20 md:bottom-24 z-[60]">
      <form onSubmit={handleSubmit} className="px-0">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full rounded-full border-2 border-[#33ccff] py-2 pr-12 pl-4 text-sm text-white placeholder:text-white/50 outline-none bg-black/30 backdrop-blur-md"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Message"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full disabled:cursor-not-allowed"
            aria-label="Send message"
            title="Send"
          >
            <img src={send} alt="Send" className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
