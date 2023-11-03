import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseDelete from "mongoose-delete";

const supplierSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
    },
    contact: {
      type: String,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);
supplierSchema.plugin(mongoosePaginate);supplierSchema.plugin(mongooseDelete, {
  deleteAt: true,
  overrideMethods: "all",
});

export default mongoose.model("Supplier", supplierSchema);
