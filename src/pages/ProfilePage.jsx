// src/pages/ProfilePage.jsx
import { useAuthProfile } from "../hooks/useAuthProfile";
import HeaderCard from "../components/Profile/HeaderCard";
import ChatbotCard from "../components/Profile/ChatbotCard";
import OverviewCard from "../components/Profile/OverviewCard";
import LoadingScreen from "../components/Profile/LoadingScreen";
import AuthWall from "../components/Profile/AuthWall";

export default function ProfilePage() {
  const { user, loading, displayName, username, avatarUrl, initials } = useAuthProfile();

  if (loading) return <LoadingScreen />;
  if (!user) return <AuthWall />;

  return (
    <div className="text-white grid place-items-start h-[calc(100dvh-theme(spacing.16)-theme(spacing.16))]">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <HeaderCard
          displayName={displayName}
          username={username}
          avatarUrl={avatarUrl}
          initials={initials}
          createdAt={user?.created_at}
        />

        <ChatbotCard />

        <OverviewCard />
      </div>
    </div>
  );
}