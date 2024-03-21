'use strict';

import { ConflictResponse, NotFoundError } from "../core/errors.response";
import { SuccessResponse } from "../core/success.response";
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
      link_verify: `http://localhost:2605/api/auths/verifyUser?token=${token.otp_token}`,
    });
    const sendEmailToken = await sendMail({
      email: token.otp_email,
      html: content,
      subject:"Xác nhận email!"
    });
    return sendEmailToken;
  
  } catch (error) {
    throw new Error(`${error.message}`)
  }
}
const sendEmailVerify = async ({email=null})=>{
  try {

    // const template = await getTemplateService({template_name: 'HTML EMAIL TOKEN'});
    // if(!template) throw new NotFoundError('Template not found');
    // const content = replacePlaceHolder(template.template_html, {
    //   link_verify: `http://localhost:2605/api/verifyUser?token=${token.otp_token}`,
    // });
    const sendEmailToken = await sendMail({
      email: email,
      html: "<div>Chúc bạn quân đẹp trai giàu có!</div>",
      subject: "Chúc mừng bạn đã đăng ký thành công!",
    });
    return sendEmailToken;
  
  } catch (error) {
    throw new Error(`${error.message}`)
  }
}

export { sendEmailToken, sendEmailVerify };
