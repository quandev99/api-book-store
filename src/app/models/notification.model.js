import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const notificationSchema = new Schema(
  {
    title: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["order", "cancel_order", "order_success", "discount_code"],
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    user: {
      _id: String,
      name: String,
      phone: String,
    },
    content: {
      type: String,
      required: true,
    },
    url: String,
    seen_status: {
      type: Number,
      default: 0,
      enum: [0, 1],
    },
  },
  { versionKey: false, timestamps: true }
);

notificationSchema.plugin(mongoosePaginate);
export default mongoose.model("Notification", notificationSchema);
