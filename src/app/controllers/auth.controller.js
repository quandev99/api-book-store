import UserModel from "../models/user.model";
import bcrypt from "bcryptjs";
import crypto from "crypto"; 
import { createTokenPair } from "../../until/jwtService";
import dotenv from "dotenv";
import { getInfoData } from "../../until/getInfo";
import { KeyTokenService } from "../../services/keyToken.service";
import { CREATED, OK, SuccessResponse } from "../../core/success.reponse";
import { AuthFailureError, BAD_REQUEST, ConflictResponse, ForBiddenError } from "../../core/errors.response";
import { verifyJWT } from "../auth/authUtils";
import { findByAuth } from "../../services/author.service";
dotenv.config();


export const register = async (req, res) => {
  const {email,name,password} = req.body
  try {
    const userExist = await UserModel.findOne({ email }).lean();
    if (userExist) {
      throw new ConflictResponse("Email đã tồn tại");
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      name,
      password: hashPassword,
    });
    if(user){
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");
      const keyStore = await KeyTokenService.createKeyToken({
        userId: user?.id,
        publicKey,
        privateKey,
      });
      if (!keyStore){
        throw new BAD_REQUEST("KeyStore error");
      }
      // Tạo token
      const tokens = await createTokenPair(
        {
          userId: user?._id,
          email,
          role:2,
        },
        publicKey,
        privateKey
      );
      return new CREATED({
        message: "Đăng ký thành công",
        metaData: {
          user: getInfoData({ fileds: ["_id", "name", "email"], object: user }),
          tokens,
        },
      }).send(res);
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error: "+ error.message,
    });
  }
};

export const login = async (req,res)=>{
  const { email, password, refreshToken=null } = req.body;
  try {
    const userExist = await UserModel.findOne({ email }).lean();
    if (!userExist) {
      throw new BAD_REQUEST("Email chưa đăng ký");
    }
    const match = await bcrypt.compare(password, userExist.password);
    if (!match) {
      throw new AuthFailureError("Password không khớp!");
    }
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
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
      // Remove _doc property from keyUpdate
      const { _doc, ...keyUpdateWithoutDoc } = keyUpdate.toObject();

      // Add accessToken to metaData
      const metaDataWithAccessToken = {
        ...keyUpdateWithoutDoc,
        accessToken: tokens?.accessToken,
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