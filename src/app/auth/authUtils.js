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
    if (!userId) throw new AuthFailureError("Invalid authorization request 1");

    const keyStore = await KeyTokenService.findByUserId({ userId });
    if (!keyStore) throw new NotFoundError("Not found key store");

    const accessToken = req.headers[HEADER.AUTHORIZATION_KEY];
    if (!accessToken) throw new AuthFailureError("Invalid authorization request 2");

    const decodeUser = await verifyJWT(accessToken, keyStore.publicKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid user");
    req.keyStore = keyStore?._id;
    return next();
  } catch (error) {
    return res.status(+error.status || 500).json({
      message: error.message,
    });
  }
});


export const verifyJWT = async (token, keySecret) => {
  try {
    const decoded = await jwt.verify(token, keySecret);
    return decoded;
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Token đã hết hạn, trả về lỗi 401 Unauthorized
      throw new AuthFailureError("Token has expired");
    } else {
      // Các lỗi khác, bạn có thể xử lý tùy thuộc vào yêu cầu của bạn
      throw new AuthFailureError("Invalid token");
    }
  }
};
