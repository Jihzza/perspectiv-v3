// src/components/Layout/BottomNavigation.jsx
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import OctagonAvatar from "./OctagonAvatar";
import logo from "../../assets/Perspectiv.svg";
import homeIcon from "../../assets/Home.svg";
import dashboardIcon from "../../assets/Dashboard.svg";
import settingsIcon from "../../assets/Settings.svg";
import profileIcon from "../../assets/Profile Branco.svg";

export default function BottomNavigation() {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selected, setSelected] = useState(null);

  // Fetch user + profile (unchanged)
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      const u = data?.user ?? null;
      setUser(u);

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

  // Avatar resolution (unchanged)
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
    { path: "/chat", icon: logo, label: "Chat", isLogo: true }, // center logo -> Chat
    { path: "/settings", icon: settingsIcon, label: "Settings" },
    { path: "/profile", icon: profileIcon, label: "Profile", isProfile: true },
  ];

  // Active (for ARIA/styling), logo intentionally not treated as "active"
  const isActive = (path, isLogo) => {
    if (isLogo) return false;
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  // Keep one label visible even if redirects change the URL.
  // Also select the item that matches the current URL (including /chat for the logo).
  useEffect(() => {
    const pathMatches = (p) =>
      location.pathname === p || location.pathname.startsWith(p + "/");
    const activeItem = items.find((it) => pathMatches(it.path));
    if (activeItem) setSelected(activeItem.path);
  }, [location.pathname]); // intentionally not depending on items

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item, idx) => {
          const active = isActive(item.path, item.isLogo);
          const isSelected = selected === item.path;

          if (item.isLogo) {
            return (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setSelected(item.path)} // remember selection
                viewTransition
                aria-current={undefined} // keep logo non-ARIA-active
                className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 text-white"
              >
                <div className="flex flex-col items-center">
                  <img
                    id="perspectiv-nav-logo"
                    src={item.icon}
                    alt={item.label}
                    className="w-6 h-6 mb-1"
                  />
                  {isSelected && (
                    <span className="text-xs font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          }

          return (
            <Link
              key={idx}
              to={item.path}
              onClick={() => setSelected(item.path)}
              viewTransition
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
                  <img src={item.icon} alt={item.label} className="w-6 h-6 mb-1" />
                )}
                {isSelected && (
                  <span className="text-xs font-medium">{item.label}</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
