import { Router } from 'express';
import { QuoteController } from '../controllers/quoteController';
import { authenticateToken } from '../middlewares/auth';

const router = Router({ mergeParams: true });

router.use(authenticateToken);

router.get('/', QuoteController.getAllQuotes);
router.get('/:bookId', QuoteController.getQuotesByBook);
router.post('/:bookId', QuoteController.createQuote);
router.put('/:quoteId', QuoteController.updateQuote);
router.delete('/:quoteId', QuoteController.deleteQuote);

export default router;
