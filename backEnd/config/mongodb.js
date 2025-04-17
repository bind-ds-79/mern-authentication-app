// mongodb connect 
import mongoose, { connect } from "mongoose";

const connectDB=async ()=>{
 await mongoose.connect(process.env.MONGODB_URL)
.then(() => {
  console.log("MongoDB connected successfully!");
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});
}

export default connectDB;