import React from 'react'

interface YearnLoaderProps {
  loadingState?: string // Accept loading state as a prop
}

const YearnLoader: React.FC<YearnLoaderProps> = ({ loadingState }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Spinning border circles around the logo */}
        <div className="absolute inset-0 w-16 h-16 border-2 border-t-transparent border-white rounded-full animate-spin" />
        <img
          src="/images/logo-inverted.svg"
          alt="Yearn Finance Logo"
          width={50}
          height={50}
          className="z-10 mx-auto"
        />
      </div>
      {loadingState && (
        <div className="mt-4 text-white font-medium text-center">{loadingState}</div>
      )}
    </div>
  )
}

export default YearnLoader
