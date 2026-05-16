import React from 'react'

const variants = {
  primary: 'bg-orange text-white hover:bg-orange/90 border border-orange',
  secondary: 'bg-transparent text-white border border-white hover:bg-white/10',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
  ghost: 'bg-transparent text-white hover:bg-white/10 border border-transparent',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }) {
  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 font-medium rounded-md transition-colors
        ${variants[variant]} ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
