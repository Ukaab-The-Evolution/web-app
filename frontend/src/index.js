import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY)
supabase.from('your_table').select('*').then(console.log).catch(console.error)
