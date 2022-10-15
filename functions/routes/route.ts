import { Router } from 'express';
import {
  getBookController,
  getBooksController,
  getBooksCategoriesController,
  postBookController,
} from '../controller/book';
export const router = Router();

router.get('/books/category', getBooksCategoriesController);
router.get('/books', getBooksController);
router.post('/book', postBookController);
router.get('/book/:id', getBookController);
