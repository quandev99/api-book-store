'use strict';

import otpModel from "../app/models/otp.model"
const crypto = await import("node:crypto");
const generatorTokenRandom = () =>{
  const token = crypto.randomInt(0,Math.pow(2,32))
  return token
}
const newOtpService = async ( {email})=>{
  const token = generatorTokenRandom();
  const newToken = await otpModel.create({
    otp_token: token,
    otp_email: email,
  })
  return newToken;
}
const getOtpService = async ( {email})=>{
  const otpUser = await otpModel.findOne({
    otp_email: email,
  }).lean()
  return otpUser;
}

export { newOtpService, getOtpService };