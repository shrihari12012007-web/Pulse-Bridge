import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  isValidUrl(supabaseUrl) &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey !== 'your-anon-key'
)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

export function getSupabaseClient(): SupabaseClient | null {
  return supabase
}

export function getBackendStatus(): {
  configured: boolean
  url: string | null
  reason?: string
} {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      configured: false,
      url: null,
      reason: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing.',
    }
  }
  if (!isValidUrl(supabaseUrl)) {
    return {
      configured: false,
      url: supabaseUrl,
      reason: 'VITE_SUPABASE_URL is not a valid HTTP/HTTPS URL.',
    }
  }
  return {
    configured: isSupabaseConfigured,
    url: supabaseUrl,
  }
}
