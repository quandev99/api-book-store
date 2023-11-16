import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const billDetailSchema = new mongoose.Schema(
  {
    bill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
    },
    product_image: {
      type: String,
    },
    product_name: {
      type: String,
    },
    quantity: {
      type: Number,
    },
    price: {
      type: Number,
    },
  },
  { timestamps: true, versionKey: false }
);

billDetailSchema.plugin(mongoosePaginate);

export default mongoose.model("BillDetail", billDetailSchema);
