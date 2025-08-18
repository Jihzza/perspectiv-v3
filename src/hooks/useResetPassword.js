import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export function useResetPassword() {
  const [password, setPassword] = useState("");
  const [ok, setOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e?.preventDefault?.();
    setErrorMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setErrorMsg(error.message);
    else {
      setOk(true);
      setTimeout(() => navigate("/login"), 1200);
    }
  }

  return { password, setPassword, ok, errorMsg, onSubmit };
}