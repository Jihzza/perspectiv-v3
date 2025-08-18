import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  async function onSubmit(e) {
    e?.preventDefault?.();
    setErrorMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setErrorMsg(error.message);
    else setSent(true);
  }

  return { email, setEmail, sent, errorMsg, onSubmit };
}