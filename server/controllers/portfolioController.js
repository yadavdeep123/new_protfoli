import Portfolio from "../models/Portfolio.js";
import defaultPortfolio from "../data/defaultPortfolio.js";

export const getPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne().lean();

    if (portfolio) {
      return res.status(200).json(portfolio);
    }

    return res.status(200).json(defaultPortfolio);
  } catch (error) {
    return res.status(200).json(defaultPortfolio);
  }
};

export const updatePortfolio = async (req, res) => {
  try {
    const updated = await Portfolio.findOneAndUpdate({}, req.body, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    });

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({
      message: "Unable to update portfolio",
      error: error.message
    });
  }
};
