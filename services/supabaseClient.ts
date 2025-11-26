
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vwtxiptmjlquhmycwaef.supabase.co';
const supabaseKey = 'sb_publishable_J-4lt9LpmTV7fIRsQYQFzA_j2TgbzmR';

export const supabase = createClient(supabaseUrl, supabaseKey);
