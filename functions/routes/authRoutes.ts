import { Router } from 'express';
import {
  changePasswordController,
  logoutController,
  updateProfileCOntroller,
} from '../controller/authController';
import { checkAccessTokenController } from '../controller/userController';
import { isAuthorized } from '../utils/passport';
import { body } from 'express-validator';
export const authRouter = Router();

authRouter.get('/logout', isAuthorized, logoutController);
authRouter.get('/cookie', checkAccessTokenController);
authRouter.patch('/update-profile', isAuthorized, updateProfileCOntroller);
authRouter.put(
  '/change-password',
  body('oldPassword')
    .isLength({ min: 10, max: 128 })
    .withMessage('old password must contain 10 - 128 characters')
    .isStrongPassword({
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    })
    .withMessage(
      'Must contain a lowercase, uppercase, a number and  a special character'
    ),
  body('newPassword')
    .isLength({ min: 10, max: 128 })
    .withMessage('new password must contain 10 - 128 characters')
    .isStrongPassword({
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    })
    .withMessage(
      'Must contain a lowercase, uppercase, a number and  a special character'
    ),
  isAuthorized,
  changePasswordController
);
