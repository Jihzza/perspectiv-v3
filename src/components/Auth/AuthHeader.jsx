export default function AuthHeader({ title, subtitle }) {
    return (
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-gray-300">{subtitle}</p>}
      </div>
    );
  }