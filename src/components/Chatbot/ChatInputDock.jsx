// src/components/Chatbot/ChatInputDock.jsx
import { useState, useRef, useLayoutEffect } from "react";
import send from "../../assets/Send.svg";

function useAutosize(el, value, maxVH = 40) {
  useLayoutEffect(() => {
    if (!el) return;
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const maxPx = Math.round(vh * (maxVH / 100));
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, maxPx);
    el.style.height = next + "px";
    el.style.overflowY = el.scrollHeight > maxPx ? "auto" : "hidden";
  }, [el, value, maxVH]);
}

export default function ChatInputDock({ onOpen }) {
  const [draft, setDraft] = useState("");
  const areaRef = useRef(null);
  useAutosize(areaRef.current, draft, 40);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onOpen?.(text);
    setDraft("");
  };

  return (
    <div className="fixed inset-x-4 bottom-20 md:bottom-24 z-[60]">
      <form onSubmit={handleSubmit} className="px-0">
        <div className="relative">
          <textarea
            ref={areaRef}
            rows={1}
            className="w-full rounded-2xl border-2 border-[#33ccff] py-2 pr-12 pl-4 text-sm text-white placeholder:text-white/50 outline-none bg-black/30 backdrop-blur-md resize-none overflow-hidden max-h-[40vh]"
            placeholder="Type a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            aria-label="Message"
            aria-multiline="true"
            enterKeyHint="send"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="absolute right-2 bottom-2 p-1 rounded-full disabled:cursor-not-allowed"
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
