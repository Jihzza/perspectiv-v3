// src/components/Profile/ChatbotCard.jsx
import { Link } from "react-router-dom";

export default function ChatbotCard({ title = "Chatbot", historyPath = "/profile/chat-history" }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Link
          to={historyPath}
          className="text-sm font-medium border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          View History
        </Link>
      </div>
    </div>
  );
}