import AuthCard from "../../components/Auth/AuthCard";
import AuthHeader from "../../components/Auth/AuthHeader";
import EmailField from "../../components/Auth/EmailField";
import PasswordField from "../../components/Auth/PasswordField";
import SubmitButton from "../../components/Auth/SubmitButton";
import OAuthButtons from "../../components/Auth/OAuthButtons";
import { LoginFooter } from "../../components/Auth/FooterLinks";
import { ErrorAlert } from "../../components/Auth/Alert";
import { useLoginForm } from "../../hooks/useLoginForm";
import { useOAuthLogin } from "../../hooks/useOAuthLogin";

export default function LoginPage() {
  const { email, setEmail, password, setPassword, loading, errorMsg, onSubmit } = useLoginForm();
  const { signInWithGoogle, errorMsg: oauthError } = useOAuthLogin();

  return (
    <div className="text-white grid place-items-start h-[calc(100dvh-theme(spacing.16)-theme(spacing.16))]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <AuthHeader title="Log in to Perspectiv" />
          <AuthCard>
            <form onSubmit={onSubmit} className="space-y-4">
              <EmailField value={email} onChange={setEmail} />
              <PasswordField value={password} onChange={setPassword} />
              <SubmitButton loading={loading}>Log in</SubmitButton>
            </form>

            <hr className="m-4 text-white/75" />

            <OAuthButtons onGoogle={signInWithGoogle} />

            <ErrorAlert>{errorMsg || oauthError}</ErrorAlert>
            <LoginFooter />
          </AuthCard>
        </div>
      </div>
    </div>
  );
}