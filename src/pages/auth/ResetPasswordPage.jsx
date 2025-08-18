import AuthCard from "../../components/Auth/AuthCard";
import AuthHeader from "../../components/Auth/AuthHeader";
import PasswordField from "../../components/Auth/PasswordField";
import SubmitButton from "../../components/Auth/SubmitButton";
import { ErrorAlert, SuccessAlert } from "../../components/Auth/Alert";
import { useResetPassword } from "../../hooks/useResetPassword";

export default function ResetPasswordPage() {
  const { password, setPassword, ok, errorMsg, onSubmit } = useResetPassword();

  return (
    <div className="text-white grid place-items-start h-[calc(100dvh-theme(spacing.16)-theme(spacing.16))]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <AuthHeader title="Choose a new password" />
          <AuthCard>
            {ok ? (
              <div className="text-center">
                <SuccessAlert>Password updated successfully!</SuccessAlert>
                <p className="text-gray-300">Redirecting to login page...</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <PasswordField label="New password" value={password} onChange={setPassword} placeholder="Enter your new password" />
                <SubmitButton>Update password</SubmitButton>
              </form>
            )}
            <ErrorAlert>{errorMsg}</ErrorAlert>
          </AuthCard>
        </div>
      </div>
    </div>
  );
}