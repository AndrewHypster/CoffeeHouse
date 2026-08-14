-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  name text NOT NULL,
  avatar text,
  avatar_type text,
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

CREATE TABLE IF NOT EXISTS box (
  id serial PRIMARY KEY,
  Текст text,
  Дата date NOT NULL
);

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  poem_id integer NOT NULL REFERENCES poems(id) ON DELETE CASCADE,

  CONSTRAINT user_poem_unique UNIQUE (user_id, poem_id)
);