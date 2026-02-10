
import { createClient } from '@supabase/supabase-js';

// Project credentials
const supabaseUrl = 'https://vdxdmhtkvxhssuhdxkaw.supabase.co';

/**
 * The project's public anon API key.
 * Provided by user: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
export const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeGRtaHRrdnhoc3N1aGR4a2F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzgzNDYsImV4cCI6MjA4MzI1NDM0Nn0.TSPkAZrXV3eJ-DoczkGACnkyhlFY_Y6di456IMe8sMg';

/**
 * Singleton Supabase client instance.
 * Initialized with the public Anon Key only.
 * No Authorization headers or session tokens will be sent by default.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
