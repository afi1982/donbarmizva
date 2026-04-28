export default function BotanicalDivider() {
  return (
    <div className="flex items-center gap-3 my-4 w-full max-w-xs mx-auto">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-amber-300/60" />
      <span className="text-amber-400/80 text-xs tracking-widest">✿ ✦ ✿</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-amber-300/60" />
    </div>
  )
}
