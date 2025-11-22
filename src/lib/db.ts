import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;

  const uri = process.env.MONGO_URL;
  if (!uri) throw new Error("MONGO_URL missing in environment");

  await mongoose.connect(uri, {
    dbName: "sadhguru_quotes",
  });

  isConnected = true;
};
