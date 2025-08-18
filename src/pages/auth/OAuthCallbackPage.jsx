import { useOAuthCallback } from "../../hooks/useOAuthCallback";

export default function OAuthCallbackPage() {
  useOAuthCallback();
  return <p className="p-6 text-white">Signing you in…</p>;
}