import jwt from "jsonwebtoken";
const HEADER = {
  API_KEY: "x-api-key",
  AUTHORIZATION_KEY: "authorization",
};

const verifyToken = (req, res, next) => {
  const token = req.headers[HEADER.AUTHORIZATION_KEY];
  if (!token)
  throw new AuthFailureError("Invalid authorization request 2");
  if (token) {
    // const token = token.split(" ")[1];
    jwt.verify(
      token,
      "3543440fd88a6c479f6d950403ee4c0c03567c2a89f1b3aa8f85dbe902b99f9532d89ddf1ad7759afcf73b64a2ee1dcf0c0995dd7b01257e53004cde1255cd01",
      (err, decoded) => {
        if (err) {
          return res.status(403).json("Token is not valid");
        }
        var user = JSON.stringify(decoded);
        req.user = user;
        next();
      }
    );
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
