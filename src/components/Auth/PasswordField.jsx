import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  label = "Password",
  value,
  onChange,
  placeholder = "Enter your password",
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <input
          className="w-full bg-black/10 border border-[#24C8FF] rounded-lg px-2 py-1"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md"
          aria-label={show ? "Hide password" : "Show password"}
          title={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
