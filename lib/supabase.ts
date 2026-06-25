import { createClient } from '@supabase/supabase-js'

console.log('SUPABASE URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const supabaseUrl = "https://ddkccvqthljgvrvcjomi.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka2NjdnF0aGxqZ3ZydmNqb21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2NTUzNjQsImV4cCI6MjA0ODIzMTM2NH0.HHLNMHHDQWBnJiIJhMVEBJoHoUriUaOA3OJBXq3WsKM"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
