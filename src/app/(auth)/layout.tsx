export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-white tracking-tight">
            IN<span className="text-blue-500">BIG</span>
          </span>
          <p className="text-zinc-500 text-sm mt-1">Inteligencia financiera para LATAM</p>
        </div>
        {children}
      </div>
    </div>
  )
}
