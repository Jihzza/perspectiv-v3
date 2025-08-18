import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useOAuthLogin() {
  const [errorMsg, setErrorMsg] = useState(null);

  async function signInWithGoogle() {
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setErrorMsg(error.message);
    // browser will redirect automatically on success
  }

  return { signInWithGoogle, errorMsg };
}