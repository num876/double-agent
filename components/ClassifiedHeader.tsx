import { ThreatLevel } from '@/types/game'

export function ClassifiedHeader({ 
  missionName, 
  location, 
  threatLevel 
}: { 
  missionName: string
  location: string
  threatLevel: ThreatLevel 
}) {
  let threatColor = 'bg-success'
  if (threatLevel === 'amber') threatColor = 'bg-accent'
  if (threatLevel === 'red' || threatLevel === 'burned') threatColor = 'bg-danger'

  return (
    <div className="flex justify-between items-center px-6 py-3 border-b border-border bg-background">
      <div className="flex items-center gap-4">
        <h1 className="font-display text-2xl uppercase tracking-widest text-primary">
          {missionName.replace('-', ' ')}
        </h1>
        <div className="text-secondary font-sans text-sm">
          {location}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-secondary text-xs tracking-widest uppercase">
          Threat Level
        </span>
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-sm uppercase">
            {threatLevel}
          </span>
          <div className={`w-3 h-3 rounded-sm ${threatColor} ${threatLevel === 'red' || threatLevel === 'burned' ? 'animate-pulse' : ''}`} />
        </div>
      </div>
    </div>
  )
}
