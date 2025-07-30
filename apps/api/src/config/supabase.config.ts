import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase_project_url_here') || supabaseKey.includes('your_supabase')) {
    console.warn('⚠️  Supabase credentials not configured. Please update your .env file with actual Supabase URL and key.');
    // Return a mock client that won't break the app
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
};
