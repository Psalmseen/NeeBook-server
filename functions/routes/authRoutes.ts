import { Router } from 'express';
import { logoutController } from '../controller/authController';
import { isAuthorized } from '../utils/passport';

export const authRouter = Router();

authRouter.get('/logout', isAuthorized, logoutController);
