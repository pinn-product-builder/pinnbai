import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mpbrjezmxmrdhgtvldvi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnJqZXpteG1yZGhndHZsZHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNDE4NTksImV4cCI6MjA4MzcwMTg1OX0.r44nrSjkEQbp-YpbUmOAACWJhZoXwJJO6NWty0PPlVU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
