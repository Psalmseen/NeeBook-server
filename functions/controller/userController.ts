import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator/src/validation-result';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../model/userModel';

export const signupController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  const { firstName, lastName, email, password } = req.body;
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400).json({ message: 'User already exist' });
  }
  if (!errors.isEmpty()) {
    const error = errors.array({ onlyFirstError: true });
    return res.status(400).json({ message: error[0].msg });
  }
  try {
    const encryptedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: encryptedPassword,
      accessToken: '',
    });
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_TOKEN_SECRET as Secret
    );
    user.accessToken = accessToken;
    await user.save();
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });
    const {
      accessToken: userToken,
      password: userPassword,
      ...frontendUser
    } = user.toJSON();
    res.status(200).json({ message: 'Successful', user: { ...frontendUser } });
  } catch (error) {
    console.log(error);
  }
};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.array({ onlyFirstError: true });
    return res.status(400).json({ message: error[0].msg });
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(403).json({ message: 'Email or password incorrect' });
    }
    const isEqual = await bcrypt.compare(password, user.password as string);
    if (!isEqual) {
      return res.status(403).json({ message: 'Email or password incorrect' });
    }
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_TOKEN_SECRET as Secret
    );
    user.accessToken = accessToken;
    await user.save();
    const {
      accessToken: userToken,
      password: userPassword,
      ...frontendUser
    } = user.toJSON();
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
    });
    res
      .status(200)
      .json({ messgae: 'Login successful', user: { ...frontendUser } });
  } catch (error) {}
};
