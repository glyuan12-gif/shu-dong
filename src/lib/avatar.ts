import type { AvatarStyle } from '@/types'

const ANIMAL_EMOJIS = ['🐱', '🐶', '🐰', '🐻', '🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸']
const PLANT_EMOJIS = ['🌸', '🌺', '🌻', '🌹', '🍀', '🌈', '🌿', '🎋', '🍁', '🌱', '🌾', '🪻']
const FOOD_EMOJIS = ['☕', '🍰', '🍕', '🍩', '🧁', '🍪', '🍵', '🧋', '🍱', '🍜', '🍡', '🥐']
const WEATHER_EMOJIS = ['☀️', '🌙', '⭐', '🌈', '❄️', '⚡', '🔥', '💧', '🌊', '🍂', '🌸', '☁️']
const STAR_EMOJIS = ['✨', '💫', '🌟', '⭐', '🌠', '💫', '✧', '⋆', '·˚', '⊹', '˗ˏˋ', '⋆.ೃ']

const AVATAR_MAP: Record<AvatarStyle, string[]> = {
  animal: ANIMAL_EMOJIS,
  plant: PLANT_EMOJIS,
  food: FOOD_EMOJIS,
  weather: WEATHER_EMOJIS,
  star: STAR_EMOJIS,
}

const NICKNAME_PREFIXES = ['温柔的', '安静的', '快乐的', '自由的', '神秘的', '勇敢的', '善良的', '聪明的', '可爱的', '浪漫的']
const NICKNAME_SUFFIXES = ['小树', '云朵', '星星', '微风', '月光', '露珠', '花瓣', '萤火虫', '彩虹', '浪花', '飞鸟', '蝴蝶']

export function randomAvatar(style?: AvatarStyle): { style: AvatarStyle; value: string } {
  const styles: AvatarStyle[] = ['animal', 'plant', 'food', 'weather', 'star']
  const chosenStyle = style || styles[Math.floor(Math.random() * styles.length)]
  const emojis = AVATAR_MAP[chosenStyle]
  const value = emojis[Math.floor(Math.random() * emojis.length)]
  return { style: chosenStyle, value }
}

export function generateNickname(): string {
  const prefix = NICKNAME_PREFIXES[Math.floor(Math.random() * NICKNAME_PREFIXES.length)]
  const suffix = NICKNAME_SUFFIXES[Math.floor(Math.random() * NICKNAME_SUFFIXES.length)]
  return `${prefix}${suffix}`
}
