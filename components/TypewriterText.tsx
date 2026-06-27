'use client'

import { useEffect, useState } from 'react'

export function TypewriterText({ text, speed = 15, onComplete }: { text: string, speed?: number, onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [isRedacted, setIsRedacted] = useState(true)

  useEffect(() => {
    // Initial redaction phase
    const redactionTimer = setTimeout(() => {
      setIsRedacted(false)
    }, 800)

    return () => clearTimeout(redactionTimer)
  }, [])

  useEffect(() => {
    if (isRedacted) return

    let i = 0
    // We want to stream from where we are to the end of the text
    // If text is updating (streaming), we just keep appending
    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        if (prev.length < text.length) {
          return text.slice(0, prev.length + 1)
        } else {
          clearInterval(interval)
          if (onComplete && prev.length === text.length && text.length > 0) {
            onComplete()
          }
          return prev
        }
      })
    }, speed)

    return () => clearInterval(interval)
  }, [text, isRedacted, speed, onComplete])

  if (isRedacted) {
    return <span className="bg-black text-black">████████████████</span>
  }

  return (
    <span>
      {displayedText}
      <span className="cursor-blink">_</span>
    </span>
  )
}
