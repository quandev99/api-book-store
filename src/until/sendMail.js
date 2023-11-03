// import nodemailer from "nodemailer";
// import * as dotenv from "dotenv";

// dotenv.config();

// const sendMail = async ({ email, html, subject }) => {
//   let transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: process.env.MAIL, // generated ethereal user
//       pass: process.env.PASS_MAIL, // generated ethereal password
//     },
//   });

//   // send mail with defined transport object
//   let info = await transporter.sendMail({
//     from: '"Website thuê đồ cũ" <no-relply@rentality.com>', // sender address
//     to: email, // list of receivers
//     subject: subject, // Subject line
//     html: html, // html body
//   });

//   return info;
// };
// export default sendMail;
