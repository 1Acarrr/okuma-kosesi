import { Router } from 'express';
import { NoteController } from '../controllers/noteController';
import { authenticateToken } from '../middlewares/auth';

const router = Router({ mergeParams: true });

router.use(authenticateToken);

router.get('/', NoteController.getAllNotes);
router.get('/:bookId', NoteController.getNotes);
router.post('/:bookId', NoteController.createNote);
router.put('/:noteId', NoteController.updateNote);
router.delete('/:noteId', NoteController.deleteNote);

export default router;
