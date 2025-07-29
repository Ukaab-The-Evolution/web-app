import express from 'express'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

const app = express()
const port = process.env.PORT || 5000

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

app.get('/', (req, res) => {
  res.send('Backend is running!')
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
