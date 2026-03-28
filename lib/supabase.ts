import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client — uses anon key, respects Row Level Security
// Use this in Client Components and anywhere the user's permissions should apply
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-only admin client — uses service role key, bypasses Row Level Security
// ONLY use this in API routes and Server Components for trusted operations
// NEVER import this in any 'use client' file
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})