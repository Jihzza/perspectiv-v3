export default function ServiceDescriptionCard({ title, paragraph }) {
  return (
    <div className="group rounded-xl p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-center text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm sm:text-base leading-relaxed text-center text-gray-300">
        {paragraph}
      </p>
    </div>
  );
}
