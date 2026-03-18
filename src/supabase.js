import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hhoufhaexxnuzormfqcr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3MBttyGc--PQwQio4V5RmA_CaatPyp7';

let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} catch (e) {
  console.error('Supabase init failed:', e);
  // Create a mock client so the app doesn't crash
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({}),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }), order: () => Promise.resolve({ data: [] }), not: () => Promise.resolve({}) }), not: () => Promise.resolve({}) }),
      upsert: () => Promise.resolve({}),
      insert: () => Promise.resolve({}),
      delete: () => ({ eq: () => ({ not: () => Promise.resolve({}) }) }),
    }),
  };
}

export { supabase };
