require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

;(async () => {
  const { data, error } = await supabase.from('your_table').select('*').limit(1)
  console.log('Supabase test:', { data, error })
  process.exit(0)
})()
