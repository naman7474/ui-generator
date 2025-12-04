"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.isSupabaseConfigured = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const config_1 = require("./config");
// Initialize Supabase admin client using the service role key.
// Without the service key we'd be subject to RLS and most backend features would fail.
if (config_1.config.supabase.url && !config_1.config.supabase.serviceRoleKey) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. Backend Supabase features (DB, Storage) will be disabled.');
}
exports.supabase = config_1.config.supabase.url && config_1.config.supabase.serviceRoleKey
    ? (0, supabase_js_1.createClient)(config_1.config.supabase.url, config_1.config.supabase.serviceRoleKey)
    : null;
const isSupabaseConfigured = () => !!exports.supabase;
exports.isSupabaseConfigured = isSupabaseConfigured;
exports.db = {
    createRun: async (record) => {
        if (!exports.supabase)
            return null;
        const { data, error } = await exports.supabase
            .from('runs')
            .insert(record)
            .single();
        if (error) {
            console.error('Supabase createRun error:', error);
            throw error;
        }
        return data;
    },
    listRuns: async (limit = 50) => {
        if (!exports.supabase)
            return [];
        const { data, error } = await exports.supabase
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
