CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX idx_posts_channel ON posts (channel);
CREATE INDEX idx_posts_author ON posts (author_id);
CREATE INDEX idx_comments_post ON comments (post_id, created_at);
CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
CREATE INDEX idx_conversations_users ON conversations (user1_id, user2_id);
CREATE INDEX idx_diaries_user_date ON diaries (user_id, entry_date DESC);
CREATE INDEX idx_letters_user ON letters (user_id, open_time);
CREATE INDEX idx_emotions_post ON post_emotions (post_id);
