import { createClient } from '@supabase/supabase-js';

function envTrim(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export const isSupabaseConfigured =
  Boolean(envTrim(import.meta.env.VITE_SUPABASE_URL)) &&
  Boolean(envTrim(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY));

const LOCAL_DEV_PLACEHOLDER_URL = 'http://127.0.0.1:54321';
const LOCAL_DEV_PLACEHOLDER_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const SUPABASE_URL = isSupabaseConfigured
  ? envTrim(import.meta.env.VITE_SUPABASE_URL)
  : import.meta.env.DEV
    ? LOCAL_DEV_PLACEHOLDER_URL
    : '';
const SUPABASE_PUBLISHABLE_KEY = isSupabaseConfigured
  ? envTrim(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  : import.meta.env.DEV
    ? LOCAL_DEV_PLACEHOLDER_ANON_KEY
    : '';

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('[web-portal] Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_PUBLISHABLE_KEY. Tạo apps/web-portal/.env.local từ .env.example.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

