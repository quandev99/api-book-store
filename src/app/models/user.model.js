import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseDelete from "mongoose-delete";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    password: {
      type: String,
      required: true,
    },
    active: { type: Boolean, default: true },
    verify: {
      type: Boolean,
      default: false,
    },
    role: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    cart_id: {
      type: mongoose.Types.ObjectId,
      ref: "Cart",
      default:null
    },
  },
  { timestamps: true, versionKey: false }
);
userSchema.plugin(mongoosePaginate);
userSchema.plugin(mongooseDelete, {
  deleteAt: true,
  overrideMethods: "all",
});

export default mongoose.model("User", userSchema);