"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("./supabase");
async function main() {
    console.log('Testing Supabase connection...');
    if (!supabase_1.supabase) {
        console.error('Supabase client not initialized.');
        return;
    }
    try {
        console.log('Attempt 1: Simple select id...');
        const { data: data1, error: error1 } = await supabase_1.supabase.from('runs').select('id').limit(1);
        if (error1)
            console.error('Error 1:', error1);
        else
            console.log('Success 1:', data1);
        console.log('Attempt 2: Select * without order...');
        const { data: data2, error: error2 } = await supabase_1.supabase.from('runs').select('*').limit(1);
        if (error2)
            console.error('Error 2:', error2);
        else
            console.log('Success 2:', data2);
        // console.log('Attempt 3: Original query...');
        // const runs = await db.listRuns(5);
        // console.log('Runs:', runs);
        console.log('Attempt 4: Insert a dummy run...');
        const dummyRun = {
            type: 'single',
            status: 'failure',
            base_url: 'http://test.com',
            target_url: 'http://test.com',
            created_at: new Date().toISOString(),
        };
        const { data: data4, error: error4 } = await supabase_1.supabase.from('runs').insert(dummyRun).select();
        if (error4)
            console.error('Error 4:', error4);
        else
            console.log('Success 4:', data4);
    }
    catch (error) {
        console.error('Error listing runs:', error);
    }
}
main();
