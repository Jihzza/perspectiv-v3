// src/components/ProfileEdit/ProfileForm.jsx
export default function ProfileForm({
    fullName,
    setFullName,
    username,
    setUsername,
    onSave,
    onBack,
    saving,
  }) {
    return (
      <form onSubmit={onSave} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-white/90">Full Name</label>
          <input
            className="w-full bg-black/10 border border-[#24C8FF] rounded-lg px-2 py-1"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            type="text"
          />
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium mb-2 text-white/90">Username</label>
          <div className="relative">
            <input
              className="w-full bg-black/10 border border-[#24C8FF] rounded-lg px-7 py-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              pattern="[a-z0-9_.\-]{3,32}"
              title="3–32 chars: lowercase letters, numbers, underscore, dot, or hyphen"
              type="text"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-lg">@</span>
          </div>
          <p className="mt-2 text-xs text-white/60">
            Only lowercase letters, numbers, underscore, dot, or hyphen. 3–32 characters.
          </p>
        </div>
  
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl px-4 py-2 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
          >
            Go Back
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl px-4 py-2 bg-white text-black font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    );
  }