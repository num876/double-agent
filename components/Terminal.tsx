import { useEffect, useRef } from 'react'
import { Message } from '@/types/game'
import { TypewriterText } from './TypewriterText'

interface TerminalProps {
  messages: Message[]
  streamingText: string
  isStreaming: boolean
  sceneTitle?: string
}

export function Terminal({ messages, streamingText, isStreaming, sceneTitle }: TerminalProps) {
  const endRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  return (
    <div className="flex-1 overflow-y-auto p-6 font-display text-lg leading-relaxed flex flex-col gap-6">
      {messages.map((msg, idx) => {
        if (msg.role === 'user') {
          return (
            <div key={idx} className="text-secondary text-base font-sans border-l-2 border-border pl-4 my-4">
              <span className="text-accent mr-2">{'>'}</span>
              {msg.content}
            </div>
          )
        }

        // Try to parse assistant JSON
        try {
          const parsed = JSON.parse(msg.content)
          return (
            <div key={idx} className="flex flex-col gap-4 mb-6">
              {parsed.sceneTitle && (
                <h3 className="font-sans text-sm text-secondary uppercase tracking-widest border-b border-border pb-1 mb-2">
                  {parsed.sceneTitle}
                </h3>
              )}
              <div className="text-primary whitespace-pre-wrap">{parsed.narrative}</div>
              {parsed.speakerLines && parsed.speakerLines.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  {parsed.speakerLines.map((line: { character: string, line: string }, i: number) => (
                    <div key={i} className="text-primary font-sans text-base">
                      <span className="text-secondary uppercase tracking-wider mr-3">
                        {line.character}:
                      </span>
                      &quot;{line.line}&quot;
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        } catch {
          return <div key={idx} className="text-danger">Error parsing record.</div>
        }
      })}

      {isStreaming && (
        <div className="flex flex-col gap-4 mb-6">
          {sceneTitle && (
            <h3 className="font-sans text-sm text-secondary uppercase tracking-widest border-b border-border pb-1 mb-2">
              {sceneTitle}
            </h3>
          )}
          <div className="text-primary whitespace-pre-wrap">
            <TypewriterText text={streamingText} />
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  )
}
