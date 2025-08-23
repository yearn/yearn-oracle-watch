import React from 'react'

interface YearnLoaderProps {
  loadingState?: string // Optional helper text under the spinner
  fixed?: boolean // When true, render as fixed overlay; when false, render inline/flow
  className?: string // Optional className to customize container styling
  color?: 'white' | 'blue' // Spinner/text color theme
}

const YearnLoader: React.FC<YearnLoaderProps> = ({
  loadingState,
  fixed = true,
  className,
  color = 'white',
}) => {
  const containerClass =
    `${fixed ? 'fixed inset-0' : ''} flex flex-col items-center justify-center ${className || ''}`.trim()
  const spinnerBorderClass =
    color === 'blue' ? 'border-[#1A51B2]' : 'border-white'
  const textColorClass = color === 'blue' ? 'text-[#1A51B2]' : 'text-white'
  return (
    <div className={containerClass}>
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Spinning border circles around the logo */}
        <div
          className={`absolute inset-0 w-16 h-16 border-2 border-t-transparent ${spinnerBorderClass} rounded-full animate-spin`}
        />
        <img
          src="/images/logo-inverted.svg"
          alt="Yearn Finance Logo"
          width={50}
          height={50}
          className="z-10 mx-auto"
        />
      </div>
      {loadingState && (
        <div className={`mt-4 ${textColorClass} font-medium text-center`}>
          {loadingState}
        </div>
      )}
    </div>
  )
}

export default YearnLoader
