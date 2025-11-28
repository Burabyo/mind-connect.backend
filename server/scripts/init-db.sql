-- Create users table
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

-- Create sessions table
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

-- Create mood checkins table
CREATE TABLE IF NOT EXISTS mood_checkins (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  mood VARCHAR(50) NOT NULL,
  intensity INT DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create resources table
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

-- Create saved resources table
CREATE TABLE IF NOT EXISTS saved_resources (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  resource_id INT REFERENCES resources(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Create posts table
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

-- Create post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id SERIAL PRIMARY KEY,
  post_id INT REFERENCES posts(id),
  user_id INT REFERENCES users(id),
  UNIQUE(post_id, user_id)
);

-- Create victories table
CREATE TABLE IF NOT EXISTS victories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id SERIAL PRIMARY KEY,
  student_id INT REFERENCES users(id),
  counselor_id INT REFERENCES users(id),
  is_anonymous BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create chat messages table
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
