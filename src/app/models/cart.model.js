import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    products: [
      {
        product_id: {
          type: mongoose.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        product_price: {
          type: Number,
          default: 1,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    cart_totalPrice: {
      type: Number,
      default: 0,
    },
    cart_totalOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, versionKey: false }
);
cartSchema.plugin(mongoosePaginate);
export default mongoose.model("Cart", cartSchema);
