import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator/src/validation-result';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../model/userModel';
import Token from '../model/token';
import { IRequest } from '../utils/interfaces';
import { randomBytes } from 'crypto';
import { nodeTransport } from '../utils/nodemailer';

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
      emailVerified: false,
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
    // const {
    //   accessToken: userToken,
    //   password: userPassword,
    //   ...frontendUser
    // } = user.toJSON();
    res.status(200).json({ message: 'Signup successful' });
  } catch (error) {
    next(error);
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
      return res.status(403).json({ message: 'Email incorrect' });
    }
    const isEqual = await bcrypt.compare(password, user.password as string);
    if (!isEqual) {
      return res.status(403).json({ message: 'Password incorrect' });
    }

    if (!user.emailVerified) {
      return res.status(401).json({
        message: 'Email not verified. Verify email before proceeding to login',
      });
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
      secure: true,
      sameSite: 'none',
    });
    res.status(200).json({
      message: 'Login successful',
      user: { ...frontendUser },
    });
  } catch (error) {
    next(error);
  }
};

export const checkAccessTokenController = async (req: any, res: any) => {
  const { accessToken } = req.cookie;
  res.status(200).json({ accessToken });
};

export const verifyEmailController = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { token, id } = req.params;
  const storedToken = await Token.findOne({ userId: id, value: token });
  if (!storedToken) {
    return res.status(403);
  }
  storedToken.delete();
  const user = await User.findById(id);
  user!.emailVerified = true;
  user?.save();

  res.status(200).redirect('https://google.com');
};
export const requestForgetpassword = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.array({ onlyFirstError: true });
    return res.status(400).json({ message: error[0].msg });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'User email not found' });
    }
    const forgetPasswordToken = randomBytes(16).toString('hex');
    const token = new Token({
      userId: user._id,
      value: forgetPasswordToken,
    });
    token.save();
    const info = await nodeTransport.sendMail({
      from: 'Neebook Team samsonoyebamiji02@gmail.com',
      to: user?.email as string,
      subject: 'Request reset password',
      html: `
      <div style="max-width: 600px;  padding: 48px 24px; border-radius:8px; box-shadow:0 0 60px #0001">
        <h1 style="font-family:Helvetica; color:#1d252d; margin-top:0">NEEBOOK</h1>
        <h1 style="font-family:Helvetica; color:#1d252d">Reset Password</h1>
        <p style="font-family:Helvetica; color:#9B9AA1; font-size: 20px; line-height:1.7">Hello <span style="text-transform: capitalize">${user?.firstName} ${user?.lastName}</span> ! You have requested a reset password. <br/>To continue click the link below to change  your Password</p>
        <a style="font-family:Helvetica; color:#9B9AA1; font-size: 20px; display:block; text-decoration:none; background:#38A169; color: #E4FDFF; padding: 16px; border-radius: 8px; text-align:center" href="https://neebook-server.netlify.app/verify-reset-password/${user._id}/${forgetPasswordToken}" target="_blank"> Reset password</a>
        </div>
       `,
    });
    res.status(200).json({
      message:
        'An Email has been sent to you check your Email to complet the process',
    });
  } catch (error) {
    next(error);
  }

  /*
STEPSs

-Accept the user email from the request body
- Check if the email is found
generate a token for editing the password and save the token
send email the user
- redirect to the new password page on frontend if reset password token is valid abd sebd the access and rese token to the front end
verify the token and update new password

*/
};
export const verifyResetPasswordController = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { id, token } = req.params;
  const storedToken = await Token.findOne({ userId: id, value: token });
  if (!storedToken) {
    return res.status(403);
  }
  res.cookie('resetPasswordToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.cookie('resetPasswordId', id, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.redirect('http://localhost:3000');
};

export const setNewPasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {
    cookies: { resetPasswordId, resetPasswordToken },
    body: { password },
  } = req;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.array({ onlyFirstError: true });
    return res.status(400).json({ message: error[0].msg });
  }
  try {
    const storedToken = await Token.findOne({
      userId: resetPasswordId,
      value: resetPasswordToken,
    });
    if (!storedToken) {
      return res.status(403);
    }
    storedToken.delete();

    const encryptedPassword = await bcrypt.hash(password, 12);
    const user = await User.findById(resetPasswordId);
    user!.password = encryptedPassword;
    user?.save();
    res.status(200).json({
      message:
        'Password Updated successfully Please log in your account with the new password',
    });
  } catch (error) {
    next(error);
  }
};
