// src/components/ProfileEdit/AvatarPicker.jsx
import OctagonAvatar from "../Layout/OctagonAvatar"; // adjust relative path if needed

export default function AvatarPicker({ avatarPreview, initials, inputRef, onPickFile }) {
  return (
    <div className="flex items-center gap-4 py-2">
      {avatarPreview ? (
        <OctagonAvatar
          src={avatarPreview}
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

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-xl p-2 bg-white text-black font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => inputRef.current?.click()}
        >
          Change photo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPickFile}
        />
      </div>
    </div>
  );
}