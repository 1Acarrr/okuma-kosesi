import { Router } from 'express';
import { MediaController } from '../controllers/mediaController';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// POST /api/v1/media/upload-media
router.post('/upload-media', upload.single('file'), MediaController.uploadMedia);

export default router;
