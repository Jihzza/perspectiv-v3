import { useState } from "react";
import { FaBars, FaTimes, FaSignOutAlt, FaSignInAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { supabase } from "../../lib/supabaseClient";

// New: local SVG icons
import NotificationsIcon from "../../assets/Notifications.svg";
import GlobeIcon from "../../assets/Globe.svg";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth(); // <- is someone logged in?
  const isLoggedIn = !!user;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error.message);
      } else {
        setIsMenuOpen(false);
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
    }
  };

  return (
    <>
      {/* Slight blur + translucent background, header otherwise unchanged */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: mobile menu button (unchanged) */}
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="md:hidden text-gray-300 hover:text-white transition-colors duration-200"
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Middle/Right: Desktop Navigation + (new) icons */}
            <div className="hidden md:flex items-center">
              <nav className="flex items-center space-x-8">
                <a
                  href="#home"
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Home
                </a>
                <a
                  href="#services"
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Services
                </a>
                <a
                  href="#chatbot"
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Chatbot
                </a>
                <a
                  href="#contact"
                  className="text-gray-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  Contact
                </a>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium">
                  Get Started
                </button>
              </nav>

              {/* New icons on desktop */}
              <div className="ml-6 flex items-center gap-3">
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-white/10 transition"
                  aria-label="Change language"
                  title="Language"
                >
                  <img src={GlobeIcon} alt="Globe" className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-white/10 transition"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <img src={NotificationsIcon} alt="Notifications" className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Right: show the two icons on mobile header too */}
            <div className="md:hidden z-10 flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Language"
                title="Language"
              >
                <img src={GlobeIcon} alt="Globe" className="w-6 h-6" />
              </button>
              <Link
                to="/notifications"
                className="p-2 rounded-full hover:bg-white/10 transition"
                aria-label="Notifications"
                title="Notifications"
              >
                <img src={NotificationsIcon} alt="Notifications" className="w-6 h-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-60 bg-black/50 backdrop-blur-xs"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-[70%] bg-black/30 backdrop-blur-xl z-60 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-white text-xl font-bold">Menu</h2>
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white transition-colors duration-200"
              aria-label="Close menu"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex flex-col flex-1 p-6">
            <div className="space-y-6">
              <a
                href="#home"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-lg py-3 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="#services"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-lg py-3 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="#chatbot"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-lg py-3 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Chatbot
              </a>
              <a
                href="#contact"
                className="text-gray-300 hover:text-white transition-colors duration-200 font-medium text-lg py-3 block"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </a>
            </div>

            {/* Sidebar Footer */}
            <div className="mt-auto pt-6 border-t border-white/75">
              {isLoggedIn ? (
                <button
                  onClick={handleSignOut}
                  className="bg-red-600/65 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium w-full mb-3 flex items-center justify-center gap-2"
                >
                  <FaSignOutAlt size={16} />
                  Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-lg transition-colors duration-200 font-medium w-full mb-3 flex items-center justify-center gap-2"
                >
                  <FaSignInAlt size={16} />
                  Log in
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
