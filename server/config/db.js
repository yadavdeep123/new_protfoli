import mongoose from "mongoose";

const resolveMongoUri = () => {
  const mongoUri = process.env.MONGO_URI;
  const mongoPassword = process.env.MONGO_DB_PASSWORD || process.env.DB_PASSWORD || "";

  if (!mongoUri) {
    return "";
  }

  if (!mongoUri.includes("<db_password>")) {
    return mongoUri;
  }

  if (!mongoPassword) {
    return "";
  }

  return mongoUri.replace("<db_password>", encodeURIComponent(mongoPassword));
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  const resolvedMongoUri = resolveMongoUri();
  const mongoDbName = process.env.MONGO_DB_NAME || "portfolio_db";

  if (!mongoUri) {
    console.warn("MONGO_URI is missing. API will run with fallback data only.");
    return;
  }

  if (!resolvedMongoUri) {
    console.warn(
      "MONGO_URI contains <db_password>. Set MONGO_DB_PASSWORD (or DB_PASSWORD) to enable MongoDB."
    );
    return;
  }

  try {
    await mongoose.connect(resolvedMongoUri, {
      dbName: mongoDbName,
      serverSelectionTimeoutMS: 4000
    });
    console.log(`MongoDB connected (${mongoose.connection.name})`);
  } catch (error) {
    console.warn("MongoDB connection failed. API will run with fallback data.");
    console.warn(error.message);
  }
};
