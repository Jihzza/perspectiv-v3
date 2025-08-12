export default function ServiceDescriptionCard({ title, paragraph }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold text-center text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-center text-white">{paragraph}</p>
    </div>
  );
}
