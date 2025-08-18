// src/components/Dashboard/SectionCard.jsx
export default function SectionCard({ children, className = "" }) {
    return (
      <div className={`backdrop-blur-md rounded-xl p-6 ${className}`}>
        {children}
      </div>
    );
  }