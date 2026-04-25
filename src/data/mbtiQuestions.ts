export interface MBTIQuestion {
  id: number
  text: string
  optionA: { text: string; dimension: string; value: string }
  optionB: { text: string; dimension: string; value: string }
}

export const MBTI_QUESTIONS: MBTIQuestion[] = [
  {
    id: 1,
    text: '周末到了，你更想怎么度过？',
    optionA: { text: '约朋友出去逛街、聚餐或参加活动', dimension: 'E', value: 'E' },
    optionB: { text: '一个人在家看书、看电影或打游戏', dimension: 'I', value: 'I' },
  },
  {
    id: 2,
    text: '面对一个新项目，你更倾向于？',
    optionA: { text: '先动手尝试，在实践中摸索', dimension: 'S', value: 'S' },
    optionB: { text: '先构思整体方案，想清楚再行动', dimension: 'N', value: 'N' },
  },
  {
    id: 3,
    text: '朋友遇到困难来找你倾诉，你会？',
    optionA: { text: '帮他分析问题，给出理性的建议', dimension: 'T', value: 'T' },
    optionB: { text: '先安慰他的情绪，让他感到被理解', dimension: 'F', value: 'F' },
  },
  {
    id: 4,
    text: '对于旅行计划，你更喜欢？',
    optionA: { text: '提前做好详细的行程安排', dimension: 'J', value: 'J' },
    optionB: { text: '随性出发，走到哪算哪', dimension: 'P', value: 'P' },
  },
  {
    id: 5,
    text: '在社交场合中，你通常？',
    optionA: { text: '主动和陌生人聊天，很快融入氛围', dimension: 'E', value: 'E' },
    optionB: { text: '安静观察，等熟悉了才打开话匣子', dimension: 'I', value: 'I' },
  },
  {
    id: 6,
    text: '学习新东西时，你更注重？',
    optionA: { text: '具体的事实、细节和实际应用', dimension: 'S', value: 'S' },
    optionB: { text: '背后的原理、模式和未来可能性', dimension: 'N', value: 'N' },
  },
  {
    id: 7,
    text: '做一个重要决定时，你更依赖？',
    optionA: { text: '逻辑分析和客观数据', dimension: 'T', value: 'T' },
    optionB: { text: '内心感受和对他人的影响', dimension: 'F', value: 'F' },
  },
  {
    id: 8,
    text: '你的工作/学习环境通常是？',
    optionA: { text: '整洁有序，东西都有固定位置', dimension: 'J', value: 'J' },
    optionB: { text: '看似混乱但自有规律，能快速找到东西', dimension: 'P', value: 'P' },
  },
  {
    id: 9,
    text: '长时间独处后，你会？',
    optionA: { text: '迫不及待想找人说说话', dimension: 'E', value: 'E' },
    optionB: { text: '享受独处的时光，不急着社交', dimension: 'I', value: 'I' },
  },
  {
    id: 10,
    text: '描述一件事时，你更倾向于？',
    optionA: { text: '按时间顺序，讲述具体发生了什么', dimension: 'S', value: 'S' },
    optionB: { text: '跳跃式讲述，注重感受和联想', dimension: 'N', value: 'N' },
  },
  {
    id: 11,
    text: '团队中出现意见分歧，你会？',
    optionA: { text: '坚持自己认为正确的方案', dimension: 'T', value: 'T' },
    optionB: { text: '寻求折中方案，维护团队和谐', dimension: 'F', value: 'F' },
  },
  {
    id: 12,
    text: '关于截止日期，你的态度是？',
    optionA: { text: '提前完成，不喜欢最后时刻的紧张感', dimension: 'J', value: 'J' },
    optionB: { text: '截止日期前的压力反而让我效率更高', dimension: 'P', value: 'P' },
  },
  {
    id: 13,
    text: '你更享受哪种沟通方式？',
    optionA: { text: '面对面或电话，实时交流更带感', dimension: 'E', value: 'E' },
    optionB: { text: '文字消息或邮件，有时间思考再回复', dimension: 'I', value: 'I' },
  },
  {
    id: 14,
    text: '看一部电影，你更关注？',
    optionA: { text: '画面、动作、台词等具体细节', dimension: 'S', value: 'S' },
    optionB: { text: '主题思想、隐喻和深层含义', dimension: 'N', value: 'N' },
  },
  {
    id: 15,
    text: '朋友做了一件你认为不对的事，你会？',
    optionA: { text: '直接指出问题，即使可能伤感情', dimension: 'T', value: 'T' },
    optionB: { text: '委婉地提醒，照顾对方的感受', dimension: 'F', value: 'F' },
  },
  {
    id: 16,
    text: '对于未来的规划，你？',
    optionA: { text: '有清晰的长期和短期目标', dimension: 'J', value: 'J' },
    optionB: { text: '走一步看一步，相信船到桥头自然直', dimension: 'P', value: 'P' },
  },
]
