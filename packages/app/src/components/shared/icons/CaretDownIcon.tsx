import React from 'react'

interface CaretDownIconProps {
  className?: string
  color?: string
}

export const CaretDownIcon: React.FC<CaretDownIconProps> = ({ className, color = 'white' }) => (
  <svg
    width="18"
    height="10"
    viewBox="0 0 18 10"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M1 1L9 9L17 1"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
