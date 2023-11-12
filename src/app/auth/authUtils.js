import jwt from "jsonwebtoken";
import { AuthFailureError, NotFoundError } from "../../core/errors.response";
import asyncHandler from "../../helpers/asyncHandler";
import { KeyTokenService } from "../../services/keyToken.service";
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION_KEY: "authorization",
};
export const authentication = asyncHandler( async (req, res, next) => {
  try {
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid authorization request");

    const keyStore = await KeyTokenService.findByUserId({ userId });
    if (!keyStore) throw new NotFoundError("Not found key store");

    const accessToken = req.headers[HEADER.AUTHORIZATION_KEY];
    if (!accessToken) throw new AuthFailureError("Invalid authorization request");

    const decodeUser = jwt.verify(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid user");
    req.keyStore = keyStore?._id;
    return next();
  } catch (error) {
    return res.status(+error.status).json({
      message: error.message,
    });
  }
});
