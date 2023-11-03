import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseDelete from "mongoose-delete";

const publisherSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    founded: {
      type: String,
    },
    image: {
      type: Object,
      default: {
        publicId: "ldvnzziuxspcy7rky8jp",
        url: "https://res.cloudinary.com/dboibmxrw/image/upload/v1697893125/ldvnzziuxspcy7rky8jp.jpg",
      },
    },
    address: {
      type: String,
    },
    phone_number: {
      type: String,
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

publisherSchema.plugin(mongoosePaginate);
publisherSchema.plugin(mongooseDelete, {
  deleteAt: true,
  overrideMethods: "all",
});

export default mongoose.model("Publisher", publisherSchema);
