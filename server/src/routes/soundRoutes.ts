import { Router } from 'express';
import { SoundController } from '../controllers/soundController';

const router = Router();

router.get('/', SoundController.getSounds);
router.get('/:soundId', SoundController.getSound);

export default router;
