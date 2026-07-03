export default function BotanicalDivider() {
  return (
    <div className="flex items-center gap-3 my-5 w-full max-w-xs mx-auto">
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--inv-divider, #c4b48a))' }} />
      <span className="text-xs tracking-widest" style={{ color: 'var(--inv-primary, #b8963e)' }}>✦</span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(270deg, transparent, var(--inv-divider, #c4b48a))' }} />
    </div>
  )
}
