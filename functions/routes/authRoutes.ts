import { Router } from 'express';
import {
  changePasswordController,
  logoutController,
  rateBookController,
  sendVerificationEmailController,
  updateProfileCOntroller,
  uploadProfileImageController,
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

authRouter.post(
  '/upload-profile-image',
  isAuthorized,
  uploadProfileImageController
);

authRouter.post('/verify-email', isAuthorized, sendVerificationEmailController);
authRouter.post(
  '/rate-book',
  [
    body('rating').custom(async (value) => {
      if (value < 0 || value > 5) {
        throw new Error('Value not within range');
      }
      if (typeof value !== 'number') {
        throw new Error('Rating must be a number');
      }
    }),
  ],
  isAuthorized,
  rateBookController
);
