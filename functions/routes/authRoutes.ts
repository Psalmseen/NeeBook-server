import { Router } from 'express';
import { logoutController } from '../controller/authController';
import { checkAccessTokenController } from '../controller/userController';
import { isAuthorized } from '../utils/passport';

export const authRouter = Router();

authRouter.get('/logout', isAuthorized, logoutController);
authRouter.get('/cookie', checkAccessTokenController);
