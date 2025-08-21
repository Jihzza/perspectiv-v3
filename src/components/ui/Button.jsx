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
export default function Button({ children, className = '', ...props }) {
  const { noOuterPadding = false, ...rest } = props;
  const btn = (
    <button
      className={`w-auto text-base leading-[1.45] tracking-[0.01em] px-3 py-2 rounded-lg bg-[#F4C430] text-black font-bold ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
  return noOuterPadding ? btn : <div className="py-4">{btn}</div>;

}