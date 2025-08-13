import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/Perspectiv.svg";
import homeIcon from "../../assets/Home.svg";
import dashboardIcon from "../../assets/Dashboard.svg";
import settingsIcon from "../../assets/Settings.svg";
import profileIcon from "../../assets/Profile Branco.svg";

export default function BottomNavigation() {
  const location = useLocation();

  const items = [
    { path: "/",           icon: homeIcon,      label: "Home" },
    { path: "/dashboard",  icon: dashboardIcon, label: "Dashboard" },
    // Center logo (acts like a nav item, but never shows a label)
    { path: "/",           icon: logo,          label: "Logo", isLogo: true },
    { path: "/settings",   icon: settingsIcon,  label: "Settings" },
    { path: "/profile",    icon: profileIcon,   label: "Profile" }
  ];

  const isActive = (path, isLogo) => {
    if (isLogo) return false; // logo never shows text
    if (path === "/") return location.pathname === "/";
    // treat nested paths as active (e.g., /profile/edit)
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item, idx) => {
          const active = isActive(item.path, item.isLogo);
          return (
            <Link
              key={idx}
              to={item.path}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 text-white"
            >
              <div className="flex flex-col items-center">
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-6 h-6 mb-1"
                />
                {active && <span className="text-xs font-medium">{item.label}</span>}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
