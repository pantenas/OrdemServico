import { createClient } from '@supabase/supabase-js'

// Substitua pelas informações do seu painel do Supabase (Settings > API)
const supabaseUrl = 'https://seu-projeto.supabase.co'
const supabaseKey = 'sua-chave-anon-public'

export const supabase = createClient(supabaseUrl, supabaseKey)