// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePAge";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import Header from "./components/Layout/Header";
import BottomNavigation from "./components/Layout/BottomNavigation";

export default function App() {
  return (
    <BrowserRouter>
      {/* Put persistent UI here: header, sidebar, bottom nav, etc. */}
      <Header />
      <div className="pb-16"> {/* Add bottom padding to account for fixed bottom nav */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* Optional 404 route */}
          <Route path="*" element={<h1 className="p-6 text-center">Page Not Found</h1>} />
        </Routes>
      </div>
      <BottomNavigation />
    </BrowserRouter>
  );
}
