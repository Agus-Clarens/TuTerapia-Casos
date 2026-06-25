import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ddkccvqthljgvrvcjomi.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRka2NjdnF0aGxqZ3ZydmNqb21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MzIzNjYsImV4cCI6MjA5NDIwODM2Nn0.hlLdptPk3C3PmmdS0Of_qcOjYRStQyW7Ch37PrfpzxI"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
