"use strict";
import mongoose from "mongoose";

const otpSchema = mongoose.Schema(
  {
    otp_token: {
      type: String,
      required: true,
    },
    otp_email: {
      type: String,
      required: true,
    },
    otp_status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "block"],
    },
    expireAt: { type: Date, default: Date.now(), expires: 300 },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Otp", otpSchema);
