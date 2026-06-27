import { GameState, Message } from '@/types/game'

// Helper to safely access localStorage (prevents SSR errors)
const getStorage = () => typeof window !== 'undefined' ? window.localStorage : null

export async function createSession(missionId: string, initialGameState: Omit<GameState, 'sessionId'>) {
  const sessionId = crypto.randomUUID()
  const stateToSave: GameState = { ...initialGameState, sessionId }
  
  const storage = getStorage()
  if (storage) {
    storage.setItem(`session_${sessionId}`, JSON.stringify({ missionId, status: 'active' }))
    storage.setItem(`gameState_${sessionId}_0`, JSON.stringify(stateToSave))
    storage.setItem(`messages_${sessionId}`, JSON.stringify([]))
  }

  return sessionId
}

export async function saveGameState(sessionId: string, turnNumber: number, state: GameState) {
  const storage = getStorage()
  if (storage) {
    storage.setItem(`gameState_${sessionId}_${turnNumber}`, JSON.stringify(state))
    // Keep track of the latest turn
    storage.setItem(`latestTurn_${sessionId}`, turnNumber.toString())
  }
}

export async function getLatestGameState(sessionId: string): Promise<GameState | null> {
  const storage = getStorage()
  if (!storage) return null

  const latestTurnStr = storage.getItem(`latestTurn_${sessionId}`) || '0'
  const stateStr = storage.getItem(`gameState_${sessionId}_${latestTurnStr}`)
  
  if (!stateStr) return null
  return JSON.parse(stateStr) as GameState
}

export async function saveMessages(sessionId: string, turnNumber: number, messages: Message[]) {
  const storage = getStorage()
  if (!storage) return

  const existingStr = storage.getItem(`messages_${sessionId}`)
  const existing: Message[] = existingStr ? JSON.parse(existingStr) : []
  
  // We don't append, we overwrite the full history since our app sends the full history
  // Wait, the API call passes the *new* messages to be saved.
  // In `page.tsx`: const messagesToSave = newUserMessage ? [newUserMessage, newAssistantMessage] : [newAssistantMessage]
  // So we should append.
  const updated = [...existing, ...messages]
  storage.setItem(`messages_${sessionId}`, JSON.stringify(updated))
}

export async function getMessageHistory(sessionId: string): Promise<Message[]> {
  const storage = getStorage()
  if (!storage) return []

  const existingStr = storage.getItem(`messages_${sessionId}`)
  if (!existingStr) return []
  return JSON.parse(existingStr) as Message[]
}

export async function updateSessionStatus(sessionId: string, status: 'complete' | 'burned') {
  const storage = getStorage()
  if (storage) {
    const sessionStr = storage.getItem(`session_${sessionId}`)
    if (sessionStr) {
      const session = JSON.parse(sessionStr)
      session.status = status
      storage.setItem(`session_${sessionId}`, JSON.stringify(session))
    }
  }
}
