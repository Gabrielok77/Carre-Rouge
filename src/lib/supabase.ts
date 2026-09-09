import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification de l'URL
export const isSupabaseConfigured = Boolean(
  typeof rawUrl === 'string' &&
  rawUrl.trim().length > 0 &&
  rawUrl.startsWith('https://') &&
  rawUrl !== 'https://placeholder.supabase.co' &&
  typeof rawKey === 'string' &&
  rawKey.trim().length > 0 &&
  rawKey !== 'placeholder-anon-key'
);

const safeUrl = isSupabaseConfigured ? rawUrl : 'https://dummyproject.supabase.co';
const safeKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});