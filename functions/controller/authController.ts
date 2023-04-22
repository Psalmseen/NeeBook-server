import fs from 'fs';
import path from 'path';
import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { IRequest } from '../utils/interfaces';
import bcrypt from 'bcrypt';
import User from '../model/userModel';
import Token from '../model/token';
import Book from '../model/bookModel';
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

    const info = await nodeTransport.sendMail({
      from: 'Samsonoyebamiji02@gmail.com',
      to: user?.email as string,
      subject: 'Verify you email',
      html: `
      <div style="max-width: 600px;  padding: 48px 24px; border-radius:8px; box-shadow:0 0 60px #0001">
        <h1 style="font-family:Helvetica; color:#1d252d; margin-top:0">NEEBOOK</h1>
        <h1 style="font-family:Helvetica; color:#1d252d">Verify your email</h1>
        <p style="font-family:Helvetica; color:#9B9AA1; font-size: 20px; line-height:1.7">Hello <span style="text-transform: capitalize">${user?.firstName} ${user?.lastName}</span> ! To complete your registration email verification is required. <br/>Click the link below to verify your Email</p>
        <a style="font-family:Helvetica; color:#9B9AA1; font-size: 20px; display:block; text-decoration:none; background:#38A169; color: #E4FDFF; padding: 16px; border-radius: 8px; text-align:center" href="https://neebook-server.netlify.app/verify-email/${userId}/${verifyToken}" target="_blank"> Verify email</a>
        </div>
       `,
    });

    res.status(200).json({
      message: 'Email verification request successful',
      messageID: info.messageId,
    });
  } catch (error) {
    next(error);
  }

  /* 
  TODO:
  * generate a token and save it so you can come back to check it when the user comes back
  * configure sending email to the user,s email
  */
};

export const rateBookController = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { bookId, rating } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = errors.array({ onlyFirstError: true });
    return res.status(400).json({ message: error[0].msg });
  }

  try {
    const book = await Book.findById(bookId);

    if (!book) {
      return res
        .status(404)
        .json({ message: 'Book not found please provide a valid book id' });
    }

    const originalReviewers = book.reviewedBy;
    const originaltotalReviews = book.totalReviews;
    const newReviewers = originalReviewers + 1;
    let newReview = (originaltotalReviews + rating) / newReviewers;
    newReview = Math.round(newReview * 10) / 10;
    book.review = newReview;
    book.reviewedBy = newReviewers;
    book.totalReviews = originaltotalReviews + rating;
    await book.save();
    res.status(200).json({
      message: 'Successful',
      book,
    });
  } catch (error) {
    next(error);
  }
};
