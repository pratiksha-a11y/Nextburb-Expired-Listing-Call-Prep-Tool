
import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = 'https://vdxdmhtkvxhssuhdxkaw.supabase.co';
const supabaseKey = 'sb_publishable_wW54c5IIr4AW4leODhuNww_SSAcssT8';

/**
 * Singleton Supabase client instance.
 * Using the provided project ID: vdxdmhtkvxhssuhdxkaw
 */
export const supabase = createClient(supabaseUrl, supabaseKey);
