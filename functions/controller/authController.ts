import fs from 'fs';
import path from 'path';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { IRequest } from '../utils/interfaces';
import bcrypt from 'bcrypt';
import User from '../model/userModel';
import Token from '../model/token';
import { uploadToCloudinary } from '../utils/cloudinary';
import { nodeTransport } from '../utils/nodemailer';
import { randomBytes } from 'crypto';

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

export const uploadProfileImageController = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { file, userId } = req;
  // steps to follow
  /* 
   1. upload image to coludinary
   2. if successful delete the image locally 
   3, generate the image url 
   4. change the new image url to the user image url
   
   *NB: the controller works well locallly but not remotely
  
  */
  try {
    const imageUrl = file!.path;
    const user = await User.findById(userId);

    const uploadUrl = await uploadToCloudinary(
      imageUrl,
      `Neebook_${user?.firstName}_${user?.lastName}_${userId}`
    );

    fs.unlink(
      path.join(__dirname, '..', '..', '..', '..', '..', imageUrl),
      (err) => {
        if (err) {
          console.log(err);
        }
      }
    );
    if (!user?.imageUrl) {
      user!.imageUrl = uploadUrl;
      user?.save();
    }
    res.status(200).json({ message: 'Profile image upload successfully' });
  } catch (error) {
    next(error);
  }
};

export const sendVerificationEmailController = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const verifyToken = randomBytes(16).toString('hex');
  try {
    const user = await User.findById(userId);
    const token = new Token({
      userId,
      value: verifyToken,
    });
    await token.save();

    await nodeTransport.sendMail({
      from: 'Samsonoyebamiji02@outlook.com',
      to: user?.email as string,
      subject: 'Verify you email',
      html: `<h1 style="font-family:poppins; text-align:center"> Verify your email to complete your registration process</h1> <p style="font-family:poppins; text-align:center">To complete your regustartion process email verification is required. Click the link below to verify your email </p> <p style="font-family:poppins; text-align:center"><a style="font-family:poppins; text-align:center"  href="https://neebook-server.netlify.app/verify-email/${userId}/${verifyToken}" target="_blank"> Verify Email</a></p>`,
    });

    res.status(200).json({ message: 'Email verification request successful' });
  } catch (error) {
    next(error);
  }

  /* 
  TODO:
  * generate a token and save it so you can come back to check it when the user comes back
  * configure sending email to the user,s email
  */
};
