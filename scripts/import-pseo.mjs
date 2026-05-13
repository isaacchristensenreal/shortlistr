import { createClient } from '@supabase/supabase-js'
import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const rows = []

createReadStream('./shortlistr_updated_resume_data.csv')
  .pipe(parse({ columns: true, skip_empty_lines: true }))
  .on('data', (row) => rows.push(row))
  .on('end', async () => {
    console.log(`Importing ${rows.length} rows...`)
    const { error } = await supabase
      .from('pseo_pages')
      .upsert(rows, { onConflict: 'slug', ignoreDuplicates: true })
    if (error) console.error('Import failed:', error)
    else console.log('Done. All rows imported.')
  })
