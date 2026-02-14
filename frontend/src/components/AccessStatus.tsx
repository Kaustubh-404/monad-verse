import { useEffect, useState } from 'react'

interface Props {
  canAccess?: boolean
  unlockTime?: bigint
  isConnected: boolean
}

export default function AccessStatus({ canAccess, unlockTime, isConnected }: Props) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!unlockTime || canAccess) return

    function updateCountdown() {
      const now = Math.floor(Date.now() / 1000)
      const unlock = Number(unlockTime)
      const remaining = unlock - now

      if (remaining <= 0) {
        setTimeLeft('Unlocked')
        return
      }

      const hours = Math.floor(remaining / 3600)
      const minutes = Math.floor((remaining % 3600) / 60)

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [unlockTime, canAccess])

  if (!isConnected) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs bg-gray-500/10 border border-gray-500/20 text-gray-400 px-2.5 py-1 rounded-md">
        <span>🔒</span>
        <span>Connect wallet</span>
      </div>
    )
  }

  if (canAccess) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">
        <span>🔓</span>
        <span>You have access</span>
      </div>
    )
  }

  if (timeLeft === 'Unlocked') {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-md">
        <span>🔓</span>
        <span>Unlocked</span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-md">
      <span>🔒</span>
      <span>Unlocks in {timeLeft}</span>
    </div>
  )
}
