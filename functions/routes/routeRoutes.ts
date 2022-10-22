import { Router } from 'express';
import { body } from 'express-validator';
import {
  getBookController,
  getBooksController,
  getBooksCategoriesController,
  postBookController,
} from '../controller/bookController';
import {
  signupController,
  loginController,
} from '../controller/userController';
export const router = Router();

router.get('/books/category', getBooksCategoriesController);
router.get('/books', getBooksController);
router.post('/book', postBookController);
router.get('/book/:id', getBookController);
router.post(
  '/signup',
  [
    body('firstName')
      .isString()
      .isLength({ min: 1 })
      .withMessage('First name cannot be empty'),
    body('lastName')
      .isString()
      .isLength({ min: 1 })
      .withMessage('Last name cannot be empty'),
    body('email')
      .isEmail()
      .withMessage('invalid email address')
      .isString()
      .withMessage('Invalid Email address'),
    body('password')
      .isLength({ min: 10, max: 128 })
      .withMessage('Password must contain 10 - 128 characters')
      .isStrongPassword({
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        'Must contain a lowercase, uppercase, a number and  a special character'
      ),
  ],
  signupController
);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('invalid email address')
      .isString()
      .withMessage('Invalid Email address'),
    body('password')
      .isLength({ min: 10, max: 128 })
      .withMessage('Password must contain 10 - 128 characters')
      .isStrongPassword({
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
      })
      .withMessage(
        'Must contain a lowercase, uppercase, a number and  a special character'
      ),
  ],
  loginController
);
