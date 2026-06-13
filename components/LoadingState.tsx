export default function LoadingState({ message = 'Analisando campanhas...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-accent/20 rounded-full" />
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold mb-2">{message}</p>
        <p className="text-white/50 text-sm">Usando Claude AI para análise inteligente</p>
      </div>
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-accent rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
