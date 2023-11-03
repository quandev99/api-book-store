import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseDelete from "mongoose-delete";
const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: Object,
      default: 
        {
          publicId: "ldvnzziuxspcy7rky8jp",
          url: "https://res.cloudinary.com/dboibmxrw/image/upload/v1697893125/ldvnzziuxspcy7rky8jp.jpg",
        },
    },
    description: String,
    slug: {
      type: String,
      slug: "name",
    },
    active: { type: Boolean, default: true },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Category",
    },
    subcategories: [{ type: String, default: null, ref: "Category" }],
  },
  { timestamps: true, versionKey: false }
);

mongoose.plugin(slug);
categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(mongooseDelete, {
  deleteAt: true,
  overrideMethods: "all",
});

export default mongoose.model("Category", categorySchema);
