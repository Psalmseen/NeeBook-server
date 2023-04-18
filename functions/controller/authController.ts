import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { IRequest } from '../utils/interfaces';
import bcrypt from 'bcrypt';
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
export const updateProfileCOntroller = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    userId,
    body: { firstName, lastName },
  } = req;
  if (!firstName && !lastName) {
    return res
      .status(400)
      .json({ message: 'Provide a first name or last name parameter' });
  }
  if (firstName) {
    if (typeof firstName !== 'string') {
      return res.status(400).json({ message: 'First name must be a string' });
    }
  }
  if (lastName) {
    if (typeof lastName !== 'string') {
      return res.status(400).json({ message: 'Last name must be a string' });
    }
  }
  const errors = validationResult(req);
  try {
    const user = await User.findById(userId);
    if (!errors.isEmpty()) {
      const error = errors.array({ onlyFirstError: true });
      return res.status(400).json({ message: error[0].msg });
    }
    if (firstName) {
      user!.firstName = firstName;
    }
    if (lastName) {
      user!.lastName = lastName;
    }
    user?.save();
    res
      .status(200)
      .json({ message: 'User detail has been successfully updated' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export const changePasswordController = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    userId,
    body: { oldPassword, newPassword },
  } = req;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.array({ onlyFirstError: true });
    return res.status(400).json({ message: error[0].msg });
  }
  try {
    const user = await User.findById(userId);

    const isEqual = await bcrypt.compare(oldPassword, user?.password as string);

    if (!isEqual) {
      return res.status(403).json({ message: 'Incorrect password' });
    }
    const newEncryptedPassword = await bcrypt.hash(newPassword, 12);
    user!.password = newEncryptedPassword;
    user?.save();
    res.status(200).json({ message: 'Password update successful' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
