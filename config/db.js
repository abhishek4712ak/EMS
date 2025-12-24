import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://abhishek4712ak_db_user:KU2c8GAnojKaKSvS@zestdb.zrxg6yb.mongodb.net/zest2k25?retryWrites=true&w=majority&appName=zestdb")
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
