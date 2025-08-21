import SectionText from "../ui/SectionText";
import CardGrid from "../ui/CardGrid";
import PhoneIcon from "../../assets/Phone.svg";
import Button from "../ui/Button";

const SERVICES = [
  {
    title: "AI Workshop",
    icon: PhoneIcon,
    href: "/services/consultation",
    content: {
      title: "AI Workshop — Overview",
      paragraph:
        "Hands-on session to upskill your team quickly. This is placeholder text for behavior testing.",
      boxLeft: "Curriculum outline",
      boxRight: "Team outcomes"
    },
  },
  {
    title: "Upskilling Program",
    icon: PhoneIcon,
    href: "/services/workshops",
    content: {
      title: "Upskilling Program — Overview",
      paragraph:
        "Multi-week program to build durable AI skills. Placeholder text for testing.",
      boxLeft: "Weekly modules",
      boxRight: "Mentor support"
    },
  },
  {
    title: "AI Partner",
    icon: PhoneIcon,
    href: "/services/implementation",
    content: {
      title: "AI Partner — Overview",
      paragraph:
        "Ongoing partnership for strategy and implementation. Placeholder text for testing.",
      boxLeft: "Roadmap",
      boxRight: "KPIs"
    },
  },
];

export default function Training() {
  return (
    <section className="w-full max-w-5xl flex flex-col justify-center items-center mx-auto p-4 space-y-4">
      <SectionText title="Training & Upskilling Offers">
        We help teams of all sizes adopt and master AI. Choose the level of support that fits your business:
      </SectionText>

      <CardGrid items={SERVICES} />

      <Button>Choose your pace</Button>
    </section>
  );
}
