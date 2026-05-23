import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const MOCK_CAMPAIGNS = [
  // Tradeshows / Events — $76,390
  {
    id: '1', name: 'SOMSA Post-Conference Follow-Up', campaign_type: 'Trade Show',
    description: 'Follow-up sequences and materials for the SOMSA conference.',
    start_date: '2026-05-01', end_date: '2026-06-15', status: 'active',
    budget: 3040, spend_to_date: 3040,
    budget_category: 'Tradeshows / Events', target_market: 'Oral Surgery',
    created_by: 'user1', created_at: '2026-04-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
  {
    id: '2', name: 'MGMA Annual Conference', campaign_type: 'Trade Show',
    description: 'Booth, materials, and post-show outreach for MGMA.',
    start_date: '2026-09-01', end_date: '2026-10-15', status: 'planning',
    budget: 5000, spend_to_date: 0,
    budget_category: 'Tradeshows / Events', target_market: 'Medical Group Management',
    created_by: 'user1', created_at: '2026-04-10T00:00:00Z', updated_at: '2026-04-10T00:00:00Z',
  },
  {
    id: '3', name: 'AAO Ophthalmology Conference', campaign_type: 'Trade Show',
    description: 'Two-month booth + sponsorship at AAO 2026.',
    start_date: '2026-09-15', end_date: '2026-10-31', status: 'planning',
    budget: 10000, spend_to_date: 0,
    budget_category: 'Tradeshows / Events', target_market: 'Ophthalmology',
    created_by: 'user1', created_at: '2026-04-12T00:00:00Z', updated_at: '2026-04-12T00:00:00Z',
  },
  {
    id: '4', name: 'PPS Trade Show', campaign_type: 'Trade Show',
    description: 'Q4 PPS booth and pre/post-show digital campaign.',
    start_date: '2026-10-01', end_date: '2026-12-31', status: 'planning',
    budget: 15000, spend_to_date: 0,
    budget_category: 'Tradeshows / Events', target_market: 'Physical Therapy',
    created_by: 'user1', created_at: '2026-04-15T00:00:00Z', updated_at: '2026-04-15T00:00:00Z',
  },
  {
    id: '5', name: 'HINT Summit & Remaining Trade Shows', campaign_type: 'Trade Show',
    description: 'HINT Summit, Glaucoma 360, Beltone, DPC, IHS, FYZICAL, NSCHBC events.',
    start_date: '2026-01-01', end_date: '2026-12-31', status: 'active',
    budget: 43350, spend_to_date: 11850,
    budget_category: 'Tradeshows / Events', target_market: 'All Markets',
    created_by: 'user1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
  // Digital & Online Marketing — $32,450
  {
    id: '6', name: 'Summer Paid Ads Blitz', campaign_type: 'Paid Ads',
    description: 'Multi-platform paid advertising — Facebook retargeting, LinkedIn, Google Ads.',
    start_date: '2026-06-01', end_date: '2026-08-31', status: 'active',
    budget: 14920, spend_to_date: 4960,
    budget_category: 'Digital & Online Marketing', target_market: 'All Markets',
    created_by: 'user1', created_at: '2026-04-15T00:00:00Z', updated_at: '2026-05-12T00:00:00Z',
  },
  {
    id: '7', name: 'SEO & Website Content', campaign_type: 'Blog',
    description: 'Ongoing SEO blog posts, website copy, and GHL landing pages.',
    start_date: '2026-01-01', end_date: '2026-12-31', status: 'active',
    budget: 17530, spend_to_date: 7304,
    budget_category: 'Digital & Online Marketing', target_market: 'All Markets',
    created_by: 'user1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-05-10T00:00:00Z',
  },
  // Broadcast Media — $16,480
  {
    id: '8', name: 'Q3 Podcast Launch', campaign_type: 'Podcast/Webinar',
    description: 'Full podcast launch — scripts, thumbnails, promotions, Buzzsprout distribution.',
    start_date: '2026-07-01', end_date: '2026-09-30', status: 'active',
    budget: 16480, spend_to_date: 0,
    budget_category: 'Broadcast Media', target_market: 'All Markets',
    created_by: 'user1', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-10T00:00:00Z',
  },
  // Outreach & Direct Sales — $97,534
  {
    id: '9', name: 'Direct Outreach & Sales Enablement', campaign_type: 'Email/SMS',
    description: 'GHL email sequences, SMS campaigns, outreach scripts, and sales collateral.',
    start_date: '2026-01-01', end_date: '2026-12-31', status: 'active',
    budget: 97534, spend_to_date: 40639,
    budget_category: 'Outreach & Direct Sales', target_market: 'All Markets',
    created_by: 'user1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-05-15T00:00:00Z',
  },
  // Affiliate Referrals — $5,520
  {
    id: '10', name: 'Affiliate & Referral Program', campaign_type: 'Organic Social',
    description: 'Partner referral communications, co-marketing materials.',
    start_date: '2026-01-01', end_date: '2026-12-31', status: 'active',
    budget: 5520, spend_to_date: 2300,
    budget_category: 'Affiliate Referrals', target_market: 'All Markets',
    created_by: 'user1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
  // Print Media / Direct Mail — $8,250
  {
    id: '11', name: 'PPS Buyers Guide & Print Media', campaign_type: 'Trade Show',
    description: 'PPS Buyers Guide placements and direct mail drops.',
    start_date: '2026-01-01', end_date: '2026-12-31', status: 'active',
    budget: 8250, spend_to_date: 875,
    budget_category: 'Print Media / Direct Mail', target_market: 'Physical Therapy',
    created_by: 'user1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-15T00:00:00Z',
  },
  // Corporate & Brand Initiatives — $20,875
  {
    id: '12', name: 'Brand & Corporate Initiatives', campaign_type: 'Blog',
    description: 'Corporate identity, brand content, LinkedIn company presence, thought leadership.',
    start_date: '2026-01-01', end_date: '2026-12-31', status: 'active',
    budget: 20875, spend_to_date: 8698,
    budget_category: 'Corporate & Brand Initiatives', target_market: 'All Markets',
    created_by: 'user1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-05-10T00:00:00Z',
  },
  // Admin — $11,988
  {
    id: '13', name: 'Marketing Ops & Admin', campaign_type: 'Email/SMS',
    description: 'GHL, email platform costs, StreamYard, and miscellaneous marketing ops.',
    start_date: '2026-01-01', end_date: '2026-12-31', status: 'active',
    budget: 11988, spend_to_date: 5995,
    budget_category: 'Admin', target_market: 'All Markets',
    created_by: 'user1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z',
  },
]

// Persist mock data to localStorage so it survives page refreshes in demo mode
const CAMPAIGNS_STORAGE_KEY = 'impera_mock_campaigns'

function loadMockCampaigns() {
  try {
    const stored = localStorage.getItem(CAMPAIGNS_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  return MOCK_CAMPAIGNS.map((c) => ({ ...c }))
}

function saveMockCampaigns(data) {
  try { localStorage.setItem(CAMPAIGNS_STORAGE_KEY, JSON.stringify(data)) } catch {}
}

let mockCampaigns = loadMockCampaigns()

async function fetchCampaigns() {
  if (!isSupabaseConfigured) return mockCampaigns
  const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function fetchCampaign(id) {
  if (!isSupabaseConfigured) return mockCampaigns.find((c) => c.id === id) ?? null
  const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export function useCampaigns() {
  return useQuery({ queryKey: ['campaigns'], queryFn: fetchCampaigns })
}

export function useCampaign(id) {
  return useQuery({ queryKey: ['campaigns', id], queryFn: () => fetchCampaign(id), enabled: !!id })
}

export function useCreateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      if (!isSupabaseConfigured) {
        const newC = { ...data, id: Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        mockCampaigns = [...mockCampaigns, newC]
        saveMockCampaigns(mockCampaigns)
        return newC
      }
      const { data: result, error } = await supabase.from('campaigns').insert(data).select().single()
      if (error) throw error
      return result
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useDeleteCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      if (!isSupabaseConfigured) {
        mockCampaigns = mockCampaigns.filter(c => c.id !== id)
        saveMockCampaigns(mockCampaigns)
        return id
      }
      const { error } = await supabase.from('campaigns').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      if (!isSupabaseConfigured) {
        mockCampaigns = mockCampaigns.map((c) => c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c)
        saveMockCampaigns(mockCampaigns)
        return mockCampaigns.find((c) => c.id === id)
      }
      const { data: result, error } = await supabase.from('campaigns').update(data).eq('id', id).select().single()
      if (error) throw error
      return result
    },
    onMutate: async ({ id, ...data }) => {
      await qc.cancelQueries({ queryKey: ['campaigns'] })
      const prev = qc.getQueryData(['campaigns'])
      qc.setQueryData(['campaigns'], (old) =>
        (old ?? []).map((c) => c.id === id ? { ...c, ...data } : c)
      )
      qc.setQueryData(['campaigns', id], (old) => old ? { ...old, ...data } : old)
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['campaigns'], ctx.prev)
    },
    onSettled: (_data, _err, variables) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      qc.invalidateQueries({ queryKey: ['campaigns', variables.id] })
    },
  })
}
