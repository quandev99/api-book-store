import UserModel from "../models/user.model";
import { Strategy as GoogleStrategy } from "passport-google-oauth2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { sendEmailToken, sendEmailVerify } from "../../services/email.service";
import jwt from "jsonwebtoken";
import passport from "passport";
import dotenv from "dotenv";
import { KeyTokenService } from "../../services/keyToken.service";
import { createTokenPair } from "../../until/jwtService";
import { SuccessResponse } from "../../core/success.response";
import { getInfoData } from "../../until/getInfo";
dotenv.config();
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.Google_CLIENT_ID,
      clientSecret: process.env.Google_CLIENT_SECRET,
      callbackURL: `${process.env.UR_ADMIN}/oauth/google/callback`,
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      const isExitUser = await UserModel.findOne({
        googleId: profile.id,
        provider: "google",
      });
      if (isExitUser) {
        const privateKey = process.env.privateKey;
        const publicKey = process.env.publicKey;
        const tokens = await createTokenPair(
          {
            userId: isExitUser?._id,
            email: isExitUser?.email,
            role: isExitUser.role,
          },
          publicKey,
          privateKey
        );
        await KeyTokenService.createKeyToken({
          userId: isExitUser?._id,
          refreshToken: tokens?.refreshToken,
          publicKey,
          privateKey,
        });
        const metaData = {
          user: getInfoData({
            fileds: ["_id", "name", "email", "image"],
            object: isExitUser,
          }),
          tokens,
        };
        const encodedToken = JSON.stringify(metaData);
        return done(null, { user: isExitUser, accessToken: encodedToken });
      } else {
        try {
          // Thử chèn một tài khoản mới
          const newUser = new UserModel({
            provider: profile?.provider,
            googleId: profile?.id,
            name: profile?.name?.givenName,
            email: profile?.emails[0]?.value,
            image: {
              url: profile.picture,
              publicId: null,
            },
            password: "đăng nhập bằng google!",
            verify: true,
          });
          await newUser.save();

          const privateKey = process.env.privateKey;
          const publicKey = process.env.publicKey;
          const keyStore = await KeyTokenService.createKeyToken({
            userId: newUser?.id,
            publicKey,
            privateKey,
          });
          if (!keyStore) {
            throw new BAD_REQUEST("KeyStore error");
          }
          // Tạo token
          const tokens = await createTokenPair(
            {
              userId: newUser?._id,
              email: newUser?.email,
              role: 1,
            },
            publicKey,
            privateKey
          );
          await sendEmailVerify({
            email: newUser?.email,
            user_name: newUser?.name,
          });
          const metaData = {
            user: getInfoData({
              fileds: ["_id", "name", "email", "image"],
              object: newUser,
            }),
            tokens,
          };
          const encodedToken = JSON.stringify(metaData);
          done(null, { user: isExitUser, accessToken: encodedToken });
        } catch (error) {
          console.log("Failed to create ", error);
          // Xử lý lỗi chèn (trường hợp trùng lặp)
          if (error.code === 11000) {
            return done(null, false, { message: "Tài khoản đã tồn tại" });
          } else {
            // Xử lý các lỗi khác
            return done(error);
          }
        }
      }
    }
  )
);



passport.serializeUser(({ user, accessToken }, done) => {
  done(null, { user, accessToken });
});
passport.deserializeUser(({ user, accessToken }, done) => {
  done(null, { user, accessToken });
});

export const LoginWithGoogle = async (req, res) => {
  const { accessToken} = req.user;
  res.redirect(`${process.env.UR_CLIENT}/?token=${accessToken}`);
};

export const LogoutGoogle = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.redirect(process.env.UR_CLIENT);
    }
    res.redirect(process.env.UR_CLIENT);
  });
};

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.Facebook_CLIENT_ID,
      clientSecret: process.env.Facebook_CLIENT_SECRET,
      callbackURL: `${process.env.UR_ADMIN}/oauth/facebook/callback`,
      profileFields: ["id", "name", "profileUrl", "photos", "email"],
      // passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, cb) => {
      const isExitUser = await UserModel.findOne({
        facebookId: profile.id,
        provider: "facebook",
      });
      if (isExitUser) {
        const privateKey = process.env.privateKey;
        const publicKey = process.env.publicKey;
        const tokens = await createTokenPair(
          {
            userId: isExitUser?._id,
            email: isExitUser?.email,
            role: isExitUser.role,
          },
          publicKey,
          privateKey
        );
        await KeyTokenService.createKeyToken({
          userId: isExitUser?._id,
          refreshToken: tokens?.refreshToken,
          publicKey,
          privateKey,
        });
        const metaData = {
          user: getInfoData({
            fileds: ["_id", "name", "email", "image"],
            object: isExitUser,
          }),
          tokens,
        };
        const encodedToken = JSON.stringify(metaData);
        return cb(null, { user: isExitUser, accessToken: encodedToken });
      } else {
        try {
          // Thử chèn một tài khoản mới
          const newUser = new UserModel({
            provider: profile?.provider,
            facebookId: profile?.id,
            name: profile?.name?.givenName,
            email: profile?.emails[0].value,
            image: {
              url: profile?.photos[0].value,
              publicId: null,
            },
            password: "đăng nhập bằng facebook!",
            verify: true,
          });
          await newUser.save();

          const privateKey = process.env.privateKey;
          const publicKey = process.env.publicKey;
          const keyStore = await KeyTokenService.createKeyToken({
            userId: newUser?.id,
            publicKey,
            privateKey,
          });
          if (!keyStore) {
            throw new BAD_REQUEST("KeyStore error");
          }
          // Tạo token
          const tokens = await createTokenPair(
            {
              userId: newUser?._id,
              email: newUser?.email,
              role: 1,
            },
            publicKey,
            privateKey
          );
          await sendEmailVerify({
            email: newUser?.email,
            user_name: newUser?.name,
          });
          const metaData = {
            user: getInfoData({
              fileds: ["_id", "name", "email", "image"],
              object: newUser,
            }),
            tokens,
          };
          const encodedToken = JSON.stringify(metaData);
          cb(null, { user: isExitUser, accessToken: encodedToken });
        } catch (error) {
          console.log("Failed to create ", error);
          // Xử lý lỗi chèn (trường hợp trùng lặp)
          if (error.code === 11000) {
            return cb(null, false, { message: "Tài khoản đã tồn tại" });
          } else {
            // Xử lý các lỗi khác
            return cb(error);
          }
        }
      }
    }
  )
);
// export const LoginWithFacebook = (req, res) => {
//   const { accessToken } = req.user;
//   console.log("OAuth facebook accessToken", accessToken);
//   res.redirect(`${process.env.UR_CLIENT}/?token=${accessToken}`);
// };

export const LoginWithFacebook = (req, res) => {
  const { accessToken } = req.user;
  // Loại bỏ phần hash fragment '#_=_'
  const sanitizedAccessToken = accessToken.replace(/#_=_/, "");

  try {
    // Kiểm tra và parse JSON
    const parsedToken = JSON.parse(decodeURIComponent(sanitizedAccessToken));
    // Lấy phần URL trước hash fragment
    const clientRedirectUrl = process.env.UR_CLIENT.split("#")[0];
    // Chuyển tiếp đến client với accessToken đã được sanitize
    res.redirect(
      `${clientRedirectUrl}/?token=${encodeURIComponent(
        JSON.stringify(parsedToken)
      )}`
    );
  } catch (error) {
    console.error("Failed to parse accessToken:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to parse accessToken" });
  }
};

