import UserModel from "../models/user.model";
import bcrypt from "bcryptjs";
const crypto = await import('node:crypto');
import { createTokenPair } from "../../until/jwtService";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getInfoData } from "../../until/getInfo";
import { KeyTokenService } from "../../services/keyToken.service";
import { CREATED,  SuccessResponse } from "../../core/success.response";
import { AuthFailureError, BAD_REQUEST, ConflictResponse, ForBiddenError } from "../../core/errors.response";
import { verifyJWT } from "../auth/authUtils";
import { findByAuth } from "../../services/author.service";
import { sendEmailToken, sendEmailVerify } from "../../services/email.service";
import otpModel from "../models/otp.model";
dotenv.config();

export const checkAuthRegister = async (req, res) => {
  const {email} = req.body
  try {
    const userExist = await UserModel.findOne({
      email,
      verify: true,
      provider: "local",
    }).lean();
    if (userExist) {
      throw new ConflictResponse("Email đã tồn tại");
    }
    await sendEmailToken({email});
   
      return new SuccessResponse({
        message: "Vui lòng kiểm tra email của mình!",
        metaData: {
          token: 1,
        },
      }).send(res);

  } catch (error) {
    return res.status(error.status || 500).json({
      message: "Server error: 0"+ error.message,
    });
  }
};
export const verifyUser = async (req, res) => {
  const { token } = req.query;
  try {
    console.log("token", token);
    const otpUser = await otpModel.findOne({ otp_token: token }).lean();
    if (!otpUser || !otpUser?.otp_token == token) {
      throw new ConflictResponse("Token không hợp lệ");
    }
     const user = await UserModel.findOneAndUpdate(
       {
         email: otpUser.otp_email,
         verify: false,
       },
       { verify: true },
       { new: true }
     );
     if (!user) {
       throw new ConflictResponse("Xác nhận tài khoản của bạn thất bại");
     }
    await sendEmailVerify({ email: otpUser.otp_email ,user_name:user.name});

    return res.redirect(`${process.env.UR_CLIENT}/sign-in`);
  } catch (error) {
    return res.status(error.status || 500).json({
      message: "Server error 1: " + error.message,
    });
  }
};

export const register = async (req, res) => {
  const { email, name, password, confirmPassword } = req.body;
  if ((password!==confirmPassword)) return res.status(400).json({ message:"Nhập mật khẩu không khớp!"}) 
    try {
       const userExist = await UserModel.findOne({
         email,
         verify: true,
         provider: "local",
       }).lean();
      if (userExist) {
        throw new ConflictResponse("Tài khoản của bạn đã đăng ký!");
      }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
          email,
          name,
          password: hashPassword,
        });
        console.log("user ::", user);
        if (!user) {
          throw new BAD_REQUEST("Đăng ký tài khoản không thành công!");
        }
        // await sendEmailToken({ email });
        const privateKey = process.env.privateKey;
        const publicKey = process.env.publicKey;
        const keyStore = await KeyTokenService.createKeyToken({
          userId: user?.id,
          publicKey,
          privateKey,
        });
        if (!keyStore) {
          throw new BAD_REQUEST("KeyStore error");
        }
        // Tạo token
        const tokens = await createTokenPair(
          {
            userId: user?._id,
            email,
            role: 1,
          },
          publicKey,
          privateKey
        );
        await sendEmailToken({ email });
        throw new CREATED({
          message: "Vui lòng kiểm tra Email và xác thực tài khoản!",
        });
      
        // return new CREATED({
        //   message: "Đăng ký thành công vui lòng kiểm tra email để được xác thực!",
        //   metaData: {
        //     user: getInfoData({
        //       fileds: ["_id", "name", "email"],
        //       object: user,
        //     }),
        //     tokens,
        //   },
        // }).send(res);
    } catch (error) {
      console.error("error 2:: ", error);
      return res.status(error.status || 500).json({
        message: "Server error: " + error.message,
      });
    }
};

export const login = async (req,res)=>{
  const { email, password, refreshToken=null } = req.body;
  try {
    const userExist = await UserModel.findOne({
      email,
      provider: "local",
    }).lean();
    if (!userExist || !userExist.verify) {
      throw new BAD_REQUEST("Email chưa đăng ký hoặc chưa xác nhận!");
    }
    const match = await bcrypt.compare(password, userExist.password);
    if (!match) {
      throw new AuthFailureError("Password không khớp!");
    }
   const privateKey = process.env.privateKey;
   const publicKey = process.env.publicKey;
    // Tạo token
    const { _id: userId } = userExist;
    const tokens = await createTokenPair(
      {
        userId,
        email,
        role: userExist.role,
      },
      publicKey,
      privateKey
    );
    await KeyTokenService.createKeyToken({
      userId,
      refreshToken: tokens?.refreshToken,
      publicKey,
      privateKey,
    });
     return new SuccessResponse({
       message: "Đăng nhập thành công",
       metaData: {
         user: getInfoData({
           fileds: ["_id", "name", "email", "image"],
           object: userExist,
         }),
         tokens,
       },
     }).send(res);
  } catch (error) {
     return res.status(500).json({
       message: "Server error: " + error.message,
     });
  }

}

export const logout = async (req, res) => {
  try{
   const delKey = await KeyTokenService.removeKeyById(req.keyStore);
    if(!delKey) throw new AuthFailureError("Invalid key token provided for logout");
     return new SuccessResponse({
       message: "Logout thành công",
       metaData: delKey
     }).send(res);
  }catch(error) {
      return res.status(+error.status).json({
        message: error.message,
      });
  }
}

export const handlerRefreshToken = async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;
      const foundToken = await KeyTokenService.findByRefreshTokensUsed(
        refreshToken
      );
      if (foundToken) {
        const { userId, email } = await verifyJWT(
          refreshToken,
          foundToken.privateKey
        );
        console.log("foundToken --1:", { userId, email });
        const resultDel = await KeyTokenService.deleteKeyById(userId);
        if (resultDel.deletedCount === 0) throw new Error(`Error deleting key`);
        throw new ForBiddenError(
          "Something went wrong with the refresh token !!  Please try logging in again later"
        );
      }
      const holderToken = await KeyTokenService.findByRefreshToken(
        refreshToken
      );

      if (!holderToken) throw new AuthFailureError("User not registered 1!");

      const { userId, email } = await verifyJWT(
        refreshToken,
        holderToken?.privateKey
      );
      console.log("foundToken --2:", { userId, email });

      const foundAuth = await findByAuth({ email });

      if (!foundAuth) throw new AuthFailureError("User not registered 2!");

      // Tạo Token 1 cặp token mới
      const tokens = await createTokenPair(
        {
          userId: foundAuth?._id,
          email,
          role: foundAuth.role,
        },
        holderToken.publicKey,
        holderToken.privateKey
      );
      const keyUpdate = await KeyTokenService.findOneAndUpdate(
        { refreshToken: refreshToken },
        {
          $set: {
            refreshToken: tokens?.refreshToken,
          },
          $addToSet: {
            refreshTokensUsed: refreshToken,
          },
        },
        { new: true }
      );
      // Add accessToken to metaData
      const metaDataWithAccessToken = {
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
      };

      return new SuccessResponse({
        message: "RefreshToken thành công",
        metaData: metaDataWithAccessToken,
      }).send(res);
    } catch (error) {
      return res.status(+error.status || 500).json({
        message: error.message,
      });
    }
}