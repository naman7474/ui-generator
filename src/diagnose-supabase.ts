import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_BUCKET || 'artifacts';

console.log('Checking Supabase connection...');
console.log(`URL: ${url}`);
console.log(`Bucket: ${bucket}`);

if (!url || !key) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    try {
        console.log('Listing buckets...');
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
            console.error('Error listing buckets:', listError);
        } else {
            console.log('Buckets:', buckets.map(b => b.name));
            const found = buckets.find(b => b.name === bucket);
            if (found) {
                console.log(`Bucket '${bucket}' exists.`);

                // Test upload string
                console.log('Testing string upload...');
                await supabase.storage.from(bucket).upload('test-string.txt', 'Hello', { upsert: true });

                // Test upload Buffer
                console.log('Testing Buffer upload...');
                const buffer = Buffer.from('Hello Buffer');
                const { error: bufError } = await supabase.storage.from(bucket).upload('test-buffer.txt', buffer, { upsert: true, contentType: 'text/plain' });
                if (bufError) console.error('Buffer upload failed:', bufError);
                else console.log('Buffer upload successful');

                // Test upload NodeFile
                /*
                import { File as NodeFile } from 'buffer';
                console.log('Testing NodeFile upload...');
                const nodeFile = new NodeFile([buffer], 'test-file.txt', { type: 'text/plain' });
                const { error: nfError } = await supabase.storage.from(bucket).upload('test-nodefile.txt', nodeFile, { upsert: true });
                if (nfError) console.error('NodeFile upload failed:', nfError);
                else console.log('NodeFile upload successful');
                */
            } else {
                console.error(`Bucket '${bucket}' NOT found.`);
                console.log('Attempting to create bucket...');
                const { data, error: createError } = await supabase.storage.createBucket(bucket, {
                    public: true,
                    fileSizeLimit: 52428800, // 50MB
                });
                if (createError) {
                    console.error('Error creating bucket:', createError);
                } else {
                    console.log(`Bucket '${bucket}' created successfully.`);
                }
            }
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

check();
