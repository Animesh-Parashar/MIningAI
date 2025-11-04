const { createClient } = require('@supabase/supabase-js');

let supabase = null;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;
if (url && key) {
  supabase = createClient(url, key);
} else {
  // Not configured; supabase remains null and callers should fallback.
  console.warn('Supabase not configured: set SUPABASE_URL and SUPABASE_KEY to enable persistence');
}

module.exports = { supabase };
