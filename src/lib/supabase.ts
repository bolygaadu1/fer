import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up Supabase connection.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Order {
  id?: string
  order_id: string
  full_name: string
  phone_number: string
  print_type: string
  binding_color_type?: string
  copies?: number
  paper_size?: string
  print_side?: string
  selected_pages?: string
  color_pages?: string
  bw_pages?: string
  special_instructions?: string
  files: Array<{
    name: string
    size: number
    type: string
    path?: string
  }>
  order_date: string
  status: string
  total_cost?: number
  created_at?: string
  updated_at?: string
}