import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const reviewSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    bill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },
    user_name: {
      type: String,
    },
    rating_start: {
      type: Number,
    },
    comment: {
      type: String,
      maxlength: 255,
    },
    images: {
      type: Array,
    },
  },
  { timestamps: true, versionKey: false }
);
reviewSchema.plugin(mongoosePaginate);
export default mongoose.model("Review", reviewSchema);
