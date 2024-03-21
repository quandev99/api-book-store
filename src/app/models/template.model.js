'use strict';
import mongoose from "mongoose";

const templateSchema = mongoose.Schema(
  {
    template_name: {
      type: String,
      required: true,
      // unique: true,
    },
    template_html: {
      type: String,
      required: true,
    },
    template_status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("Template", templateSchema);
