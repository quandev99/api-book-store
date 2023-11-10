import UserModel from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt, { sign } from "jsonwebtoken";
import crypto from "crypto"; 
import { createTokenPair } from "../../until/jwtService";
import dotenv from "dotenv";
import { getInfoData } from "../../until/getInfo";
import { KeyTokenService } from "../../services/keyToken.service";
dotenv.config();

export const register = async (req, res) => {
  const {email,name,password} = req.body
  try {
    const userExist = await UserModel.findOne({ email }).lean();
    if (userExist) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
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
        return {
          message: "keyStore error",
        };
      }
      // Tạo token
      const tokens = await createTokenPair(
        {
          userId: user?.id,
          email,
        },
        publicKey,
        privateKey
      );
      return res.json({
        message: "Đăng ký thành công",
          user: getInfoData({ fileds: ["_id", "name", "email"], object: user }),
          tokens,
        });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Server error: "+ error.message,
    });
  }
};
