export default function OAuthButtons({ onGoogle }) {
    return (
      <div>
        <button
          onClick={onGoogle}
          className="w-full bg-white/10 border border-white/25 text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
        >
          Continue with Google
        </button>
      </div>
    );
  }