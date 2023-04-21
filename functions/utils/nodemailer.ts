import nodemailer from 'nodemailer';
import smtp from 'nodemailer-smtp-transport';

//  DIDnt wotk
// export const getNodeTransport = async () => {
//   const testAccount = await nodemailer.createTestAccount();
//   console.log(testAccount);
//   return nodemailer.createTransport(
//     smtp({
//       host: 'smtp.ethereal.email',
//       port: 587,
//       auth: {
//         user: testAccount.user, // generated ethereal user
//         pass: testAccount.pass, // generated ethereal password
//       },
//     })
//   );
// };
// for  mailtrap
export const nodeTransport = nodemailer.createTransport(
  smtp({
    // host: 'sandbox.smtp.mailtrap.io' /* 'in.mailjet.com' */,
    // port: 2525,
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  })
);
