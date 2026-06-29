import { Router } from 'express';
import { StatsController } from '../controllers/statsController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/daily', StatsController.getDailyStats);
router.get('/weekly', StatsController.getWeeklyStats);
router.get('/yearly', StatsController.getYearlyStats);
router.get('/summary', StatsController.getReadingSummary);
router.post('/focus-session', StatsController.logFocusSession);

export default router;
