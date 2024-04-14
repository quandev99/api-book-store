import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import compression from "compression";
import connectMongoose from "./config/db";
import rootRouter from "./routes";
import session from "express-session";
import passport from "passport";
dotenv.config();

const app = express();

// middleware
// Sử dụng middleware body-parser để xử lý dữ liệu POST
// Use Helmet!
app.use(helmet());
app.use(bodyParser.json()); // Xử lý dữ liệu JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("tiny"));
app.use(compression({ level: 6, threshold: 1024 })); // compress data if payload is too large
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
//passport
app.use(
  session({
    secret: "bookstore",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      maxAge: 30 * 60 * 1000, // Thời gian hết hạn cho phiên (30 phút)
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Router
app.use("/api", rootRouter);
connectMongoose();
export const viteNodeApp = app;