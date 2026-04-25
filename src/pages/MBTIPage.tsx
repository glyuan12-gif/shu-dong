import { useState } from 'react'
import { Link } from 'react-router'
import { Brain, RotateCcw, ArrowRight } from 'lucide-react'
import { getItem, setItem, generateId } from '@/lib/storage'
import { useAuthStore } from '@/stores/authStore'
import { MBTI_QUESTIONS } from '@/data/mbtiQuestions'
import { MBTI_DESCRIPTIONS } from '@/types'
import type { MBTIQuestion } from '@/data/mbtiQuestions'
import type { MBTIResult } from '@/types'

type PageState = 'intro' | 'testing' | 'result'

export function MBTIPage() {
  const { user } = useAuthStore()
  const [pageState, setPageState] = useState<PageState>('intro')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const totalQuestions = MBTI_QUESTIONS.length
  const question: MBTIQuestion = MBTI_QUESTIONS[currentQuestion]
  const progress = ((currentQuestion) / totalQuestions) * 100

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      calculateResult(newAnswers)
    }
  }

  const calculateResult = (finalAnswers: Record<number, string>) => {
    const dimensions: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }

    Object.values(finalAnswers).forEach((val) => {
      if (val in dimensions) {
        dimensions[val]++
      }
    })

    const type =
      (dimensions.E >= dimensions.I ? 'E' : 'I') +
      (dimensions.S >= dimensions.N ? 'S' : 'N') +
      (dimensions.T >= dimensions.F ? 'T' : 'F') +
      (dimensions.J >= dimensions.P ? 'J' : 'P')

    setResult(type)
    setPageState('result')
    saveResult(type, finalAnswers)
  }

  const saveResult = (type: string, finalAnswers: Record<number, string>) => {
    if (!user) return
    setSaving(true)

    // Save MBTI result
    const mbtiResult: MBTIResult = {
      id: generateId(),
      user_id: user.id,
      type,
      answers_json: finalAnswers as unknown as Record<string, string>,
      created_at: new Date().toISOString(),
    }
    const results = getItem<MBTIResult[]>('mbti-results', [])
    results.unshift(mbtiResult)
    setItem('mbti-results', results)

    // Update user MBTI type
    const updatedUser = { ...user, mbti_type: type }
    setItem('user', updatedUser)
    useAuthStore.getState().updateProfile({ mbti_type: type })

    setSaving(false)
  }

  const handleRestart = () => {
    setPageState('intro')
    setCurrentQuestion(0)
    setAnswers({})
    setResult('')
  }

  // Intro Page
  if (pageState === 'intro') {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-3">MBTI 性格测试</h1>
            <p className="text-muted-foreground leading-relaxed">
              通过 16 道精选题目，探索你的性格类型。了解自己是内向还是外向、理性还是感性、计划型还是随性型。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-card rounded-xl p-3 text-center">
              <div className="font-bold text-primary">E / I</div>
              <div className="text-muted-foreground">外向 / 内向</div>
            </div>
            <div className="bg-card rounded-xl p-3 text-center">
              <div className="font-bold text-primary">S / N</div>
              <div className="text-muted-foreground">感觉 / 直觉</div>
            </div>
            <div className="bg-card rounded-xl p-3 text-center">
              <div className="font-bold text-primary">T / F</div>
              <div className="text-muted-foreground">思考 / 情感</div>
            </div>
            <div className="bg-card rounded-xl p-3 text-center">
              <div className="font-bold text-primary">J / P</div>
              <div className="text-muted-foreground">判断 / 感知</div>
            </div>
          </div>
          <button
            onClick={() => setPageState('testing')}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            开始测试
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  // Testing Page
  if (pageState === 'testing') {
    return (
      <div className="p-4 flex flex-col min-h-[60vh]">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>第 {currentQuestion + 1} 题 / 共 {totalQuestions} 题</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-8 max-w-md mx-auto w-full">
          <h2 className="text-xl font-semibold text-center leading-relaxed">{question.text}</h2>

          <div className="w-full space-y-3">
            <button
              onClick={() => handleAnswer(question.optionA.value)}
              className="w-full p-5 rounded-xl bg-card hover:bg-accent/50 border-2 border-transparent hover:border-primary/30 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  A
                </span>
                <span className="text-sm leading-relaxed pt-1">{question.optionA.text}</span>
              </div>
            </button>

            <button
              onClick={() => handleAnswer(question.optionB.value)}
              className="w-full p-5 rounded-xl bg-card hover:bg-accent/50 border-2 border-transparent hover:border-primary/30 transition-all text-left group"
            >
              <div className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  B
                </span>
                <span className="text-sm leading-relaxed pt-1">{question.optionB.text}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Result Page
  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="w-28 h-28 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary">{result}</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-2">你的性格类型是</h2>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {result}
          </p>
        </div>

        <div className="bg-card rounded-xl p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {MBTI_DESCRIPTIONS[result] || '暂无该类型的描述'}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/settings"
            className="w-full py-3 rounded-xl bg-secondary font-medium hover:bg-accent transition-colors text-center"
          >
            前往个人设置
          </Link>
          <button
            onClick={handleRestart}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
            重新测试
          </button>
        </div>
      </div>
    </div>
  )
}
