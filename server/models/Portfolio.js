import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    stack: [{ type: String }],
    liveUrl: { type: String },
    repoUrl: { type: String },
    language: { type: String, default: "" },
    stars: { type: Number, default: 0 },
    forks: { type: Number, default: 0 },
    updatedAt: { type: String, default: "" },
    badge: { type: String, default: "Open Source" }
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    headline: { type: String, required: true },
    about: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    profileImage: { type: String, default: "/profile-photo.svg" },
    resumeUrl: { type: String, default: "/Deepak-Yadav-Resume.txt" },
    skills: [{ type: String }],
    social: {
      github: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" }
    },
    projects: [projectSchema]
  },
  { timestamps: true }
);

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
