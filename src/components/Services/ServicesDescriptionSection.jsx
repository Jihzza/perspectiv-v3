import ServiceDescriptionCard from "./ServiceDescriptionCard";

//  ➜ Your variables live here
const services = [
  {
    title: "Software",
    paragraph:
      "Conversational interface that delivers instant answers and learns from every interaction.",
  },
  {
    title: "Consultation",
    paragraph:
      "Track user behaviour and KPIs in one dashboard with second-by-second refresh rates.",
  },
  {
    title: "Training",
    paragraph:
      "Seamlessly connect CRM, payment gateways, and internal tools via our open REST API.",
  },
];

export default function ServicesDescriptionSection() {
  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="grid gap-8 sm:grid-cols-3">
        {services.map(({ title, paragraph }) => (
          <ServiceDescriptionCard
            key={title}
            title={title}
            paragraph={paragraph}
          />
        ))}
      </div>
    </section>
  );
}
