'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Terminal } from '@/components/Terminal'
import { DossierPanel } from '@/components/DossierPanel'
import { ChoicePanel } from '@/components/ChoicePanel'
import { ClassifiedHeader } from '@/components/ClassifiedHeader'
import { GameState, Message, Choice } from '@/types/game'
import { getLatestGameState, getMessageHistory, saveGameState, saveMessages, updateSessionStatus } from '@/lib/game-state'

export default function GamePage() {
  const { sessionId } = useParams() as { sessionId: string }
  const router = useRouter()
  
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isTransmitting, setIsTransmitting] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [currentSceneTitle, setCurrentSceneTitle] = useState('')

  useEffect(() => {
    async function loadInitialState() {
      try {
        const state = await getLatestGameState(sessionId)
        if (!state) {
          alert('Session not found.')
          router.push('/')
          return
        }
        setGameState(state)

        const history = await getMessageHistory(sessionId)
        setMessages(history)

        // If turn 0 and no history, we need to trigger the initial prompt from Claude
        if (state.turn === 0 && history.length === 0) {
          triggerNarrative(state, 'BEGIN_MISSION', history)
        }
      } catch (e) {
        console.error('Error loading session', e)
      }
    }
    loadInitialState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, router])

  const triggerNarrative = async (currentState: GameState, playerChoice: string, currentHistory: Message[]) => {
    setIsTransmitting(true)
    setStreamingText('')
    
    // Add user choice to local history immediately (unless it's the internal BEGIN_MISSION trigger)
    const newUserMessage: Message | null = playerChoice !== 'BEGIN_MISSION' 
      ? { role: 'user', content: playerChoice } 
      : null
    
    if (newUserMessage) {
      setMessages(prev => [...prev, newUserMessage])
    }

    try {
      const response = await fetch('/api/narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: currentState,
          playerChoice: playerChoice,
          messageHistory: currentHistory
        })
      })

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullResponseText = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        fullResponseText += chunk
        setStreamingText(fullResponseText)
      }

      // Done streaming, parse JSON
      const parsedResponse = JSON.parse(fullResponseText)
      
      const newAssistantMessage: Message = { role: 'assistant', content: fullResponseText }
      
      const newHistory = newUserMessage 
        ? [...currentHistory, newUserMessage, newAssistantMessage]
        : [...currentHistory, newAssistantMessage]

      // Update local state
      setMessages(newHistory)
      setStreamingText('')
      setCurrentSceneTitle('') // Reset, it will be rendered from the new history
      
      const nextTurn = currentState.turn + 1
      const updatedState = { ...parsedResponse.updatedState, turn: nextTurn }
      updatedState.choices = parsedResponse.choices
      
      setGameState(updatedState)

      // Persist to DB
      const messagesToSave = newUserMessage ? [newUserMessage, newAssistantMessage] : [newAssistantMessage]
      await saveMessages(sessionId, nextTurn, messagesToSave)
      await saveGameState(sessionId, nextTurn, updatedState)

      if (updatedState.gameOver || updatedState.cover <= 0) {
        await updateSessionStatus(sessionId, 'burned')
        // Could show a debrief screen here
      }

    } catch (e) {
      console.error('Narrative API error', e)
      alert('Failed to contact Langley. Transmission error.')
    } finally {
      setIsTransmitting(false)
    }
  }

  const handleChoice = (choice: Choice) => {
    if (!gameState) return
    triggerNarrative(gameState, choice.label, messages)
  }

  if (!gameState) {
    return <div className="min-h-screen bg-background text-primary flex items-center justify-center font-sans animate-pulse">DECRYPTING...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-background text-primary overflow-hidden">
      <ClassifiedHeader 
        missionName={gameState.missionId} 
        location={gameState.location} 
        threatLevel={gameState.threatLevel} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-[70%] flex flex-col border-r border-border h-full relative">
          <Terminal 
            messages={messages} 
            streamingText={streamingText} 
            isStreaming={isTransmitting && streamingText.length > 0} 
            sceneTitle={currentSceneTitle}
          />
          
          <div className="mt-auto">
            <ChoicePanel 
              choices={gameState.gameOver ? [] : gameState.choices} 
              onChoiceSelect={handleChoice} 
              disabled={isTransmitting} 
            />
          </div>
        </div>

        <div className="hidden md:block w-[30%] h-full">
          <DossierPanel state={gameState} />
        </div>
      </div>
    </div>
  )
}
