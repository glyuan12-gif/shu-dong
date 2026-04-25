-- ============================================
-- 树洞匿名社交平台 - 数据库 Migration
-- ============================================

-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_style TEXT NOT NULL DEFAULT 'animal' CHECK (avatar_style IN ('animal', 'plant', 'food', 'weather', 'star')),
  avatar_value TEXT NOT NULL DEFAULT '🐱',
  nickname TEXT NOT NULL DEFAULT '匿名树洞客',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  mbti_type TEXT,
  theme TEXT NOT NULL DEFAULT 'forest' CHECK (theme IN ('forest', 'dark', 'sakura', 'sunny', 'starry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- 帖子表
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'general' CHECK (channel IN ('general', 'confession', 'story', 'question', 'mood')),
  mood TEXT CHECK (mood IN ('happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'tired', 'grateful')),
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete own posts" ON posts FOR DELETE USING (auth.uid() = author_id);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can delete own comments" ON comments FOR DELETE USING (auth.uid() = author_id);

-- 点赞表
CREATE TABLE post_likes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- 情绪反应表
CREATE TABLE post_emotions (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  emotion_type TEXT NOT NULL CHECK (emotion_type IN ('hug', 'cry', 'laugh', 'think', 'love', 'wow')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id, emotion_type)
);

ALTER TABLE post_emotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view emotions" ON post_emotions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON post_emotions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove reaction" ON post_emotions FOR DELETE USING (auth.uid() = user_id);

-- 私信会话表
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE (user1_id, user2_id)
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversations" ON conversations FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Authenticated users can create conversations" ON conversations FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 私信消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (
  auth.uid() IN (
    SELECT user1_id FROM conversations WHERE id = conversation_id
    UNION
    SELECT user2_id FROM conversations WHERE id = conversation_id
  )
);
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT user1_id FROM conversations WHERE id = conversation_id
    UNION
    SELECT user2_id FROM conversations WHERE id = conversation_id
  )
);

-- 日记表
CREATE TABLE diaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  mood TEXT CHECK (mood IN ('happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'tired', 'grateful')),
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_diary_entry UNIQUE (user_id, entry_date)
);

ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own diaries" ON diaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public diaries" ON diaries FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create own diaries" ON diaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diaries" ON diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own diaries" ON diaries FOR DELETE USING (auth.uid() = user_id);

-- 定时信件表
CREATE TABLE letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  seal_time TIMESTAMPTZ NOT NULL,
  open_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'sealed' CHECK (status IN ('sealed', 'opened')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own letters" ON letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own letters" ON letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own letters" ON letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own letters" ON letters FOR DELETE USING (auth.uid() = user_id);

-- MBTI 测试结果表
CREATE TABLE mbti_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  answers_json JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mbti_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own results" ON mbti_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON mbti_results FOR INSERT WITH CHECK (auth.uid() = user_id);
