export default function SubmitButton({ loading, children }) {
    return (
      <button
        disabled={loading}
        className="w-full bg-[#33ccff]/20 text-white px-4 py-2 rounded-xl shadow-lg font-medium hover:bg-gray-100 transition-colors border border-[#33ccff] disabled:opacity-60"
      >
        {loading ? "Please wait…" : children}
      </button>
    );
  }