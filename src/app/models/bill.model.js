import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const billSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bill_details: [
      {
        type: mongoose.Types.ObjectId,
        ref: "BillDetail",
        defaultValue: null,
      },
    ],
    bill_status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Confirmed",
        "Delivering",
        "Delivered",
        "Abort",
        "Completed",
      ],
      default: "Pending",
    },
    status: {
      type: Boolean,
      default: false,
    },
    payment_method: {
      type: String,
      enum: ["CashPayment", "OnlinePayment"],
      default: "CashPayment",
    },
    bill_note: {
      type: String,
    },
    bill_totalPrice: {
      type: Number,
      default: 0,
    },
    bill_totalOrder: {
      type: Number,
      default: 0,
    },
    bill_shipping_Address: {
      type: String,
    },
    bill_phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

billSchema.plugin(mongoosePaginate);

export default mongoose.model("Bill", billSchema);
