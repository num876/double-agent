export type ThreatLevel = 'green' | 'amber' | 'red' | 'burned'

export type AssetStatus = 'active' | 'suspected' | 'compromised' | 'burned' | 'extracted'

export interface Asset {
  id: string
  codename: string
  realName?: string          // revealed only if trust is high
  role: string               // e.g. "Soviet embassy cipher clerk"
  location: string
  trustLevel: number         // 0–100
  status: AssetStatus
  lastContact: string        // e.g. "48 hours ago"
  notes: string[]            // player-added intel notes
}

export interface IntelItem {
  id: string
  classification: 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET'
  summary: string
  source: string             // asset codename or 'signals'
  verified: boolean
  acquiredOnTurn: number
}

export interface GameState {
  sessionId: string
  missionId: string
  turn: number
  playerCodename: string
  location: string           // current city
  threatLevel: ThreatLevel
  assets: Asset[]
  intel: IntelItem[]
  cover: number              // 0–100, how intact your cover is
  agencyTrust: number        // 0–100, Langley's confidence in you
  missionObjective: string
  currentSceneTitle: string
  choices: Choice[]
  gameOver: boolean
  outcome?: 'success' | 'burned' | 'extracted' | 'compromised'
}

export interface Choice {
  id: string
  label: string              // short button text
  description?: string       // optional tooltip/detail
  risk: 'low' | 'medium' | 'high'
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}
