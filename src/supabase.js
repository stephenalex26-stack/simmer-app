import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hhoufhaexxnuzormfqcr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_3MBttyGc--PQwQio4V5RmA_CaatPyp7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
