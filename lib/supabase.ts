import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey.includes('your_supabase')) {
  console.error('Missing or invalid Supabase credentials. Please update .env.local with:');
  console.error('1. NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL');
  console.error('2. NEXT_PUBLIC_SUPABASE_ANON_KEY - Your public anon key from Supabase dashboard');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);