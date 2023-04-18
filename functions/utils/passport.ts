import { Response, NextFunction } from 'express';
import { IRequest } from './interfaces';
import User from '../model/userModel';

export const isAuthorized = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { accessToken } = req.cookies;

  const user = await User.findOne({ accessToken });

  if (!user) {
    return res
      .status(403)
      .json({ message: 'You need to be logged in to access this route' });
  }
  req.userId = user._id.toString();
  next();
};
