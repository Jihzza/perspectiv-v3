// src/pages/EditProfilePage.jsx
import { useNavigate } from "react-router-dom";
import { useEditProfile } from "../hooks/useEditProfile";
import { useAuthProfile } from "../hooks/useAuthProfile";
import LoadingScreen from "../components/Profile/LoadingScreen";
import AuthWall from "../components/Profile/AuthWall";
import EditHeader from "../components/ProfileEdit/EditHeader";
import AvatarPicker from "../components/ProfileEdit/AvatarPicker";
import ProfileForm from "../components/ProfileEdit/ProfileForm";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuthProfile();
  const {
    fullName,
    setFullName,
    username,
    setUsername,
    avatarPreview,
    onPickFile,
    inputRef,
    saveProfile,
    saving,
    initials,
  } = useEditProfile();

  if (loading) return <LoadingScreen label="Loading…" />;
  if (!user) return <AuthWall loginPath="/login" />;

  async function handleSave(e) {
    e.preventDefault();
    const ok = await saveProfile();
    if (ok) navigate("/profile");
  }

  return (
    <div className="text-white grid place-items-start h-[calc(100dvh-theme(spacing.16)-theme(spacing.16))]">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <EditHeader onCancel={() => navigate(-1)} />

          <AvatarPicker
            avatarPreview={avatarPreview}
            initials={initials}
            inputRef={inputRef}
            onPickFile={onPickFile}
          />

          <div className="my-4 h-px w-full bg-white/10" />

          <ProfileForm
            fullName={fullName}
            setFullName={setFullName}
            username={username}
            setUsername={setUsername}
            onSave={handleSave}
            onBack={() => navigate("/profile")}
            saving={saving}
          />
        </div>
      </div>
    </div>
  );
}