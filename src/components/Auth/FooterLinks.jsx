import { Link } from "react-router-dom";

export function LoginFooter() {
  return (
    <div className="mt-6 text-sm flex justify-between">
      <Link className="text-blue-300 hover:text-blue-200 transition-colors" to="/signup">Create account</Link>
      <Link className="text-blue-300 hover:text-blue-200 transition-colors" to="/forgot-password">Forgot password?</Link>
    </div>
  );
}

export function SignUpFooter() {
  return (
    <p className="mt-6 text-sm text-center">
      Have an account? {" "}
      <Link className="text-blue-300 hover:text-blue-200 transition-colors" to="/login">Log in</Link>
    </p>
  );
}