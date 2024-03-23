'use strict';

import { ConflictResponse, NotFoundError } from "../core/errors.response";
import { replacePlaceHolder } from "../until";
import sendMail from "../until/sendMail";
import { getOtpService, newOtpService } from "./otp.service";
import { getTemplateService } from "./template.service";


const sendEmailToken = async ({email=null})=>{
  try {
    const otpUser = await getOtpService({email})
    if (otpUser) {
      const isTimeValid = (new Date() - otpUser.createdAt) / (1000 * 60) >= 1;
      if (!isTimeValid) {
        throw new NotFoundError("Vui lòng đợi thêm.");
      }
      throw new ConflictResponse("Token đã được gửi.");
    }
    const token = await newOtpService({ email });

    const template = await getTemplateService({template_name: 'HTML EMAIL TOKEN'});
    if(!template) throw new NotFoundError('Template not found');
    const content = replacePlaceHolder(template.template_html, {
      link_verify: `${process.env.UR_ADMIN}/auths/verifyUser?token=${token.otp_token}`,
    });
    const sendEmailToken = await sendMail({
      email: token.otp_email,
      html: content,
      subject:"Book Store gửi mã OTP xác nhận email của bạn!!!"
    });
    return sendEmailToken;
  } catch (error) {
    throw new Error(`${error.message}`)
  }
}
const sendEmailVerify = async ({email=null,user_name="Cute"})=>{
  try {
    const template = await getTemplateService({template_name: 'HTML EMAIL THANK'});
    if(!template) throw new NotFoundError('Template not found');
    const content = replacePlaceHolder(template.template_html, {
      user_name,
      link_website: `${process.env.UR_CLIENT}`,
    });
    const sendEmailToken = await sendMail({
      email: email,
      html: content,
      subject: "Chúc mừng bạn đã đăng ký thành công!",
    });
    return sendEmailToken;
  
  } catch (error) {
    throw new Error(`${error.message}`)
  }
}

export { sendEmailToken, sendEmailVerify };
