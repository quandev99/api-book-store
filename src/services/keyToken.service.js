import keyTokenModel from "../app/models/keyToken.model"
import { Types } from "mongoose";

export class KeyTokenService {
  static createKeyToken = async ({
    userId,
    publicKey,
    privateKey,
    refreshToken,
  }) => {
    try {
      const filter = {
          user: userId,
        },
        update = {
          user:userId,
          publicKey,
          privateKey,
          refreshTokensUsed: [],
          refreshToken,
        },
        option = {
          upsert: true,
          new: true,
        };
      const tokens = await keyTokenModel.findOneAndUpdate(
        filter,
        update,
        option
      );
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error.message;
    }
  }
  static  findByUserId = async ({userId})=>{
    return await keyTokenModel.findOne({ user:new Types.ObjectId(userId) }).lean();
  }
  static  removeKeyById = async (_id)=>{
    return await keyTokenModel.deleteOne(new Types.ObjectId(_id));
  }
}



