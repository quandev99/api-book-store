import mongoose from "mongoose";
import "dotenv/config";

const connectMongoose = async () => {
  try {
    // mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("[SUCCESS] Connected to database");
  } catch (error) {
    console.log("[ERROR]  Failed to connect to Mongo", error);
  }
};
export default connectMongoose;
