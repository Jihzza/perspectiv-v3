import SectionText from "../ui/SectionText";
import BoxesGrid from "../ui/BoxesGrid";
import StepsList from "../ui/StepsList";
import PhoneIcon from "../../assets/Phone.svg"
import Button from "../ui/Button"

const STEPS = [
  {
    icon: PhoneIcon,
    title: "Discovery Phase",
    description: "We start by learning about your business, your current challenges, and what you want to achieve with AI. No jargon, just a clear conversation.",
  },
  {
    icon: PhoneIcon,
    title: "Build",
    description: "We start by learning about your business, your current challenges, and what you want to achieve with AI. No jargon, just a clear conversation.",
  },
  {
    icon: PhoneIcon,
    title: "Maintenance & Updates",
    description: "We start by learning about your business, your current challenges, and what you want to achieve with AI. No jargon, just a clear conversation.",
  },
];

export default function Software() {

  return (
    <section className="w-full max-w-5xl flex flex-col justify-center items-center mx-auto p-4 space-y-4">
      <SectionText title="Custom Software">
      Not every business fits into off-the-shelf tools. That’s why we design and build custom AI software, tailored to your workflows, customers, and data.
      </SectionText>

      <BoxesGrid
        items={[
          {
            name: "AI Strategy & Roadmap",
            subtitle:
              "A phased, priority-ranked plan tailored to your goals—quick wins first, long-term bets after—with cost/impact estimates.",
          },
          {
            name: "Tool & Platform Guidance",
            subtitle:
              "Neutral recommendations on tools and platforms (build vs buy), integration notes, and vendor pitfalls to avoid.",
          },
          {
            name: "Data Readiness Assessment",
            subtitle:
              "A snapshot of data quality, access, and governance with practical steps to reach 'AI-ready' for your use cases.",
          },
          {
            name: "Use Case Discovery",
            subtitle:
              "We map tasks to automation/assist opportunities and shortlist high-ROI use cases suited to your workflows.",
          },
          {
            name: "Risk, Ethics & Compliance Advisory",
            subtitle:
              "Guardrails for privacy, bias, IP, and regulations—what to log, restrict, and review before deployment.",
          },
          {
            name: "ROI & Impact Analysis",
            subtitle:
              "Expected time/money saved, risk reduced, and revenue lift assumptions—with a validation plan.",
          },
          {
            name: "Pilot & Proof-of-Concept Planning",
            subtitle:
              "A 2–6 week pilot plan: scope, success metrics, dataset needs, and a go/no-go decision checklist.",
          },
        ]}
      />

      {STEPS.map((step) => (
        <StepsList
          key={step.title}
          icon={step.icon}
          title={step.title}
          description={step.description}
        />
      ))}

      <Button>Ask For Quote</Button>
    </section>
  );
}
