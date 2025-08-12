import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/Perspectiv.svg";
import homeIcon from "../../assets/Home.svg";
import dashboardIcon from "../../assets/Dashboard.svg";
import settingsIcon from "../../assets/Settings.svg";
import profileIcon from "../../assets/Profile Branco.svg";

export default function BottomNavigation() {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      icon: homeIcon,
      label: "Home",
      isActive: location.pathname === "/"
    },
    {
      path: "/dashboard",
      icon: dashboardIcon,
      label: "Dashboard",
      isActive: location.pathname === "/dashboard"
    },
    {
      path: "/",
      icon: logo, // This will be the logo
      label: "Logo",
      isActive: false,
      isLogo: true
    },
    {
      path: "/settings",
      icon: settingsIcon,
      label: "Settings",
      isActive: location.pathname === "/settings"
    },
    {
      path: "/profile",
      icon: profileIcon,
      label: "Profile",
      isActive: location.pathname === "/profile"
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => {
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                item.isActive
                  ? "text-white"
                  : "text-white"
              }`}
            >
              {item.isLogo ? (
                <div className="flex flex-col items-center">
                  <img 
                    src={logo} 
                    alt="Perspectiv" 
                    className="w-6 h-6 mb-1"
                  />
                  <span className="text-xs font-medium">Logo</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <img 
                    src={item.icon} 
                    alt={item.label} 
                    className={`w-6 h-6 mb-1 ${
                      item.isActive ? "text-white" : "text-white"
                    }`}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
