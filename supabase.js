
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://vdxnyocmnredcnpnnnto.supabase.co';
const supabaseKey = 'sb_publishable_ebwYDb00WlrH0o_G0YmgWw_5Hy-CvqL';
export const supabase = createClient(supabaseUrl, supabaseKey);
console.log("Supabase client initialisé");
