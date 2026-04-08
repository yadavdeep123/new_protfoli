import dotenv from "dotenv";
import mongoose from "mongoose";
import Portfolio from "../models/Portfolio.js";
import defaultPortfolio from "../data/defaultPortfolio.js";

dotenv.config();

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

const seedPortfolio = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in server/.env");
    }

    const resolvedMongoUri = resolveMongoUri();
    if (!resolvedMongoUri) {
      throw new Error(
        "MONGO_URI contains <db_password>. Set MONGO_DB_PASSWORD (or DB_PASSWORD) in server/.env"
      );
    }

    const mongoDbName = process.env.MONGO_DB_NAME || "portfolio_db";

    await mongoose.connect(resolvedMongoUri, {
      dbName: mongoDbName,
      serverSelectionTimeoutMS: 6000
    });

    const updated = await Portfolio.findOneAndUpdate({}, defaultPortfolio, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    });

    console.log(`Portfolio seeded for ${updated.name}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed portfolio:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedPortfolio();
