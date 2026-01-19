
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vcuuzleslgoxgjvkfodx.supabase.co';
const supabaseKey = 'sb_publishable_pO8eYgP0VaJ8JGyPeltGyA_opCNhBJZ';

export const supabase = createClient(supabaseUrl, supabaseKey);
