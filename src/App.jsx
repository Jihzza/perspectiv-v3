// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import NotificationsPage from "./pages/NotificationsPage";
import Header from './components/Layout/Header'
import BottomNavigation from './components/Layout/BottomNavigation'
import ChatHistoryPage from './pages/ChatHistoryPage'
import ChatConversationPage from './pages/ChatConversationPage'
import ChatLayoutPage from './pages/ChatLayoutPage'
import ScrollToTopButton from './components/ui/ScrollToTopButton'

import AuthProvider from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        {/* Offset all content by the fixed header (h-16 => 4rem) and leave room for bottom nav (h-16) */}
        <main className="py-16 min-h-[calc(100vh-4rem-4rem)] bg-gradient-to-b from-[#1B2537] to-black">
          <Routes>
            {/* public pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/settings" element={<SettingsPage />} /> {/* <- now PUBLIC */}

            {/* public auth pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />

            {/* protected area */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile/chat-history" element={<ChatHistoryPage />} />
              <Route path="/profile/chat-history/:sessionId" element={<ChatConversationPage />} />
              <Route path="/chat" element={<ChatLayoutPage />} /> {/* <- now PROTECTED */}
            </Route>

            <Route path="*" element={<h1 className="p-6 text-center">Page Not Found</h1>} />
          </Routes>
        </main>
        <ScrollToTopButton />
        <BottomNavigation />
      </AuthProvider>
    </BrowserRouter>
  )
}
