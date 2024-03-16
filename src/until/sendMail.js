import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config();

const sendMail = async ({ email, html, subject }) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_SENDER, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Book Store 😘" ${process.env.EMAIL_SENDER}`,
    to: email, 
    subject: subject, 
    html: html, // html body
  });

  return info;
};
export default sendMail;
