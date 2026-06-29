const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const videosDir = 'C:/Users/isaca/OneDrive/Desktop/okumaKosesi/videos/';
const bucketName = 'ambience-media';

async function retryFailedVideos() {
    try {
        const failedIndices = [6, 9, 11];
        console.log(`🚀 Retrying uploads for videos: ${failedIndices.join(', ')}...`);

        for (const i of failedIndices) {
            const localPath = path.join(videosDir, `${i}.mp4`);
            const remoteName = `video_${i}.mp4`;
            const remotePath = `library/${remoteName}`;

            if (!fs.existsSync(localPath)) {
                console.warn(`⚠️ Local file not found: ${localPath}`);
                continue;
            }

            const stats = fs.statSync(localPath);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
            console.log(`⬆️ Uploading ${i}.mp4 (${fileSizeMB} MB) as ${remoteName}...`);

            const fileBuffer = fs.readFileSync(localPath);

            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(remotePath, fileBuffer, {
                    contentType: 'video/mp4',
                    upsert: true
                });

            if (error) {
                console.error(`❌ Error uploading video_${i}:`, error.message);
                if (error.message.includes('Payload Too Large') || stats.size > 52428800) {
                    console.error(`💡 Note: This file (${fileSizeMB} MB) might be over the Supabase Free Tier limit (50 MB).`);
                }
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(remotePath);
                console.log(`✅ Success: ${publicUrl}`);
            }
        }
        console.log('\n✨ Retry process completed!');
    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
    }
}

retryFailedVideos();
