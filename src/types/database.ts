export type AvatarStyle = 'animal' | 'plant' | 'food' | 'weather' | 'star'
export type ThemeName = 'forest' | 'dark' | 'sakura' | 'sunny' | 'starry'
export type Channel = 'general' | 'confession' | 'story' | 'question' | 'mood'
export type MoodType = 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'excited' | 'tired' | 'grateful'
export type EmotionType = 'hug' | 'cry' | 'laugh' | 'think' | 'love' | 'wow'
export type LetterStatus = 'sealed' | 'opened'

export type User = {
  id: string
  avatar_style: AvatarStyle
  avatar_value: string
  nickname: string
  role: 'user' | 'admin'
  mbti_type: string | null
  theme: ThemeName
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  author_id: string
  title: string | null
  content: string
  channel: Channel
  mood: MoodType | null
  tags: string[]
  images: string[]
  created_at: string
  author?: User
  like_count?: number
  comment_count?: number
  is_liked?: boolean
}

export type Comment = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: User
}

export type PostLike = {
  user_id: string
  post_id: string
  created_at: string
}

export type PostEmotion = {
  user_id: string
  post_id: string
  emotion_type: EmotionType
  created_at: string
}

export type Conversation = {
  id: string
  user1_id: string
  user2_id: string
  last_message_at: string
  created_at: string
  other_user?: User
  last_message?: Message
}

export type Message = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export type Diary = {
  id: string
  user_id: string
  entry_date: string
  mood: MoodType | null
  content: string
  is_public: boolean
  created_at: string
}

export type Letter = {
  id: string
  user_id: string
  content: string
  seal_time: string
  open_time: string
  status: LetterStatus
  created_at: string
}

export type MBTIResult = {
  id: string
  user_id: string
  type: string
  answers_json: Record<string, string>
  created_at: string
}

// 常量映射
export const CHANNELS: Record<Channel, { name: string; icon: string }> = {
  general: { name: '日常', icon: '🌿' },
  confession: { name: '倾诉', icon: '💭' },
  story: { name: '故事', icon: '📖' },
  question: { name: '提问', icon: '❓' },
  mood: { name: '心情', icon: '🌤️' },
}

export const MOODS: Record<MoodType, { name: string; emoji: string }> = {
  happy: { name: '开心', emoji: '😊' },
  sad: { name: '难过', emoji: '😢' },
  angry: { name: '愤怒', emoji: '😤' },
  anxious: { name: '焦虑', emoji: '😰' },
  calm: { name: '平静', emoji: '😌' },
  excited: { name: '兴奋', emoji: '🤩' },
  tired: { name: '疲惫', emoji: '😴' },
  grateful: { name: '感恩', emoji: '🥰' },
}

export const EMOTIONS: Record<EmotionType, { emoji: string; label: string }> = {
  hug: { emoji: '🤗', label: '拥抱' },
  cry: { emoji: '😢', label: '共情' },
  laugh: { emoji: '😄', label: '开心' },
  think: { emoji: '🤔', label: '思考' },
  love: { emoji: '❤️', label: '喜爱' },
  wow: { emoji: '😮', label: '惊讶' },
}

export const THEMES: Record<ThemeName, { name: string; icon: string; colors: string[] }> = {
  forest: { name: '森林', icon: '🌿', colors: ['#5b8c6e', '#8fbc8f', '#f0f8f0'] },
  dark: { name: '暗夜', icon: '🌙', colors: ['#1a1a2e', '#16213e', '#0f3460'] },
  sakura: { name: '樱花', icon: '🌸', colors: ['#d4728a', '#f8c8dc', '#fff0f5'] },
  sunny: { name: '暖阳', icon: '☀️', colors: ['#d4944a', '#f4c542', '#fff8e7'] },
  starry: { name: '星空', icon: '🌌', colors: ['#7b8cde', '#c495d4', '#1a1a3e'] },
}

export const MBTI_DESCRIPTIONS: Record<string, string> = {
  INTJ: '富有想象力的战略思想家，凡事皆有计划。独立、果断，对自己和他人都有很高的要求。',
  INTP: '具有创新精神的发明家，对知识有着不可抑制的渴望。善于分析问题，追求逻辑和真理。',
  ENTJ: '大胆、富有想象力且意志强大的领导者，总能找到解决方案。天生的领袖，善于制定战略。',
  ENTP: '聪明好奇的思想者，不会放弃任何智力上的挑战。喜欢辩论，善于发现新的可能性。',
  INFJ: '安静而神秘，同时鼓舞人心且不知疲倦的理想主义者。富有同理心，追求有意义的生活。',
  INFP: '诗意、善良的利他主义者，总是热切地为正义事业提供帮助。安静内向、灵活富有创造力。',
  ENFJ: '富有魅力和鼓舞人心的领导者，能够吸引听众。善于感知他人的情绪，善于激励他人。',
  ENFP: '热情、有创造力、善于社交的自由精灵，总能找到理由微笑。热情洋溢，善于发现可能。',
  ISTJ: '实际且注重事实的个人，其可靠性不容置疑。严谨负责，注重传统和规则。',
  ISFJ: '非常专注且温暖的保护者，时刻准备着保护所爱的人。忠诚、耐心、善于关心他人。',
  ESTJ: '出色的管理者，在管理事物或人方面无与伦比。务实、高效、善于组织。',
  ESFJ: '极有爱心、善于社交且受欢迎的人，总是热心帮助他人。善于创造和谐的氛围。',
  ISTP: '大胆而实际的实验家，擅长使用各种形式的工具。灵活、善于分析、喜欢动手。',
  ISFP: '灵活且富有魅力的艺术家，时刻准备着探索和体验新事物。敏感、善于表达、价值观坚定。',
  ESTP: '聪明、精力充沛且善于感知的人，真正享受生活在边缘。大胆、直接、善于应变。',
  ESFP: '自发的、精力充沛且热情的人——生活在他们周围永远不会无聊。乐观、善于社交、热爱生活。',
}
