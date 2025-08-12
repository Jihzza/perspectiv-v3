import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <button
                onClick={toggleMenu}
                className="md:hidden text-gray-300 hover:text-white transition-colors duration-200"
              >
                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
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
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed top-0 left-0 h-full w-[70%] bg-black z-60 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-white text-xl font-bold">Menu</h2>
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white transition-colors duration-200"
            >
              <FaTimes size={24} />
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
            <div className="mt-auto pt-6 border-t border-gray-700">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 font-medium w-full">
                Get Started
              </button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
