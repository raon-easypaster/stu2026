import { supabase } from './supabase';

export async function isAdmin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (error || !data) return false;
    return data.role === 'admin';
}
