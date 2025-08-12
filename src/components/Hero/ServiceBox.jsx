// src/components/ServiceBox.jsx
export default function ServiceBox({ icon, label, className = "" }) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-3 border-2 border-[#33ccff] rounded-2xl shadow-lg ${className}`}
      >
        <div className="text-primary mb-2 text-[#33ccff]">{icon}</div>
        <span className="text-sm font-semibold tracking-wide text-white">{label}</span>
      </div>
    );
  }
  