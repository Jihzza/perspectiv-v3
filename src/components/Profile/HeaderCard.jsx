// src/components/Profile/HeaderCard.jsx
import { Link } from "react-router-dom";
import OctagonAvatar from "../Layout/OctagonAvatar"; // keep your existing component

export default function HeaderCard({ displayName, username, avatarUrl, initials, createdAt }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex flex-col items-center gap-6">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <OctagonAvatar
              src={avatarUrl}
              alt={displayName}
              size={112}
              ringWidth={3}
              gap={6}
              ringColor="#24C8FF"
              className="shrink-0"
            />
          ) : (
            <div className="w-24 h-24 rounded-full ring-3 ring-white/20 bg-white/10 grid place-items-center text-2xl font-semibold shadow-lg">
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex w-full text-center justify-center min-w-0">
          <div className="space-y-1">
            <div className="text-3xl font-bold text-white">{displayName}</div>
            {!!username && (
              <div className="text-lg text-white/70 font-medium">@{username}</div>
            )}
            <div className="text-sm text-white/60">
              Member since {new Date(createdAt || Date.now()).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Edit button */}
        <div className="flex-shrink-0 self-center">
          <Link
            to="/profile/edit"
            className="flex items-center justify-center text-center gap-2 rounded-xl px-4 py-3 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
          >
            <span className="font-medium">Edit Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}