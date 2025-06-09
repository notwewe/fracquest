import { useEffect, useState } from 'react'

export function OrientationLock() {
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [])

  if (!isPortrait) return null

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <svg className="w-16 h-16 mx-auto text-amber-500 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-blaka text-amber-400">Please Rotate Your Device</h2>
        <p className="text-amber-300/80 text-sm">For the best experience, please use landscape orientation</p>
      </div>
    </div>
  )
}
