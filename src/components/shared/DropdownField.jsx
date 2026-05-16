import React from 'react'

export function DropdownField({ label, value, options = [], onChange, disabled, placeholder = 'Select...' }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-white/60 font-medium">{label}</label>}
      <select
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="bg-coal border border-white/10 text-white text-sm rounded-md px-3 py-2 outline-none focus:border-orange/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
