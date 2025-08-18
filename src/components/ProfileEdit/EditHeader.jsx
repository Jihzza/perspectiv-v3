// src/components/ProfileEdit/EditHeader.jsx
export default function EditHeader({ onCancel }) {
    return (
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Edit profile</h1>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 border border-white/20 hover:border-white/40 transition-all duration-200 bg-white/10 hover:bg-white/20 hover:shadow-lg hover:shadow-white/10"
        >
          Cancel
        </button>
      </div>
    );
  }