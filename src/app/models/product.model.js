import mongoose from "mongoose";
import slug from "mongoose-slug-generator";
import mongoosePaginate from "mongoose-paginate-v2";
import mongooseDelete from "mongoose-delete";
const bookSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    image: {
      type: Array,
      default: [
        {
          publicId: "ldvnzziuxspcy7rky8jp",
          url: "https://res.cloudinary.com/dboibmxrw/image/upload/v1697893125/ldvnzziuxspcy7rky8jp.jpg",
        },
      ],
    },
    price: {
      type: Number,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    discounted_price: {
      type: Number,
      default: null, 
    },
    discount_percentage: {
      type: Number,
      min: 0,
      default: null, 
    },
    quantity: {
      type: Number,
    },
    author_id: {
      type: mongoose.Types.ObjectId,
      ref: "Author",
    },
    category_id: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
    genre_id: {
      type: mongoose.Types.ObjectId,
      ref: "Genre",
    },
    supplier_id: {
      type: mongoose.Types.ObjectId,
      ref: "Supplier",
    },
    publisher_id: {
      type: mongoose.Types.ObjectId,
      ref: "Publisher",
    },
    favorite_count: {
      type: Number,
      default: 0,
    },
    publishing_year: {
      type: Number,
    },
    slug: {
      type: String,
      slug: "name",
    },
    review_count: { type: Number, default: 0 },
    average_score: { type: Number, default: 0 },
    out_of_stock: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

mongoose.plugin(slug);
bookSchema.plugin(mongoosePaginate);
bookSchema.plugin(mongooseDelete, {
  deleteAt: true,
  overrideMethods: "all",
});

export default mongoose.model("Book", bookSchema);

