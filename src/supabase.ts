import { createClient } from '@supabase/supabase-js';
import { config } from './config';

// Initialize Supabase admin client using the service role key.
// Without the service key we'd be subject to RLS and most backend features would fail.
if (config.supabase.url && !config.supabase.serviceRoleKey) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. Backend Supabase features (DB, Storage) will be disabled.');
}

export const supabase = config.supabase.url && config.supabase.serviceRoleKey
    ? createClient(config.supabase.url, config.supabase.serviceRoleKey)
    : null;

export const isSupabaseConfigured = () => !!supabase;

export interface RunRecord {
    id?: string;
    type: 'single' | 'batch';
    status: 'success' | 'failure';
    base_url: string;
    target_url: string;
    summary?: any;
    artifacts_path?: string;
    created_at?: string;
    device?: string;
}

export const db = {
    createRun: async (record: RunRecord) => {
        if (!supabase) return null;
        const { data, error } = await supabase
            .from('runs')
            .insert(record)
            .single();

        if (error) {
            console.error('Supabase createRun error:', error);
            throw error;
        }
        return data;
    },

    listRuns: async (limit: number = 50) => {
        if (!supabase) return [];
        const { data, error } = await supabase
            .from('runs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Supabase listRuns error:', error);
            throw error;
        }
        return data;
    },
};
