import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import Book from '../model/book';
export const router = Router();

router.get('/', async (req, res) => {
  const book = await Book.find({}, { _id: 0, _v: 0 });
  res.json({
    path: 'Home',
    firstName: 'Samson',
    lastName: 'Oyebamiji',
    book,
  });
});
router.get('/json', (req, res) => {
  res.json({
    auth: 'Oyebamiji Samson',
    path: '/json',
  });
});
