export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orb-1 opacity-[var(--orb-opacity)] blur-[80px] animate-float"
      />
      <div
        className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-orb-2 opacity-[var(--orb-opacity)] blur-[80px] animate-float-delayed"
      />
      <div
        className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-orb-3 opacity-[var(--orb-opacity)] blur-[80px] animate-float-slow"
      />
    </div>
  )
}
