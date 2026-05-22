import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Bell, Search, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../shared/Avatar'
import useAuthStore from '../../store/authStore'
import { useCampaigns } from '../../hooks/useCampaigns'
import { useTactics } from '../../hooks/useTactics'

function SearchOverlay({ onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const { data: campaigns } = useCampaigns()
  const { data: tactics } = useTactics()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const campaignResults = useMemo(() => {
    if (!query.trim() || !campaigns) return []
    const q = query.toLowerCase()
    return campaigns
      .filter((c) =>
        c.name.toLowerCase().includes(q) ||
        (c.campaign_type ?? '').toLowerCase().includes(q) ||
        (c.status ?? '').toLowerCase().includes(q)
      )
      .slice(0, 5)
  }, [query, campaigns])

  const tacticResults = useMemo(() => {
    if (!query.trim() || !tactics) return []
    const q = query.toLowerCase()
    return tactics
      .filter((t) =>
        t.name.toLowerCase().includes(q) ||
        (t.status ?? '').toLowerCase().includes(q) ||
        (t.tactic_type ?? '').toLowerCase().includes(q)
      )
      .slice(0, 5)
  }, [query, tactics])

  const campaignMap = useMemo(() => {
    const m = {}
    ;(campaigns ?? []).forEach((c) => { m[c.id] = c.name })
    return m
  }, [campaigns])

  const hasResults = campaignResults.length > 0 || tacticResults.length > 0
  const showEmpty = query.trim() && !hasResults

  const handleCampaignClick = (campaign) => {
    navigate(`/campaigns/${campaign.id}`)
    onClose()
  }

  const handleTacticClick = (tactic) => {
    navigate('/content')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-coal/95 backdrop-blur">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl">
        {/* Search input */}
        <div className="flex items-center gap-3 bg-jet border border-white/10 rounded-xl px-4 py-3 shadow-2xl">
          <Search size={18} className="text-white/40 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns and tactics…"
            className="flex-1 bg-transparent text-white placeholder-white/30 outline-none text-base"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-white/40 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
          <kbd className="text-white/20 text-xs border border-white/10 rounded px-1.5 py-0.5 font-mono">Esc</kbd>
        </div>

        {/* Results */}
        {(hasResults || showEmpty) && (
          <div className="mt-2 bg-jet border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {showEmpty && (
              <div className="px-5 py-8 text-center text-white/40 text-sm">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {campaignResults.length > 0 && (
              <div>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Campaigns</span>
                </div>
                {campaignResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCampaignClick(c)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{c.name}</p>
                      <p className="text-white/40 text-xs">{c.campaign_type}</p>
                    </div>
                    <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium
                      ${c.status === 'active' ? 'bg-green-600/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
                      {c.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {tacticResults.length > 0 && (
              <div className={campaignResults.length > 0 ? 'border-t border-white/10' : ''}>
                <div className="px-4 pt-3 pb-1">
                  <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Tactics</span>
                </div>
                {tacticResults.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleTacticClick(t)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{t.name}</p>
                      <p className="text-white/40 text-xs">
                        {campaignMap[t.campaign_id] ?? 'No campaign'}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {(hasResults) && (
              <div className="border-t border-white/10 px-4 py-2">
                <p className="text-xs text-white/20">
                  {campaignResults.length + tacticResults.length} result{campaignResults.length + tacticResults.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="mt-2 bg-jet border border-white/10 rounded-xl px-5 py-6 text-center shadow-2xl">
            <p className="text-white/30 text-sm">Start typing to search campaigns and tactics</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function TopBar({ title }) {
  const { user } = useAuthStore()
  const [showUser, setShowUser] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  // Global `/` keybinding to open search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !showSearch && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [showSearch])

  return (
    <>
      <header className="h-[60px] bg-jet border-b border-white/10 flex items-center justify-between px-6 shrink-0">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSearch(true)}
            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            title="Search (press /)"
          >
            <Search size={18} />
          </button>
          <button className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5 relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange rounded-full" />
          </button>
          <div className="relative">
            <button onClick={() => setShowUser(!showUser)} className="focus:outline-none">
              <Avatar user={user} size="sm" />
            </button>
            {showUser && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-coal border border-white/10 rounded-lg shadow-xl z-50 p-2">
                {user && (
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {user.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user.email}
                    </p>
                    <p className="text-xs text-white/50 truncate">{user.email}</p>
                  </div>
                )}
                <button className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded">
                  Profile Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </>
  )
}
