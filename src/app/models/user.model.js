import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseDelete from "mongoose-delete";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      // unique: true,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      required: true,
      // unique: true,
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
    image: {
      type: Object,
      default: {
        publicId: "ldvnzziuxspcy7rky8jp",
        url: "https://res.cloudinary.com/dboibmxrw/image/upload/v1697893125/ldvnzziuxspcy7rky8jp.jpg",
      },
    },
    active: { type: Boolean, default: true },
    googleId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
    },
    role: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    cart_id: {
      type: mongoose.Types.ObjectId,
      ref: "Cart",
      default: null,
    },
    favorite_id: {
      type: mongoose.Types.ObjectId,
      ref: "Favorite",
      default: null,
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