import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Download, ArrowUpDown, ExternalLink, Link2 } from 'lucide-react'
import { TACTIC_COLORS, OWNERS, TACTIC_CATEGORIES } from '../data/tacticCategories'

const STATUS_COLORS = {
  backlog: { bg: '#F4F5F7', text: '#5E6C84' },
  'in-production': { bg: '#DEEBFF', text: '#0747A6' },
  scheduled: { bg: '#EAE6FF', text: '#403294' },
  'live-active': { bg: '#E3FCEF', text: '#006644' },
  'pending-review': { bg: '#FFFAE6', text: '#172B4D' },
  complete: { bg: '#E3FCEF', text: '#006644' },
}
const STATUS_OPTIONS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'in-production', label: 'In Production' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'live-active', label: 'Live / Active' },
  { value: 'pending-review', label: 'Pending Review' },
  { value: 'complete', label: 'Complete' },
]
const REVIEW_STATUS_OPTIONS = ['Draft', 'Pending Review', 'Approved', 'Live', 'Completed']
const PLATFORM_OPTIONS = ['Facebook', 'LinkedIn', 'Google Ads', 'YouTube', 'Email / SMS', 'Instagram', 'TikTok', 'Other']
const GOING_OPTIONS = ['Yes', 'No', 'TBD']
const TIER_OPTIONS = ['Connector', 'Advocate', 'Ambassador']

function fmtMoney(n) {
  const num = Number(n)
  if (n === '' || n === null || n === undefined || isNaN(num)) return '—'
  return `$${num.toLocaleString()}`
}
function fmtNum(n) {
  if (n === '' || n === null || n === undefined) return '—'
  const num = Number(n)
  return isNaN(num) ? '—' : num.toLocaleString()
}
function fmtPct(n) {
  if (n === '' || n === null || n === undefined) return '—'
  const num = Number(n)
  return isNaN(num) ? '—' : num.toFixed(2) + '%'
}
function fmtDate(d) {
  if (!d) return '—'
  try {
    const parts = d.split('-')
    const dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

// ── Inline edit components ─────────────────────────────────────────────────

function NumberCell({ value, onSave, fmt = fmtMoney, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const start = (e) => { e.stopPropagation(); setDraft(value ?? ''); setEditing(true) }
  useEffect(() => { if (editing && inputRef.current) inputRef.current.select() }, [editing])
  const commit = () => {
    setEditing(false)
    const num = draft === '' ? '' : Number(draft)
    onSave(isNaN(num) ? draft : num)
  }
  if (editing) return (
    <input ref={inputRef} type="number" value={draft}
      onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
      onClick={e => e.stopPropagation()}
      className={`w-full font-mono text-sm border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50 ${className}`}
      style={{ minWidth: 70 }} />
  )
  return <span onClick={start} title="Click to edit"
    className={`cursor-text hover:bg-blue-50 hover:text-[#0747A6] rounded px-1 py-0.5 transition-colors font-mono text-sm select-none ${className}`}>
    {fmt(value)}
  </span>
}

function TextCell({ value, onSave, className = '', placeholder = '—' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const start = (e) => { e.stopPropagation(); setDraft(value || ''); setEditing(true) }
  useEffect(() => { if (editing && inputRef.current) inputRef.current.select() }, [editing])
  const commit = () => { setEditing(false); onSave(draft) }
  if (editing) return (
    <input ref={inputRef} type="text" value={draft}
      onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
      onClick={e => e.stopPropagation()}
      className={`w-full text-sm border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50 ${className}`}
      style={{ minWidth: 100 }} />
  )
  return <span onClick={start} title="Click to edit"
    className={`cursor-text hover:bg-blue-50 hover:text-[#0747A6] rounded px-1 py-0.5 transition-colors text-sm select-none ${className}`}>
    {value || <span className="text-[#B3BAC5] italic text-xs">{placeholder}</span>}
  </span>
}

function LinkCell({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef(null)
  const start = (e) => { e.stopPropagation(); setDraft(value || ''); setEditing(true) }
  useEffect(() => { if (editing && inputRef.current) inputRef.current.select() }, [editing])
  const commit = () => { setEditing(false); onSave(draft) }
  if (editing) return (
    <input ref={inputRef} type="url" value={draft}
      onChange={e => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false) }}
      onClick={e => e.stopPropagation()}
      className="w-full text-sm border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50"
      style={{ minWidth: 120 }} placeholder="https://..." />
  )
  if (value) return (
    <div className="flex items-center gap-1">
      <a href={value} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
        className="text-blue-600 hover:underline flex items-center gap-0.5 text-xs">
        <Link2 size={11} />Link
      </a>
      <button onClick={start} title="Edit URL" className="text-[#B3BAC5] hover:text-[#5E6C84] text-xs">✎</button>
    </div>
  )
  return <span onClick={start} title="Click to add link"
    className="cursor-text text-[#B3BAC5] hover:text-[#0747A6] hover:bg-blue-50 rounded px-1 py-0.5 transition-colors text-xs italic select-none">
    + link
  </span>
}

function DateCell({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef(null)
  const start = (e) => { e.stopPropagation(); setEditing(true) }
  useEffect(() => { if (editing && inputRef.current) inputRef.current.showPicker?.() }, [editing])
  const commit = (e) => { setEditing(false); onSave(e.target.value) }
  if (editing) return (
    <input ref={inputRef} type="date" defaultValue={value || ''}
      onBlur={commit} onChange={commit}
      onKeyDown={e => { if (e.key === 'Escape') setEditing(false) }}
      onClick={e => e.stopPropagation()}
      className="text-xs font-mono border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50" />
  )
  return <span onClick={start} title="Click to edit"
    className="cursor-text hover:bg-blue-50 hover:text-[#0747A6] rounded px-1 py-0.5 transition-colors font-mono text-xs select-none">
    {fmtDate(value)}
  </span>
}

function SelectCell({ value, options, onSave, renderValue }) {
  const [editing, setEditing] = useState(false)
  const selectRef = useRef(null)
  const start = (e) => { e.stopPropagation(); setEditing(true) }
  useEffect(() => { if (editing && selectRef.current) selectRef.current.focus() }, [editing])
  const commit = (e) => { setEditing(false); onSave(e.target.value) }
  if (editing) return (
    <select ref={selectRef} defaultValue={value || ''}
      onBlur={commit} onChange={commit}
      onKeyDown={e => { if (e.key === 'Escape') setEditing(false) }}
      onClick={e => e.stopPropagation()}
      className="text-sm border border-[#4C9AFF] rounded px-1.5 py-0.5 outline-none bg-blue-50">
      <option value="">—</option>
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  )
  return <span onClick={start} title="Click to edit"
    className="cursor-text hover:bg-blue-50 hover:text-[#0747A6] rounded px-1 py-0.5 transition-colors text-sm select-none">
    {renderValue ? renderValue(value) : (value || <span className="text-[#B3BAC5] italic text-xs">—</span>)}
  </span>
}

// ── Column definitions ─────────────────────────────────────────────────────

const COL_GROUPS = [
  {
    group: { label: 'Core', color: '#1A1A2E' },
    cols: [
      { key: '_open', label: '', width: 32 },
      { key: 'name', label: 'Campaign', sortable: true, width: 200 },
      { key: 'campaignType', label: 'Type', width: 110 },
      { key: 'tactic', label: 'Tactic', sortable: true, width: 160 },
      { key: 'owner', label: 'Owner', sortable: true, width: 120 },
      { key: 'launchDate', label: 'Launch Date', sortable: true, width: 110 },
      { key: 'status', label: 'Status', sortable: true, width: 130 },
    ],
  },
  {
    group: { label: 'Budget & ROI', color: '#0747A6' },
    cols: [
      { key: 'budget', label: 'Monthly $', sortable: true, width: 100 },
      { key: 'annualBudget', label: 'Annual $', sortable: true, width: 100 },
      { key: 'spendToDate', label: 'Spent', sortable: true, width: 90 },
      { key: 'revenueEarned', label: 'Revenue', sortable: true, width: 100 },
      { key: '_roi', label: 'ROI', width: 70 },
    ],
  },
  {
    group: { label: 'Tracking', color: '#403294' },
    cols: [
      { key: 'campaignCode', label: 'Campaign Code', width: 140 },
      { key: 'platform', label: 'Platform', width: 120 },
      { key: 'reviewer', label: 'Reviewer', width: 110 },
      { key: 'reviewStatus', label: 'Review Status', width: 130 },
      { key: 'goLiveDate', label: 'Go-Live Date', width: 110 },
      { key: 'endDate', label: 'End Date', width: 110 },
    ],
  },
  {
    group: { label: 'Performance', color: '#006644' },
    cols: [
      { key: 'leadsGenerated', label: 'Leads', sortable: true, width: 80 },
      { key: 'appointmentsSet', label: 'Appts Set', sortable: true, width: 90 },
      { key: 'sales', label: 'Sales', sortable: true, width: 80 },
      { key: 'impressions', label: 'Impressions', sortable: true, width: 110 },
      { key: 'cpc', label: 'CPC ($)', sortable: true, width: 80 },
      { key: 'ctr', label: 'CTR (%)', sortable: true, width: 80 },
      { key: 'conversionRate', label: 'Conv. Rate %', width: 110 },
      { key: 'clicks', label: 'Clicks', width: 80 },
    ],
  },
  {
    group: { label: 'Event Details', color: '#BF2600' },
    cols: [
      { key: 'location', label: 'Location', width: 140 },
      { key: 'boothNumber', label: 'Booth #', width: 80 },
      { key: 'going', label: 'Going', width: 80 },
      { key: 'estimatedParticipants', label: 'Est. Participants', width: 140 },
      { key: 'travelDate', label: 'Travel Date', width: 110 },
      { key: 'contactName', label: 'Contact Name', width: 140 },
      { key: 'contactPhone', label: 'Contact Phone', width: 130 },
      { key: 'contactEmail', label: 'Contact Email', width: 160 },
    ],
  },
  {
    group: { label: 'Ad Details', color: '#008DA6' },
    cols: [
      { key: 'primaryCTA', label: 'Primary CTA', width: 120 },
      { key: 'keywords', label: 'Keywords / Hashtags', width: 180 },
      { key: 'targetingNotes', label: 'Targeting Notes', width: 180 },
      { key: 'performanceNotes', label: 'Performance Notes', width: 180 },
    ],
  },
  {
    group: { label: 'Content / Blog', color: '#172B4D' },
    cols: [
      { key: 'writer', label: 'Writer', width: 110 },
      { key: 'publishedDate', label: 'Published Date', width: 120 },
    ],
  },
  {
    group: { label: 'Affiliate', color: '#FF991F' },
    cols: [
      { key: 'affiliateCompany', label: 'Company', width: 130 },
      { key: 'affiliateName', label: 'Affiliate Name', width: 130 },
      { key: 'affiliateEmail', label: 'Email', width: 160 },
      { key: 'affiliateCode', label: 'Code / ID', width: 110 },
      { key: 'affiliateTier', label: 'Tier', width: 120 },
      { key: 'offerType', label: 'Offer Type', width: 120 },
      { key: 'revenueAttributed', label: 'Rev. Attributed', width: 130 },
      { key: 'commissionEarned', label: 'Commission', width: 120 },
    ],
  },
  {
    group: { label: 'Links', color: '#5E6C84' },
    cols: [
      { key: 'landingPageLink', label: 'Landing Page', width: 100 },
      { key: 'thankYouPageLink', label: 'Thank You Page', width: 120 },
      { key: 'retargetingPageLink', label: 'Retargeting Page', width: 130 },
      { key: 'utmTrackingLink', label: 'UTM Link', width: 100 },
      { key: 'adCopyLink', label: 'Ad Copy', width: 90 },
      { key: 'creativeAssetsLink', label: 'Creatives', width: 100 },
      { key: 'destinationURL', label: 'Destination URL', width: 120 },
      { key: 'liveAdLink', label: 'Live Ad', width: 90 },
      { key: 'formIntegrationLink', label: 'CRM / GHL', width: 100 },
    ],
  },
]

const ALL_COLS = COL_GROUPS.flatMap(g => g.cols)
const SORTABLE_KEYS = ALL_COLS.filter(c => c.sortable).map(c => c.key)

export default function SpreadsheetView({ getAllCards, openCard, onUpdate }) {
  const [sortKey, setSortKey] = useState('launchDate')
  const [sortDir, setSortDir] = useState('asc')

  const allCards = useMemo(() => getAllCards(), [getAllCards])

  const sorted = useMemo(() => {
    return [...allCards].sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey]
      if (sortKey === 'launchDate' || sortKey === 'goLiveDate') {
        av = av ? new Date(av).getTime() : Infinity
        bv = bv ? new Date(bv).getTime() : Infinity
      } else if (['budget','annualBudget','spendToDate','revenueEarned','leadsGenerated','appointmentsSet','sales','impressions','cpc','ctr'].includes(sortKey)) {
        av = Number(av) || 0; bv = Number(bv) || 0
      } else {
        av = (av || '').toLowerCase(); bv = (bv || '').toLowerCase()
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [allCards, sortKey, sortDir])

  const totals = useMemo(() => ({
    budget: sorted.reduce((s, c) => s + (Number(c.budget) || 0), 0),
    annualBudget: sorted.reduce((s, c) => s + (Number(c.annualBudget) || 0), 0),
    spendToDate: sorted.reduce((s, c) => s + (Number(c.spendToDate) || 0), 0),
    revenueEarned: sorted.reduce((s, c) => s + (Number(c.revenueEarned) || 0), 0),
    leadsGenerated: sorted.reduce((s, c) => s + (Number(c.leadsGenerated) || 0), 0),
    appointmentsSet: sorted.reduce((s, c) => s + (Number(c.appointmentsSet) || 0), 0),
    sales: sorted.reduce((s, c) => s + (Number(c.sales) || 0), 0),
    commissionEarned: sorted.reduce((s, c) => s + (Number(c.commissionEarned) || 0), 0),
    revenueAttributed: sorted.reduce((s, c) => s + (Number(c.revenueAttributed) || 0), 0),
  }), [sorted])

  const blendedRoi = totals.annualBudget > 0 && totals.revenueEarned > 0
    ? (totals.revenueEarned / totals.annualBudget).toFixed(2) + '×' : '—'

  const sort = (key) => {
    if (!SORTABLE_KEYS.includes(key)) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const upd = (card, field, value) => onUpdate(card._tabKey, card._colKey, card.id, { [field]: value })

  const exportCSV = () => {
    const headers = ALL_COLS.filter(c => c.key !== '_open' && c.key !== '_roi').map(c => c.label)
    const rows = sorted.map(card => ALL_COLS.filter(c => c.key !== '_open' && c.key !== '_roi').map(c => {
      const v = card[c.key]
      return v !== null && v !== undefined ? String(v) : ''
    }))
    const csv = [headers, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'snapscale-campaigns.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const renderCell = (card, colKey) => {
    const u = (field, value) => upd(card, field, value)
    switch (colKey) {
      case '_open': return (
        <button onClick={() => openCard(card, card._tabKey, card._colKey)} title="Open full card"
          className="opacity-0 group-hover:opacity-100 text-[#5E6C84] hover:text-[#0747A6] transition-all">
          <ExternalLink size={13} />
        </button>
      )
      case 'name': return <TextCell value={card.name} onSave={v => u('name', v)} className="font-semibold" />
      case 'campaignType': return <span className="text-[#5E6C84] text-xs whitespace-nowrap">{card.campaignType}</span>
      case 'tactic': return (
        <SelectCell value={card.tactic} options={TACTIC_CATEGORIES} onSave={v => u('tactic', v)}
          renderValue={v => v ? (
            <span className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap"
              style={{ background: TACTIC_COLORS[v]?.bg || '#F4F5F7', color: TACTIC_COLORS[v]?.text || '#5E6C84' }}>
              {v.length > 22 ? v.slice(0,20)+'…' : v}
            </span>
          ) : null} />
      )
      case 'owner': return <SelectCell value={card.owner} options={OWNERS} onSave={v => u('owner', v)} />
      case 'launchDate': return <DateCell value={card.launchDate} onSave={v => u('launchDate', v)} />
      case 'endDate': return <DateCell value={card.endDate} onSave={v => u('endDate', v)} />
      case 'goLiveDate': return <DateCell value={card.goLiveDate} onSave={v => u('goLiveDate', v)} />
      case 'travelDate': return <DateCell value={card.travelDate} onSave={v => u('travelDate', v)} />
      case 'adStartPreShow': return <DateCell value={card.adStartPreShow} onSave={v => u('adStartPreShow', v)} />
      case 'adStartPostShow': return <DateCell value={card.adStartPostShow} onSave={v => u('adStartPostShow', v)} />
      case 'publishedDate': return <DateCell value={card.publishedDate} onSave={v => u('publishedDate', v)} />
      case 'status': return (
        <SelectCell value={card.status} options={STATUS_OPTIONS} onSave={v => u('status', v)}
          renderValue={v => {
            const c = STATUS_COLORS[v] || STATUS_COLORS.backlog
            const lbl = (STATUS_OPTIONS.find(s => s.value === v)||{}).label || v
            return <span className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.text }}>{lbl}</span>
          }} />
      )
      case 'reviewStatus': return <SelectCell value={card.reviewStatus} options={REVIEW_STATUS_OPTIONS} onSave={v => u('reviewStatus', v)} />
      case 'platform': return <SelectCell value={card.platform} options={PLATFORM_OPTIONS} onSave={v => u('platform', v)} />
      case 'going': return <SelectCell value={card.going} options={GOING_OPTIONS} onSave={v => u('going', v)} />
      case 'affiliateTier': return <SelectCell value={card.affiliateTier} options={TIER_OPTIONS} onSave={v => u('affiliateTier', v)} />
      case 'budget': return <NumberCell value={card.budget} onSave={v => u('budget', v)} />
      case 'annualBudget': return <NumberCell value={card.annualBudget} onSave={v => u('annualBudget', v)} />
      case 'spendToDate': return <NumberCell value={card.spendToDate} onSave={v => u('spendToDate', v)} className="text-[#FF5630]" />
      case 'revenueEarned': return <NumberCell value={card.revenueEarned} onSave={v => u('revenueEarned', v)} className="text-[#36B37E]" />
      case 'leadsGenerated': return <NumberCell value={card.leadsGenerated} onSave={v => u('leadsGenerated', v)} fmt={fmtNum} />
      case 'appointmentsSet': return <NumberCell value={card.appointmentsSet} onSave={v => u('appointmentsSet', v)} fmt={fmtNum} />
      case 'sales': return <NumberCell value={card.sales} onSave={v => u('sales', v)} fmt={fmtNum} />
      case 'impressions': return <NumberCell value={card.impressions} onSave={v => u('impressions', v)} fmt={fmtNum} />
      case 'cpc': return <NumberCell value={card.cpc} onSave={v => u('cpc', v)} />
      case 'ctr': return <NumberCell value={card.ctr} onSave={v => u('ctr', v)} fmt={fmtPct} />
      case 'conversionRate': return <NumberCell value={card.conversionRate} onSave={v => u('conversionRate', v)} fmt={fmtPct} />
      case 'clicks': return <NumberCell value={card.clicks} onSave={v => u('clicks', v)} fmt={fmtNum} />
      case 'estimatedParticipants': return <NumberCell value={card.estimatedParticipants} onSave={v => u('estimatedParticipants', v)} fmt={fmtNum} />
      case 'revenueAttributed': return <NumberCell value={card.revenueAttributed} onSave={v => u('revenueAttributed', v)} />
      case 'commissionEarned': return <NumberCell value={card.commissionEarned} onSave={v => u('commissionEarned', v)} />
      case '_roi': {
        const roi = Number(card.annualBudget) > 0 && Number(card.revenueEarned) > 0
          ? (Number(card.revenueEarned) / Number(card.annualBudget)).toFixed(2) + '×' : '—'
        return <span className="font-mono font-semibold text-xs text-[#172B4D]">{roi}</span>
      }
      // Link fields
      case 'landingPageLink': return <LinkCell value={card.landingPageLink} onSave={v => u('landingPageLink', v)} />
      case 'thankYouPageLink': return <LinkCell value={card.thankYouPageLink} onSave={v => u('thankYouPageLink', v)} />
      case 'retargetingPageLink': return <LinkCell value={card.retargetingPageLink} onSave={v => u('retargetingPageLink', v)} />
      case 'utmTrackingLink': return <LinkCell value={card.utmTrackingLink} onSave={v => u('utmTrackingLink', v)} />
      case 'adCopyLink': return <LinkCell value={card.adCopyLink} onSave={v => u('adCopyLink', v)} />
      case 'creativeAssetsLink': return <LinkCell value={card.creativeAssetsLink} onSave={v => u('creativeAssetsLink', v)} />
      case 'destinationURL': return <LinkCell value={card.destinationURL} onSave={v => u('destinationURL', v)} />
      case 'liveAdLink': return <LinkCell value={card.liveAdLink} onSave={v => u('liveAdLink', v)} />
      case 'formIntegrationLink': return <LinkCell value={card.formIntegrationLink} onSave={v => u('formIntegrationLink', v)} />
      // Text fields (default)
      default: return <TextCell value={card[colKey]} onSave={v => u(colKey, v)} />
    }
  }

  const renderTotalsCell = (colKey) => {
    switch (colKey) {
      case 'budget': return <span className="font-mono font-semibold">{fmtMoney(totals.budget)}</span>
      case 'annualBudget': return <span className="font-mono font-semibold">{fmtMoney(totals.annualBudget)}</span>
      case 'spendToDate': return <span className="font-mono font-semibold text-red-300">{fmtMoney(totals.spendToDate)}</span>
      case 'revenueEarned': return <span className="font-mono font-semibold text-green-300">{fmtMoney(totals.revenueEarned)}</span>
      case '_roi': return <span className="font-mono font-bold text-yellow-300">{blendedRoi}</span>
      case 'leadsGenerated': return <span className="font-mono font-semibold">{fmtNum(totals.leadsGenerated)}</span>
      case 'appointmentsSet': return <span className="font-mono font-semibold">{fmtNum(totals.appointmentsSet)}</span>
      case 'sales': return <span className="font-mono font-semibold">{fmtNum(totals.sales)}</span>
      case 'commissionEarned': return <span className="font-mono font-semibold">{fmtMoney(totals.commissionEarned)}</span>
      case 'revenueAttributed': return <span className="font-mono font-semibold">{fmtMoney(totals.revenueAttributed)}</span>
      default: return null
    }
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="bg-white rounded-xl shadow-sm border border-[#DFE1E6] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#DFE1E6]">
          <div>
            <h2 className="text-sm font-semibold text-[#172B4D]">
              All Campaigns <span className="text-[#5E6C84] font-normal">({sorted.length})</span>
            </h2>
            <p className="text-xs text-[#5E6C84] mt-0.5">Click any cell to edit. Scroll right for all fields. <ExternalLink size={10} className="inline" /> opens full card.</p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 text-sm text-[#5E6C84] hover:text-[#172B4D] border border-[#DFE1E6] px-3 py-1.5 rounded-md hover:bg-[#F4F5F7] transition-colors">
            <Download size={14} />Export CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="text-sm border-collapse" style={{ minWidth: 'max-content' }}>
            <thead>
              {/* Group header row */}
              <tr>
                {COL_GROUPS.map(g => (
                  <th key={g.group.label} colSpan={g.cols.length}
                    className="text-left text-xs font-bold px-3 py-1.5 whitespace-nowrap border-b border-white/20 border-r border-white/10"
                    style={{ background: g.group.color, color: 'white' }}>
                    {g.group.label}
                  </th>
                ))}
              </tr>
              {/* Column headers */}
              <tr className="bg-[#F4F5F7] border-b border-[#DFE1E6]">
                {ALL_COLS.map(col => (
                  <th key={col.key}
                    onClick={() => sort(col.key)}
                    style={{ minWidth: col.width || 100, width: col.width || 100 }}
                    className={`text-left text-xs font-semibold text-[#5E6C84] uppercase tracking-wider px-3 py-2 whitespace-nowrap ${col.sortable ? 'cursor-pointer hover:text-[#172B4D] select-none' : ''}`}>
                    {col.key !== '_open' && (
                      <span className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && <ArrowUpDown size={10} className={sortKey === col.key ? 'text-[#FF604B]' : 'text-[#DFE1E6]'} />}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F5F7]">
              {sorted.map(card => (
                <tr key={card.id} className="hover:bg-[#FAFBFC] transition-colors group">
                  {ALL_COLS.map(col => (
                    <td key={col.key}
                      style={{ minWidth: col.width || 100, width: col.width || 100 }}
                      className="px-3 py-2 align-middle">
                      {renderCell(card, col.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#1A1A2E] text-white">
                {ALL_COLS.map((col, i) => (
                  <td key={col.key} className="px-3 py-2.5 text-xs whitespace-nowrap">
                    {i === 1
                      ? <span className="font-semibold">Totals — {sorted.length} campaigns</span>
                      : renderTotalsCell(col.key)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
