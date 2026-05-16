import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const MOCK_CAMPAIGNS = [
  {
    id: '1',
    name: 'Q3 Podcast Launch',
    campaign_type: 'Podcast/Webinar',
    description: 'Launch campaign for the new marketing podcast series.',
    start_date: '2026-07-01',
    end_date: '2026-09-30',
    status: 'active',
    created_by: 'user1',
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-10T00:00:00Z',
  },
  {
    id: '2',
    name: 'Summer Paid Ads Blitz',
    campaign_type: 'Paid Ads',
    description: 'Multi-platform paid advertising campaign targeting new leads.',
    start_date: '2026-06-01',
    end_date: '2026-08-31',
    status: 'active',
    created_by: 'user1',
    created_at: '2026-04-15T00:00:00Z',
    updated_at: '2026-05-12T00:00:00Z',
  },
  {
    id: '3',
    name: 'Trade Show Chicago',
    campaign_type: 'Trade Show',
    description: 'Marketing materials and follow-up sequences for Chicago trade show.',
    start_date: '2026-08-10',
    end_date: '2026-08-15',
    status: 'planning',
    created_by: 'user1',
    created_at: '2026-05-05T00:00:00Z',
    updated_at: '2026-05-05T00:00:00Z',
  },
]

async function fetchCampaigns() {
  if (!isSupabaseConfigured) return MOCK_CAMPAIGNS
  const { data, error } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function fetchCampaign(id) {
  if (!isSupabaseConfigured) return MOCK_CAMPAIGNS.find((c) => c.id === id) ?? null
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
      if (!isSupabaseConfigured) return { ...data, id: Date.now().toString() }
      const { data: result, error } = await supabase.from('campaigns').insert(data).select().single()
      if (error) throw error
      return result
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })
}

export function useUpdateCampaign() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      if (!isSupabaseConfigured) return { id, ...data }
      const { data: result, error } = await supabase.from('campaigns').update(data).eq('id', id).select().single()
      if (error) throw error
      return result
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      qc.invalidateQueries({ queryKey: ['campaigns', variables.id] })
    },
  })
}
