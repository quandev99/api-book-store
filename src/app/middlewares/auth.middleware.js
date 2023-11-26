import jwt from "jsonwebtoken";
import { KeyTokenService } from "../../services/keyToken.service";
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION_KEY: "authorization",
};

const verifyToken =async (req, res, next) => {
  const token = req.headers[HEADER.AUTHORIZATION_KEY];
  if (!token)
  throw new AuthFailureError("Invalid authorization request 2");
    const keyStore = await KeyTokenService.findByUserId({ userId });
    if (!keyStore) throw new NotFoundError("Not found key store");
  if (token) {
    // const token = token.split(" ")[1];
    jwt.verify(token, keyStore.publicKey, (err, decoded) => {
      if (err) {
        return res.status(403).json("Token is not valid");
      }
      var user = JSON.stringify(decoded);
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("You're not authenticated");
  }
};

const verifyTokenAndAdminAuth = (req, res, next) => {
  verifyToken(req, res, () => {
    const data = req?.user;
    const auth = JSON.parse(data);
    console.log("Authenticated",auth);
    if (auth) {
      if (auth.role !== undefined) {
        if (auth.role == 1 || auth.role == 0) {
          next();
        } else {
          res.status(403).json({
            message: "You do not have access to the admin page!",
          });
        }
      } else {
        res.status(403).json({
          message: "khong ton tai!",
        });
      }
    } else {
      console.log("Người dùng không được xác định.");
    }
  });
};

export  { verifyToken, verifyTokenAndAdminAuth };
