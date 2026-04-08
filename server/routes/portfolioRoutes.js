import express from "express";
import { getPortfolio, updatePortfolio } from "../controllers/portfolioController.js";

const router = express.Router();

router.get("/", getPortfolio);
router.put("/", updatePortfolio);

export default router;
