import { createClient } from '@supabase/supabase-js';

// Supabase Project ID: wnlveqfnbaempwvymfak
// Supabase Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IndubHZlcWZuYmFlbXB3dnltZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5ODk0NzIsImV4cCI6MjA3NzU2NTQ3Mn0.yb9fairNg0lurOIZpkUFY4OMD_ddTGNMEgizCGS8ZVg

const SUPABASE_URL = 'https://wnlveqfnbaempwvymfak.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndubHZlcWZuYmFlbXB3dnltZmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5ODk0NzIsImV4cCI6MjA3NzU2NTQ3Mn0.yb9fairNg0lurOIZpkUFY4OMD_ddTGNMEgizCGS8ZVg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);