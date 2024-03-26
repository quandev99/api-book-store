import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const discountSchema = new mongoose.Schema(
  {
    discount_name: {
      type: String,
      require: true,
    },
    discount_code: {
      type: String,
      max: 30,
      require: true,
    },
    discount_content: {
      type: String,
    },
    discount_quantity: {
      type: Number,
      require: true,
    },
    discount_amount: {
      type: Number,
      require: true,
    },
    expiration_date: {
      type: Date,
      require: true,
    },
    min_purchase_amount: {
      type: Number,
      require: true,
    },
    discount_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    discount_used_by_users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isSpecial: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

discountSchema.plugin(mongoosePaginate);
export default mongoose.model("Discount", discountSchema);