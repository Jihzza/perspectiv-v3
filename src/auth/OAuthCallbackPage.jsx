// src/pages/auth/OAuthCallbackPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Finishing sign-in…");

  // where to go after finishing: /dashboard by default
  const next = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        // 1) PKCE path: provider redirected with ?code=...
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!isMounted) return;
          // done – go to next
          navigate(next, { replace: true });
          return;
        }

        // 2) Implicit path: provider redirected with #access_token=...&refresh_token=...
        //    Parse the hash and set the session manually, then clean the URL.
        if (window.location.hash.includes("access_token")) {
          const hash = new URLSearchParams(window.location.hash.slice(1));
          const access_token = hash.get("access_token");
          const refresh_token = hash.get("refresh_token");

          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({ access_token, refresh_token });
            if (error) throw error;
          }

          // drop the fragment so tokens aren't visible
          window.history.replaceState({}, "", window.location.pathname + window.location.search);

          if (!isMounted) return;
          navigate(next, { replace: true });
          return;
        }

        // 3) Nothing in URL? If we already have a session, just go.
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          navigate(next, { replace: true });
          return;
        }

        setStatus("No auth information found. Try signing in again.");
      } catch (e) {
        console.error(e);
        setStatus("Could not complete sign-in. Please try again.");
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [navigate, next, searchParams]);

  return (
    <div className="p-6 text-center text-white">
      <p>{status}</p>
    </div>
  );
}
