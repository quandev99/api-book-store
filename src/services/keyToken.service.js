import keyTokenModel from "../app/models/keyToken.model"


export class KeyTokenService {
  static createKeyToken = async ({userId, publicKey, privateKey}) => {
    try {
      const token = await keyTokenModel.create({
        user: userId,
        publicKey,
        privateKey,
      });
      return token ? token.publicKey : null;
    } catch (error) {
      return error.message;
    }
  };
}

