import express from "express";
import cors from "cors";
import { Pool } from "pg";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import sessionRoutes from "./routes/sessions.js";
import moodRoutes from "./routes/moods.js";
import resourceRoutes from "./routes/resources.js";
import postsRoutes from "./routes/posts.js";
import victoryRoutes from "./routes/victories.js";
import chatRoutes from "./routes/chat.js";
import analyticsRoutes from "./routes/analytics.js";
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
// Database connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "MindConnect Backend is running" });
});
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/moods", moodRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/victories", victoryRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.listen(port, () => {
    console.log(`MindConnect server listening on port ${port}`);
});
