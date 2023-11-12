import mongoose from "mongoose";

const apiKeySchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      required: true,
      enum: ["0000","1111","2222"]
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("ApiKey", apiKeySchema);
