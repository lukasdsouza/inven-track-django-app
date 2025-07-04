// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ytwqckrktfjkjiraczzi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0d3Fja3JrdGZqa2ppcmFjenppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NzkyMDUsImV4cCI6MjA2NzE1NTIwNX0.rxqQvikYQ87114unbvRlSafS0rznPQCUq-Ikoe7_oy8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});