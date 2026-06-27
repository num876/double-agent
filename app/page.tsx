'use client'

import { useRouter } from 'next/navigation'
import { createSession } from '@/lib/game-state'

const MISSIONS = [
  {
    id: 'vienna-1973',
    title: 'VIENNA 1973',
    hook: 'A contact has failed to appear at a dead drop in Stadtpark. His handler has shown up instead.',
    classification: 'TOP SECRET'
  },
  {
    id: 'berlin-1976',
    title: 'BERLIN 1976',
    hook: 'A senior Stasi officer wants to defect. You have 72 hours before his absence is noticed.',
    classification: 'SECRET'
  },
  {
    id: 'istanbul-1979',
    title: 'ISTANBUL 1979',
    hook: 'A signals intercept suggests one of your three active assets is a double agent.',
    classification: 'EYES ONLY'
  }
]

export default function LandingPage() {
  const router = useRouter()

  const handleStartMission = async (missionId: string) => {
    try {
      // Basic initial state for vienna-1973; you would build this dynamically based on missionId
      const initialState = {
        missionId,
        turn: 0,
        playerCodename: 'ORION', // default for now
        location: missionId === 'vienna-1973' ? 'Vienna, Austria' : missionId === 'berlin-1976' ? 'Berlin, East Germany' : 'Istanbul, Turkey',
        threatLevel: 'green' as const,
        assets: missionId === 'vienna-1973' ? [
          {
            id: 'asset-1',
            codename: 'SPARROW',
            role: 'Soviet embassy cipher clerk',
            location: 'Vienna',
            trustLevel: 72,
            status: 'active' as const,
            lastContact: '6 days ago',
            notes: []
          },
          {
            id: 'asset-2',
            codename: 'IRONWOOD',
            role: 'Austrian interior ministry official',
            location: 'Vienna',
            trustLevel: 55,
            status: 'active' as const,
            lastContact: '3 weeks ago',
            notes: []
          }
        ] : [],
        intel: [],
        cover: 90,
        agencyTrust: 75,
        missionObjective: missionId === 'vienna-1973' 
          ? 'Determine why SPARROW missed the Stadtpark dead drop. Assess whether network is compromised.'
          : 'Complete the mission objective.',
        currentSceneTitle: 'Briefing',
        choices: [],
        gameOver: false
      }

      const sessionId = await createSession(missionId, initialState)
      router.push(`/game/${sessionId}`)
    } catch (e) {
      console.error('Failed to start mission', e)
      alert('Error connecting to database. Make sure Supabase is configured.')
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-primary">
      <div className="max-w-4xl w-full">
        <h1 className="font-display text-5xl md:text-7xl text-center mb-16 tracking-widest uppercase">
          Double Agent
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MISSIONS.map(mission => (
            <div 
              key={mission.id}
              className="border border-border bg-surface p-6 flex flex-col group hover:border-accent transition-colors"
            >
              <div className="text-danger font-sans text-xs font-bold mb-4 tracking-widest uppercase">
                [{mission.classification}]
              </div>
              <h2 className="font-display text-2xl mb-4 tracking-wider">
                {mission.title}
              </h2>
              <p className="font-sans text-sm text-secondary flex-grow mb-8 leading-relaxed">
                {mission.hook}
              </p>
              
              <button 
                onClick={() => handleStartMission(mission.id)}
                className="border border-border py-3 font-sans text-sm uppercase tracking-widest text-primary hover:bg-accent hover:text-background hover:border-accent transition-colors w-full"
              >
                Begin Mission
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
