// src/components/Layout/BottomNavigation.jsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import OctagonAvatar from "./OctagonAvatar";
import logo from "../../assets/Perspectiv.svg";
import homeIcon from "../../assets/Home.svg";
import dashboardIcon from "../../assets/Dashboard.svg";
import settingsIcon from "../../assets/Settings.svg";
import profileIcon from "../../assets/Profile Branco.svg";

// NEW: snapshot + overlay for Genie effect
import { toPng } from "html-to-image"; // generates a PNG from a DOM node. :contentReference[oaicite:1]{index=1}
import GenieEffectOverlay from "../Effects/GenieEffectOverlay"; // ensure this file exists as we built earlier

export default function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // NEW: state for the Genie overlay
  const [genie, setGenie] = useState(null); // { imgSrc, fromRect, toRect }

  // Fetch user and profile data
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data?.user ?? null;
      setUser(u);

      // Fetch profile data if user exists
      if (u?.id) {
        const { data: p } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", u.id)
          .single();
        if (mounted) setProfile(p || null);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      const u = session?.user ?? null;
      setUser(u);

      // Refresh profile when auth changes
      if (u?.id) {
        supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", u.id)
          .single()
          .then(({ data: p }) => setProfile(p || null));
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // Get avatar URL from profile or auth metadata
  const avatarUrl = useMemo(() => {
    if (profile?.avatar_url) return profile.avatar_url;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    const google = (user?.identities || []).find((i) => i.provider === "google");
    const pic = google?.identity_data?.avatar_url || google?.identity_data?.picture;
    return pic || null;
  }, [profile, user]);

  const items = [
    { path: "/", icon: homeIcon, label: "Home" },
    { path: "/dashboard", icon: dashboardIcon, label: "Dashboard" },
    // Center logo (acts like a nav item, but never shows a label)
    { path: "/chat", icon: logo, label: "Logo", isLogo: true },
    { path: "/settings", icon: settingsIcon, label: "Settings" },
    { path: "/profile", icon: profileIcon, label: "Profile", isProfile: true }
  ];

  const isActive = (path, isLogo) => {
    if (isLogo) return false; // logo never shows text
    if (path === "/") return location.pathname === "/";
    // treat nested paths as active (e.g., /profile/edit)
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // NEW: handle logo click to play Genie then navigate to /chat
  async function handleLogoClick(e) {
    e.preventDefault(); // prevent immediate navigation

    try {
      // Source: full viewport. Snapshot body (or a main container if you prefer).
      const sourceNode = document.getElementById('root'); // smaller capture area
      const imgSrc = await Promise.race([
        toJpeg(sourceNode, { pixelRatio: 1, quality: 0.7, cacheBust: false }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('capture-timeout')), 180))
      ]);
      
      const fromRect = {
        left: 0,
        top: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight
      };

      const logoEl = document.getElementById("perspectiv-nav-logo");
      if (!logoEl) {
        // Fallback: if we can’t measure the logo for some reason, just navigate.
        navigate("/chat"); // programmatic nav (React Router). :contentReference[oaicite:3]{index=3}
        return;
      }

      const toRect = logoEl.getBoundingClientRect(); // measure target. :contentReference[oaicite:4]{index=4}

      // Trigger overlay; navigate after the animation completes.
      setGenie({
        imgSrc,
        fromRect,
        toRect
      });
    } catch (err) {
      // On any failure, just navigate normally
      navigate("/chat"); // :contentReference[oaicite:5]{index=5}
    }
  }

  return (
    <>
      {/* Genie overlay (renders over the page, then routes to /chat on completion) */}
      {genie && (
        <GenieEffectOverlay
          imgSrc={genie.imgSrc}
          fromRect={genie.fromRect}
          toRect={genie.toRect}
          duration={800}
          rowPx={4}
          funnelLength={60}
          onDone={() => {
            setGenie(null);
            navigate("/chat"); // go to the dedicated chatbot page after the effect. :contentReference[oaicite:6]{index=6}
          }}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black shadow-lg">
        <div className="flex items-center justify-around h-16 px-2">
          {items.map((item, idx) => {
            const active = isActive(item.path, item.isLogo);

            // For the logo, keep the same structure & classes, but intercept the click
            if (item.isLogo) {
              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={handleLogoClick}
                  aria-current={undefined}
                  className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 text-white"
                >
                  <div className="flex flex-col items-center">
                    <img
                      id="perspectiv-nav-logo" // keep this id for measuring the target during the Genie effect
                      src={item.icon}
                      alt={item.label}
                      className="w-6 h-6 mb-1"
                    />
                    {/* Logo never shows label */}
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={idx}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 text-white"
              >
                <div className="flex flex-col items-center">
                  {item.isProfile && avatarUrl ? (
                    <OctagonAvatar
                      src={avatarUrl}
                      alt="Profile"
                      size={24}
                      ringWidth={1}
                      gap={2}
                      ringColor="#24C8FF"
                      className="mb-1"
                    />
                  ) : (
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-6 h-6 mb-1"
                    />
                  )}
                  {active && <span className="text-xs font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
