export default function ChatInputBar({ draft, setDraft, onSubmit, className = "" }) {
    return (
      <form onSubmit={onSubmit} className={`flex gap-2 px-4 ${className}`}>
        <input
          type="text"
          className="flex-1 rounded-full border-2 border-[#33ccff] px-3 py-2 text-sm placeholder:text-white/50 bg-black/30 backdrop-blur-md text-white"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
      </form>
    );
  }
  