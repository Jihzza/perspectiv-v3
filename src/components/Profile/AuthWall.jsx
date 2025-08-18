// src/components/Profile/AuthWall.jsx
import { Link } from "react-router-dom";

export default function AuthWall({ loginPath = "/login" }) {
  return (
    <div className="h-screen grid place-items-center text-white">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
        <p className="mb-4">You’re not signed in.</p>
        <Link to={loginPath} className="inline-block bg-white text-black px-4 py-2 rounded-lg">Log in</Link>
      </div>
    </div>
  );
}