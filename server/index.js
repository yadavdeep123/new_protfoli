import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const clientUrl = process.env.CLIENT_URL;

if (clientUrl) {
  const origins = clientUrl.split(",").map((origin) => origin.trim());
  app.use(
    cors({
      origin: origins,
      credentials: true
    })
  );
} else {
  app.use(cors());
}

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "portfolio-api" });
});

app.use("/api/portfolio", portfolioRoutes);
app.use("/api/messages", messageRoutes);

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

start();
