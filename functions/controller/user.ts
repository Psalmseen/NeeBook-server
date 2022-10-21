import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator/src/validation-result';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../model/User';
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
    });
    await user.save();
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_TOKEN_SECRET as Secret
    );
    user.accessToken = accessToken;
    await user.save();
    res.cookie('accessToken', accessToken);
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
