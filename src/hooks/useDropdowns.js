import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const MOCK_DROPDOWNS = {
  'Campaign Type': ['Podcast/Webinar', 'Trade Show', 'Blog', 'Email/SMS', 'Paid Ads', 'Organic Social'],
  'Traffic Source': ['Paid Ads', 'Social Media Organic', 'Email/SMS'],
  'Funnel Step': ['Landing Page', 'Thank You Page', 'Retargeting Page'],
  'Asset Status': ['Not Started', 'In Progress', 'Needs Review', 'Approved', 'Published', 'On Hold'],
  'Priority': ['Low', 'Medium', 'High', 'Urgent'],
  'Tactic Type': [
    'Social Media Post', 'Email', 'SMS', 'Ad Creative', 'Landing Page Copy',
    'Thank You Page Copy', 'Retargeting Page Copy', 'Blog Post', 'Podcast Script',
    'Webinar Slide Deck', 'Video Script', 'Quote Graphic', 'LinkedIn Carousel',
    'Podcast Thumbnail', 'Webinar Thumbnail',
  ],
  'Platform': [
    'LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'Email (GHL)', 'SMS (GHL)',
    'Meta Ads', 'Google Ads', 'Buzzsprout', 'Website',
  ],
  'Content Pillar': [
    'Pain/Problem Awareness', 'Social Proof / Case Study', 'Education / How-To',
    'Myth-Bust', 'Offer / CTA', 'Team / Culture',
  ],
}

async function fetchDropdowns() {
  if (!isSupabaseConfigured) return MOCK_DROPDOWNS
  const { data, error } = await supabase
    .from('dropdown_registry')
    .select('id, name, dropdown_options(id, label, display_order, is_active)')
    .order('created_at')
  if (error) throw error
  const result = {}
  data.forEach((d) => {
    result[d.name] = d.dropdown_options
      .filter((o) => o.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map((o) => o.label)
  })
  return result
}

export function useDropdowns() {
  return useQuery({ queryKey: ['dropdowns'], queryFn: fetchDropdowns })
}

export function useDropdownOptions(name) {
  const query = useDropdowns()
  return {
    ...query,
    data: query.data?.[name] ?? [],
  }
}
