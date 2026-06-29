import multer from 'multer';
import { Request } from 'express';
import path from 'path';

// Memory storage for temporary file holding
const storage = multer.memoryStorage();

// File filter for mp4 and mp3
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedMimeTypes = [
        'video/mp4',
        'video/x-m4v',
        'video/quicktime', // Bazı mp4'ler bu şekilde gelebilir
        'audio/mpeg',
        'audio/mp3',
        'audio/x-mpeg-3',
        'application/octet-stream' // curl veya bazı sistemler genel binary olarak gönderebilir
    ];

    const allowedExtensions = ['.mp4', '.mp3', '.mpeg'];
    const fileExt = path.extname(file.originalname).toLowerCase();

    console.log(`📎 Gelen dosya: ${file.originalname} | Tip: ${file.mimetype} | Uzantı: ${fileExt}`);

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Received: ${file.mimetype}. Only mp4 and mp3 are allowed.`));
    }
};

// Multer configuration
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit (Supabase Free Tier uyumu için)
    }
});
