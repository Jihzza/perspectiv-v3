import AuthCard from "../../components/Auth/AuthCard";
import AuthHeader from "../../components/Auth/AuthHeader";
import EmailField from "../../components/Auth/EmailField";
import PasswordField from "../../components/Auth/PasswordField";
import SubmitButton from "../../components/Auth/SubmitButton";
import { SignUpFooter } from "../../components/Auth/FooterLinks";
import { InfoAlert } from "../../components/Auth/Alert";
import { useSignUpForm } from "../../hooks/useSignUpForm";

export default function SignUpPage() {
  const { email, setEmail, password, setPassword, message, loading, onSubmit } = useSignUpForm();

  return (
    <div className="text-white grid place-items-start h-[calc(100dvh-theme(spacing.16)-theme(spacing.16))]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <AuthHeader title="Create your account" />
          <AuthCard>
            <form onSubmit={onSubmit} className="space-y-4">
              <EmailField value={email} onChange={setEmail} />
              <PasswordField label="Password" value={password} onChange={setPassword} placeholder="Choose a password" />
              <SubmitButton loading={loading}>Sign up</SubmitButton>
            </form>
            <InfoAlert>{message}</InfoAlert>
            <SignUpFooter />
          </AuthCard>
        </div>
      </div>
    </div>
  );
}