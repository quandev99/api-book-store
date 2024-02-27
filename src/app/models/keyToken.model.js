// user_id: String,
//   token: String,
//   expiration_time: Date,
//   is_verified: { type: Boolean, default: false },



import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseDelete from "mongoose-delete";

const keysTokenSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    publicKey: {
      type: String,
      required: true,
    },
    privateKey: {
      type: String,
      required: true,
    },
    refreshTokensUsed: {
      type: Array,
      default: [], // token đã sử dụng
    },
    refreshToken: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);
keysTokenSchema.plugin(mongoosePaginate);
keysTokenSchema.plugin(mongooseDelete, {
  deleteAt: true,
  overrideMethods: "all",
});

export default mongoose.model("Key", keysTokenSchema);
