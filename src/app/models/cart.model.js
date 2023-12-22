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
        product_name: {
          type: String,
        },
        product_image: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        is_checked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totals: {
      type: Array,
      default: [
        {
          code: "subtotal",
          title: "Thành tiền",
          price: 0,
        },
        {
          code: "grand_total",
          title: "Tổng Số Tiền (gồm VAT)",
          price: 0,
        },
      ],
    },
  },
  { timestamps: true, versionKey: false }
);
cartSchema.plugin(mongoosePaginate);
export default mongoose.model("Cart", cartSchema);
