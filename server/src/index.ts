import express, { type Express, type Request, type Response } from "express";
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

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // required for Render Postgres
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "MindConnect Backend is running" });
});

// Function to create tables
async function setupTables() {
  try {
    await pool.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        age INT,
        role VARCHAR(50) DEFAULT 'student',
        school VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Sessions table
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id),
        counselor_id INT REFERENCES users(id),
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        topic VARCHAR(255),
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Mood checkins table
      CREATE TABLE IF NOT EXISTS mood_checkins (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        mood VARCHAR(50) NOT NULL,
        intensity INT DEFAULT 5,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Resources table
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        url TEXT,
        type VARCHAR(50),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Saved resources table
      CREATE TABLE IF NOT EXISTS saved_resources (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        resource_id INT REFERENCES resources(id),
        saved_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, resource_id)
      );

      -- Posts table
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        is_anonymous BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Post likes table
      CREATE TABLE IF NOT EXISTS post_likes (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id),
        user_id INT REFERENCES users(id),
        UNIQUE(post_id, user_id)
      );

      -- Victories table
      CREATE TABLE IF NOT EXISTS victories (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Chat sessions table
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(id),
        counselor_id INT REFERENCES users(id),
        is_anonymous BOOLEAN DEFAULT false,
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Chat messages table
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        chat_id INT REFERENCES chat_sessions(id),
        sender_id INT REFERENCES users(id),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      -- Insert sample resources
      INSERT INTO resources (title, description, category, type, url) VALUES
        ('The Power of Gratitude', 'Learn how gratitude can transform your life', 'Psychology', 'article', 'https://example.com/gratitude'),
        ('Breathing Techniques for Anxiety', 'Simple exercises to calm your mind', 'Exercise', 'video', 'https://example.com/breathing'),
        ('Think and Grow Rich', 'Classic psychology book about mindset', 'Book', 'book', 'https://example.com/think-grow-rich'),
        ('Morning Meditation Guide', 'Start your day with mindfulness', 'Exercise', 'guide', 'https://example.com/meditation'),
        ('Understanding Emotions', 'Deep dive into emotional intelligence', 'Psychology', 'article', 'https://example.com/emotions')
      ON CONFLICT DO NOTHING;
    `);

    console.log("✅ All tables and sample data are ready!");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
}

// Call setupTables before starting server
setupTables().then(() => {
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
});
