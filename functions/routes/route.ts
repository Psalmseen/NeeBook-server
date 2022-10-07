import { Router } from 'express';
import { getBooks, getBooksCategories, postBook } from '../controller/book';
export const router = Router();

router.get('/books/category', getBooksCategories);
router.get('/books', getBooks);
router.post('/book', postBook);
