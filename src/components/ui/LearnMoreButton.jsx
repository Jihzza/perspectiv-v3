// src/components/common/CtaButton.jsx

import { div } from 'motion/react-client';
import React from 'react';

/**
 * A reusable Call-to-Action (CTA) button with a distinct style.
 * This is designed for primary actions, like booking or requesting information.
 *
 * @param {React.ReactNode} children - The text or elements to display inside the button.
 * @param {string} [className=''] - Optional additional CSS classes to apply.
 * @param {object} props - Any other props to pass to the button element (e.g., onClick).
 */
export default function LearnMore({ children, className = '', ...props }) {
  return (
    <div>
      <button
        className={`w-auto text-xs leading-[1.45] tracking-[0.015em] py-2 rounded-lg text-[#F4C430] font-bold ${className}`}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}