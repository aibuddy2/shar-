
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://vcuuzleslgoxgjvkfodx.supabase.co';
const supabaseKey = 'sb_publishable_pO8eYgP0VaJ8JGyPeltGyA_opCNhBJZ';

export const supabase = createClient(supabaseUrl, supabaseKey);
