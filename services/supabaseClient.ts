import { createClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env) and Node (process.env) so scripts like
// `ts-node` can run tests locally.
const env: any = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : process.env;

const supabaseUrl = (env.VITE_SUPABASE_URL as string) || 'https://vwtxiptmjlquhmycwaef.supabase.co';
const supabaseKey = (env.VITE_SUPABASE_KEY as string) || 'sb_publishable_J-4lt9LpmTV7fIRsQYQFzA_j2TgbzmR';

if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_KEY) {
	// eslint-disable-next-line no-console
	console.warn('Warning: VITE_SUPABASE_URL or VITE_SUPABASE_KEY not set. Using embedded defaults. For production, set .env with VITE_SUPABASE_URL and VITE_SUPABASE_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);