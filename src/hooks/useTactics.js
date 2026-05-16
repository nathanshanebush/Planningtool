import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const MOCK_TACTICS = [
  {
    id: 't1', campaign_id: '1', name: 'Podcast Intro Email', tactic_type: 'Email',
    platform: 'Email (GHL)', traffic_source: 'Email/SMS', funnel_step: 'Landing Page',
    content_pillar: 'Offer / CTA', assigned_to: 'user1', due_date: '2026-06-15',
    status: 'In Progress', priority: 'High', copy_notes: 'Welcome email for podcast launch.',
    created_by: 'user1', created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-10T00:00:00Z',
  },
  {
    id: 't2', campaign_id: '1', name: 'LinkedIn Announcement Post', tactic_type: 'Social Media Post',
    platform: 'LinkedIn', traffic_source: 'Social Media Organic', funnel_step: 'Landing Page',
    content_pillar: 'Education / How-To', assigned_to: 'user1', due_date: '2026-06-10',
    status: 'Needs Review', priority: 'Medium', copy_notes: '',
    created_by: 'user1', created_at: '2026-05-02T00:00:00Z', updated_at: '2026-05-11T00:00:00Z',
  },
  {
    id: 't3', campaign_id: '2', name: 'Meta Ad Creative - Version A', tactic_type: 'Ad Creative',
    platform: 'Meta Ads', traffic_source: 'Paid Ads', funnel_step: 'Landing Page',
    content_pillar: 'Pain/Problem Awareness', assigned_to: 'user3', due_date: '2026-05-20',
    status: 'Not Started', priority: 'Urgent', copy_notes: 'Focus on pain points.',
    created_by: 'user1', created_at: '2026-05-03T00:00:00Z', updated_at: '2026-05-03T00:00:00Z',
  },
  {
    id: 't4', campaign_id: '2', name: 'Google Search Ad Copy', tactic_type: 'Ad Creative',
    platform: 'Google Ads', traffic_source: 'Paid Ads', funnel_step: 'Landing Page',
    content_pillar: 'Offer / CTA', assigned_to: 'user2', due_date: '2026-05-25',
    status: 'Approved', priority: 'High', copy_notes: '',
    created_by: 'user1', created_at: '2026-05-04T00:00:00Z', updated_at: '2026-05-12T00:00:00Z',
  },
  {
    id: 't5', campaign_id: '3', name: 'Trade Show Brochure Copy', tactic_type: 'Blog Post',
    platform: 'Website', traffic_source: 'Social Media Organic', funnel_step: 'Thank You Page',
    content_pillar: 'Social Proof / Case Study', assigned_to: 'user1', due_date: '2026-07-01',
    status: 'Not Started', priority: 'Low', copy_notes: '',
    created_by: 'user1', created_at: '2026-05-05T00:00:00Z', updated_at: '2026-05-05T00:00:00Z',
  },
  {
    id: 't6', campaign_id: '1', name: 'Podcast Thumbnail Design', tactic_type: 'Podcast Thumbnail',
    platform: 'Buzzsprout', traffic_source: 'Social Media Organic', funnel_step: 'Landing Page',
    content_pillar: 'Team / Culture', assigned_to: 'user3', due_date: '2026-06-05',
    status: 'On Hold', priority: 'Medium', copy_notes: '',
    created_by: 'user1', created_at: '2026-05-06T00:00:00Z', updated_at: '2026-05-13T00:00:00Z',
  },
]

async function fetchTactics(filters = {}) {
  if (!isSupabaseConfigured) {
    let data = [...MOCK_TACTICS]
    if (filters.campaign_id) data = data.filter((t) => t.campaign_id === filters.campaign_id)
    if (filters.status) data = data.filter((t) => t.status === filters.status)
    if (filters.assigned_to) data = data.filter((t) => t.assigned_to === filters.assigned_to)
    return data
  }
  let query = supabase.from('tactics').select('*')
  if (filters.campaign_id) query = query.eq('campaign_id', filters.campaign_id)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to)
  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

async function fetchTactic(id) {
  if (!isSupabaseConfigured) return MOCK_TACTICS.find((t) => t.id === id) ?? null
  const { data, error } = await supabase.from('tactics').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export function useTactics(filters) {
  return useQuery({ queryKey: ['tactics', filters], queryFn: () => fetchTactics(filters) })
}

export function useTactic(id) {
  return useQuery({ queryKey: ['tactics', id], queryFn: () => fetchTactic(id), enabled: !!id })
}

export function useCreateTactic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      if (!isSupabaseConfigured) return { ...data, id: `t${Date.now()}` }
      const { data: result, error } = await supabase.from('tactics').insert(data).select().single()
      if (error) throw error
      return result
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tactics'] }),
  })
}

export function useUpdateTactic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      if (!isSupabaseConfigured) return { id, ...data }
      const { data: result, error } = await supabase.from('tactics').update(data).eq('id', id).select().single()
      if (error) throw error
      return result
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tactics'] }),
  })
}

export function useDeleteTactic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      if (!isSupabaseConfigured) return id
      const { error } = await supabase.from('tactics').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tactics'] }),
  })
}
