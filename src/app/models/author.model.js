import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseDelete from "mongoose-delete";

const auhthorSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    birthdate: {
      type: String,
    },
    nationality: {
      type: String,
    },
    bio: {
      type: String,
    },
    image: {
      type: Object,
      default: {
        publicId: "ldvnzziuxspcy7rky8jp",
        url: "https://res.cloudinary.com/dboibmxrw/image/upload/v1697893125/ldvnzziuxspcy7rky8jp.jpg",
      },
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

auhthorSchema.plugin(mongoosePaginate);
auhthorSchema.plugin(mongooseDelete, {
  deleteAt: true,
  overrideMethods: "all",
});

export default mongoose.model("Author", auhthorSchema);
