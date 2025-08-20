import { FaRocket, FaComments, FaChartLine } from "react-icons/fa";
import ServiceBox from "./ServiceBox"
import PerspectivLogo from "../../assets/PerspectivLogo.svg"

const services = [
  { icon: <FaRocket size={16} />, label: "Software" },
  { icon: <FaComments size={16} />, label: "Consultation" },
  { icon: <FaChartLine size={16} />, label: "Training" },
]

export default function HeroSection() {
  return (
    <section className="w-full h-auto pb-12">
      <div className="container mx-auto px-4 flex flex-col items-center">
        {/* Logo */}
        <img src={PerspectivLogo} alt="Perspectiv Logo" className="w-45 h-45"/>

        <p className="text-white pb-8 font-light">We Help you integrate AI into your business</p>
        {/* Service boxes */}
        <div className="flex justify-center items-center gap-2 w-full">
          {services.map(({ icon, label }) => (
            <ServiceBox key={label} icon={icon} label={label} />
          ))}
        </div>
      </div>
    </section>
  );
}
