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
          user: userId,
          publicKey,
          privateKey,
          $push: { refreshToken },
          refreshTokensUsed: [],
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
  };
  static findByUserId = async ({ userId }) => {
    return await keyTokenModel
      .findOne({ user: new Types.ObjectId(userId) })
      .lean();
  };
  static removeKeyById = async (_id) => {
    return await keyTokenModel.deleteOne(new Types.ObjectId(_id));
  };
  static findByRefreshTokensUsed = async (refreshToken) => {
    return await keyTokenModel
      .findOne({ refreshTokensUsed: refreshToken })
      .lean();
  };
  static findByRefreshToken = async (refreshToken) => {
    return await keyTokenModel.findOne({ refreshToken });
  };
  static deleteKeyById = async (userId) => {
     return await keyTokenModel.deleteOne({ user: new Types.ObjectId(userId) });
  };
  static async findOneAndUpdate(query, update, options) {
    try {
      const result = await keyTokenModel.findOneAndUpdate(
        query,
        update,
        options
      );
      return result;
    } catch (error) {
      throw new Error(`Error updating key token: ${error.message}`);
    }
  }
}



