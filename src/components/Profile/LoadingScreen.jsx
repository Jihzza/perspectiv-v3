// src/components/Profile/LoadingScreen.jsx
export default function LoadingScreen({ label = "Loading profile…" }) {
    return (
      <div className="h-screen grid place-items-center text-white/80">{label}</div>
    );
  }