// Supabase browser client (XeVN: thêm fallback dev khi thiếu .env).
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { cookieStorage } from './cookieStorage';

function envTrim(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Có đủ biến môi trường để gọi API thật — hooks nên `enabled: isSupabaseConfigured` để tránh spam mạng khi dev không chạy Supabase. */
export const isSupabaseConfigured =
  Boolean(envTrim(import.meta.env.VITE_SUPABASE_URL)) &&
  Boolean(envTrim(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY));

/**
 * Khi chưa cấu hình .env (dev), vẫn cần URL/key hợp lệ cho createClient nhưng không gọi REST
 * (xem isSupabaseConfigured + enabled trên useQuery / bỏ listener auth).
 */
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
  throw new Error(
    '[HRM] Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_PUBLISHABLE_KEY. Tạo apps/hrm/.env.local từ .env.example.',
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Important for ecosystem handoff: cookie storage allows session sharing
    // across sub-apps running on different dev ports.
    storage: cookieStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});