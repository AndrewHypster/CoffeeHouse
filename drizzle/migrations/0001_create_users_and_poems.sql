-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  name text NOT NULL,
  mail text,
  role text NOT NULL DEFAULT 'user',
  created_at DATE DEFAULT now() NOT NULL
);

-- Create poems table
CREATE TABLE IF NOT EXISTS poems (
  id serial PRIMARY KEY,
  author_id integer REFERENCES users(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  created_at DATE DEFAULT now() NOT NULL
);
