import { Outlet } from 'react-router'
import { FloatingOrbs } from '@/components/common/FloatingOrbs'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background relative">
      <FloatingOrbs />
      <Header />
      <main className="relative z-10 pt-14 pb-16 md:pb-0 lg:pl-64">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
