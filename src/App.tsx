import { BrowserRouter, Routes, Route } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import { HomePage } from '@/pages/HomePage'
import { CreatePostPage } from '@/pages/CreatePostPage'
import { PostDetailPage } from '@/pages/PostDetailPage'
import { MessagesPage } from '@/pages/MessagesPage'
import { ChatPage } from '@/pages/ChatPage'
import { DiaryPage } from '@/pages/DiaryPage'
import { LettersPage } from '@/pages/LettersPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { MBTIPage } from '@/pages/MBTIPage'

function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuth()
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="create" element={<CreatePostPage />} />
            <Route path="post/:id" element={<PostDetailPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:id" element={<ChatPage />} />
            <Route path="diary" element={<DiaryPage />} />
            <Route path="letters" element={<LettersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="mbti" element={<MBTIPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
