// src/components/ChatMessage.jsx
export default function ChatMessage({ isBot, text, logo }) {
    return (
      <div className={`flex items-start gap-1 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar — show logo for bot, invisible spacer for user */}
        {isBot ? (
          <img src={logo} alt="" className="h-8 w-8 shrink-0 rounded-full" />
        ) : null}
  
        {/* Bubble */}
        <div
          className={`py-2 px-2 rounded-xl rounded-br-sm max-w-xs text-sm leading-relaxed
            ${isBot 
              ? "text-white" 
              : "bg-[#33ccff]/15 px-4 backdrop-blur-md text-white ml-auto"
            }`}
        >
          {text}
        </div>
      </div>
    );
  }
  