import React from 'react'

export function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg className="animate-spin text-orange" width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-coal flex items-center justify-center">
      <LoadingSpinner size={40} />
    </div>
  )
}
