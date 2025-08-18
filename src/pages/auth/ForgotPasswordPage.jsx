import AuthCard from "../../components/Auth/AuthCard";
import AuthHeader from "../../components/Auth/AuthHeader";
import EmailField from "../../components/Auth/EmailField";
import SubmitButton from "../../components/Auth/SubmitButton";
import { ErrorAlert, SuccessAlert } from "../../components/Auth/Alert";
import { useForgotPassword } from "../../hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const { email, setEmail, sent, errorMsg, onSubmit } = useForgotPassword();

  return (
    <div className="text-white grid place-items-start h-[calc(100dvh-theme(spacing.16)-theme(spacing.16))]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <AuthHeader title="Reset your password" />
          <AuthCard>
            {sent ? (
              <div className="text-center">
                <SuccessAlert>Reset link sent successfully!</SuccessAlert>
                <p className="text-gray-300">
                  We sent a reset link to <span className="font-semibold text-white">{email}</span>. Check your inbox and follow the instructions.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <EmailField value={email} onChange={setEmail} />
                <SubmitButton>Send reset link</SubmitButton>
              </form>
            )}
            <ErrorAlert>{errorMsg}</ErrorAlert>
          </AuthCard>
        </div>
      </div>
    </div>
  );
}