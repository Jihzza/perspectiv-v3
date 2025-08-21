// src/components/consultations/ConsultationDetailBlock.jsx

import React from 'react'

/**
 * A simple, reusable component for displaying consultation details.
 * @param {string} icon - The icon to display.
 * @param {string} title - The title of the detail.
 * @param {string} description - The description of the detail.
 */
export default function StepsList({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 py-4">
      <div className="flex-shrink-0 rounded-xl p-4 bg-gradient-to-b from-white/10 to-white/5 border-1 border-white/15 text-white">
        <img src={icon} alt={`${title} icon`} className="w-8 h-8" />
      </div>
      <div className="flex flex-col items-center text-center space-y-2">
        {/* Heading: LH ~1.25 (1.1–1.3 range) + 1.5% letter-spacing */}
        <h4 className="font-bold text-white text-lg md:text-2xl leading-tight tracking-[0.015em]">{title}</h4>
        {/* Body: LH ~1.45 (1.3–1.5 range) for readability at small sizes */}
        <p className="text-white text-sm leading-[1.45]">{description}</p>
      </div>
    </div>
  );
}
