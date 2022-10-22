import { NextFunction, Response } from 'express';
import { IRequest } from '../utils/interfaces';
import User from '../model/userModel';
export const logoutController = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const user = await User.findById(userId);
  user!.accessToken = '';
  user!.save();
  res.status(200).json({ message: 'Logout successful' });
};
