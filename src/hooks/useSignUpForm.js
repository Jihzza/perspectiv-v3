import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function useSignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e?.preventDefault?.();
    setLoading(true); setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) return setMessage(error.message);
    if (!data.session) setMessage("Check your email to confirm your account.");
    else navigate("/dashboard");
  }

  return { email, setEmail, password, setPassword, message, loading, onSubmit };
}