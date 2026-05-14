import React from 'react'
import { Search, X } from 'lucide-react'
import { OWNERS, SPECIALTIES, TACTIC_CATEGORIES } from '../data/tacticCategories'

const MONTHS = [
  { value: '1', label: 'January' }, { value: '2', label: 'February' }, { value: '3', label: 'March' },
  { value: '4', label: 'April' }, { value: '5', label: 'May' }, { value: '6', label: 'June' },
  { value: '7', label: 'July' }, { value: '8', label: 'August' }, { value: '9', label: 'September' },
  { value: '10', label: 'October' }, { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

export default function FilterBar({ filters, setFilters, onNewCampaign }) {
  const hasFilters = filters.search || filters.owner || filters.specialty || filters.tactic || filters.month

  const update = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const clear = () => setFilters({ search: '', owner: '', specialty: '', tactic: '', month: '', sort: 'launchDate' })

  return (
    <div className="bg-white border-b border-[#DFE1E6] px-4 py-2 flex flex-wrap gap-2 items-center">
      <div className="relative flex-1 min-w-[160px] max-w-[240px]">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5E6C84]" />
        <input
          type="text"
          placeholder="Search campaigns..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-sm border border-[#DFE1E6] rounded-md focus:outline-none focus:border-[#4C9AFF] text-[#172B4D]"
        />
      </div>

      <Select value={filters.owner} onChange={v => update('owner', v)} label="Owner" options={OWNERS} />
      <Select value={filters.specialty} onChange={v => update('specialty', v)} label="Specialty" options={SPECIALTIES} />
      <Select value={filters.tactic} onChange={v => update('tactic', v)} label="Tactic" options={TACTIC_CATEGORIES} />
      <Select value={filters.month} onChange={v => update('month', v)} label="Month" options={MONTHS.map(m => m.label)} optionValues={MONTHS.map(m => m.value)} />

      <select
        value={filters.sort}
        onChange={e => update('sort', e.target.value)}
        className="py-1.5 px-2 text-sm border border-[#DFE1E6] rounded-md focus:outline-none text-[#5E6C84]"
      >
        <option value="launchDate">Sort: Launch Date</option>
        <option value="budget">Sort: Budget</option>
        <option value="owner">Sort: Owner</option>
      </select>

      {hasFilters && (
        <button onClick={clear} className="flex items-center gap-1 text-sm text-[#5E6C84] hover:text-[#172B4D] px-2 py-1.5">
          <X size={13} /> Clear
        </button>
      )}
    </div>
  )
}

function Select({ value, onChange, label, options, optionValues }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="py-1.5 px-2 text-sm border border-[#DFE1E6] rounded-md focus:outline-none text-[#5E6C84]"
    >
      <option value="">{label}: All</option>
      {options.map((opt, i) => (
        <option key={opt} value={optionValues ? optionValues[i] : opt}>{opt}</option>
      ))}
    </select>
  )
}
