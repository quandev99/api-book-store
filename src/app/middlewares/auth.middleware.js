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
      "2e55c7e40f5ebf68843fa3704d843ea3964160ee4c4e53471d5dc82cd502939bec178862d7df4362b70a88f938aeef4fa6942e1c06950f7e4d31c9d3a62f648a",
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
