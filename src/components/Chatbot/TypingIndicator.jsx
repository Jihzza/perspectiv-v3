// src/components/Chatbot/TypingIndicator.jsx
export default function TypingIndicator({ isBot = true, logo }) {
    return (
        <div className={`flex items-start gap-1 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
            {isBot ? (
                <img
                    src={logo}
                    alt=""                // decorative; don't announce in screen readers
                    aria-hidden="true"    // extra safety for AT
                    className="h-8 w-8 shrink-0 rounded-full"
                />
            ) : null}
            <div className="px-3 py-2 rounded-xl">
                <span className="inline-flex items-end gap-1 text-white">
                    <span className="animate-bounce [animation-delay:-0.50s]">•</span>
                    <span className="animate-bounce [animation-delay:-0.35s]">•</span>
                    <span className="animate-bounce [animation-delay:-0.20s]">•</span>
                </span>
            </div>
        </div>
    );
}