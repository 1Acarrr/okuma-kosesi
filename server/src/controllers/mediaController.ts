import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export class MediaController {
    /**
     * Upload media file to Supabase Storage
     */
    static async uploadMedia(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Please upload a file.'
                });
            }

            const file = req.file;
            const fileExt = path.extname(file.originalname);
            const uuid = uuidv4();
            const fileName = `${uuid}${fileExt}`;
            const bucketName = 'ambience-media';
            const folderPath = 'ambience';
            const filePath = `${folderPath}/${fileName}`;

            let contentType = file.mimetype;

            // application/octet-stream gelirse uzantıya göre manuel belirle
            if (contentType === 'application/octet-stream') {
                if (fileExt.toLowerCase() === '.mp4') contentType = 'video/mp4';
                else if (fileExt.toLowerCase() === '.mp3') contentType = 'audio/mpeg';
            }

            // Upload to Supabase Storage
            const { data, error } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file.buffer, {
                    contentType: contentType,
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Supabase Upload Error:', error);
                return res.status(500).json({
                    success: false,
                    error: `Upload failed: ${error.message}`
                });
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucketName)
                .getPublicUrl(filePath);

            return res.status(200).json({
                success: true,
                url: publicUrl
            });

        } catch (error: any) {
            console.error('Media Controller Error:', error);
            return res.status(500).json({
                success: false,
                error: error.message || 'Internal server error'
            });
        }
    }
}
