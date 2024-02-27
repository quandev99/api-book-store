import jwt from "jsonwebtoken";
import { KeyTokenService } from "../../services/keyToken.service";
import { AuthFailureError, NotFoundError } from "../../core/errors.response";
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION_KEY: "authorization",
};

const verifyToken =async (req, res, next) => {
  try {
    const accessToken = req.headers[HEADER.AUTHORIZATION_KEY];
    if (!accessToken)
      throw new AuthFailureError("Invalid authorization request 1");
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new AuthFailureError("Invalid authorization request 2");
    const keyStore = await KeyTokenService.findByUserId({ userId });
    if (!keyStore) throw new NotFoundError("Not found key store");
    if (accessToken && keyStore) {
      jwt.verify(accessToken, keyStore.publicKey, (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            // Token has expired
            return res.status(401).json({ message: "Token has expired" });
          } else {
            // Token is not valid for some other reason (JsonWebTokenError: invalid signature,...)
            return res.status(403).json({ message: "Token is not valid" });
          }
        }

        // Check if the token has not yet expired
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTimeInSeconds) {
          return res.status(401).json({ message: "Token has expired" });
        }

        var user = JSON.stringify(decoded);
        req.user = user;
        next();
      });
    }
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: "Error server: " + error.message,
    });
  }
};
// Function to check if the user is a member
const verifyTokenMember = (req, res, next) => {
  try {
     verifyToken(req, res, () => {
       const data = req?.user;
       const auth = JSON.parse(data);
       if (auth) {
         if (auth.role !== undefined) {
           if (auth.role === 1 || auth.role == 0) {
             next();
           } else {
             res.status(403).json({
               message: "You do not have access as a member!",
             });
           }
         } else {
           res.status(403).json({
             message: "Role is not defined!",
           });
         }
       } else {
         console.log("User not defined.");
       }
     });
  } catch (error) {
    return res.status(error?.status || 500).json({
      success: false,
      message: "User error server: " + error.message,
    });
  }
 
};

const verifyTokenAndAdminAuth = (req, res, next) => {
  try {
    verifyToken(req, res, () => {
      const data = req?.user;
      const auth = JSON.parse(data);
      if (auth) {
        if (auth.role !== undefined) {
          if (auth.role == 0) {
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
  } catch (error) {
        return res.status(error?.status || 500).json({
          success: false,
          message: "User error server: " + error.message,
        });
  }
  
};

export { verifyToken, verifyTokenMember, verifyTokenAndAdminAuth };
