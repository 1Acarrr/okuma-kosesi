import { Router } from 'express';
import { BookController } from '../controllers/bookController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', BookController.getBooks);
router.get('/:bookId', BookController.getBook);
router.post('/', BookController.createBook);
router.put('/:bookId', BookController.updateBook);
router.delete('/:bookId', BookController.deleteBook);
router.post('/:bookId/sessions', BookController.logReadingSession);

export default router;
