import nodemailer from 'nodemailer';
import smtp from 'nodemailer-smtp-transport';

export const nodeTransport = nodemailer.createTransport(
  smtp({
    host: 'sandbox.smtp.mailtrap.io' /* 'in.mailjet.com' */,
    port: 2525,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  })
);
