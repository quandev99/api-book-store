import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
const favoriteSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

favoriteSchema.plugin(mongoosePaginate);
export default mongoose.model("Favorite", favoriteSchema);