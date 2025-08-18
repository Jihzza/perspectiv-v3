import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  async function onSubmit(e) {
    e?.preventDefault?.();
    setLoading(true); setErrorMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErrorMsg(error.message);
    navigate(from, { replace: true });
  }

  return { email, setEmail, password, setPassword, loading, errorMsg, onSubmit };
}