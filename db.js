import mongoose from "mongoose";
const connectDb = (connectionStr) => {
 return mongoose.connect(connectionStr);
};

export default connectDb;
