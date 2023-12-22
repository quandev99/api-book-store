import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await jwt.sign(payload, publicKey, {
      expiresIn: "2days",
    });

    const refreshToken = await jwt.sign(payload, privateKey, {
      expiresIn: "7 days",
    });

    jwt.verify(accessToken, publicKey, (err, decode) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decode verify::`, decode);
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};

// tạo access token
// export const generalAccessToken = (payload) => {
//   const accessToken = jwt.sign({ _id: payload._id }, process.env.SECRET_KEY, {
//     expiresIn: "1h",
//   });
//   return accessToken;
// };

// // tạo refresh token
// export const generalRefreshToken = (payload) => {
//   const refreshToken = jwt.sign(
//     { _id: payload._id },
//     process.env.JWT_RFT_PRIVATE,
//     {
//       expiresIn: "7d",
//     }
//   );
//   return refreshToken;
// };

// // xác thực token có hợp lệ hay không để refresh token
// export const refreshTokenService = (token) => {
//   const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
//   return verifyToken;
// };

// // kiểm tra mã xác minh thông báo email để lấy mã đặt lại mật khẩu
// export const generalVerifyToken = (payload) => {
//   const verifyToken = jwt.verify(payload.accessToken, payload.privateKey);
//   return verifyToken;
// };
