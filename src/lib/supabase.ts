import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Convenience helper: typed from() for vendor-related tables.
// Usage: vendorDb.from('vendors').select('*')
// Types are inferred from the returned data via manual assertions in hooks.
export const vendorDb = supabase