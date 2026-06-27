import { GameState, Asset } from '@/types/game'

export function DossierPanel({ state }: { state: GameState }) {
  const coverIsCritical = state.cover < 40

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border text-sm overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="font-display text-xl text-secondary uppercase tracking-widest mb-4">Dossier</h2>
        
        <div className="mb-4">
          <div className="flex justify-between text-secondary mb-1">
            <span>COVER INTEGRITY</span>
            <span className={coverIsCritical ? 'text-danger' : 'text-primary'}>{state.cover}%</span>
          </div>
          <div className="h-2 bg-background w-full">
            <div 
              className={`h-full ${coverIsCritical ? 'bg-danger' : 'bg-primary'}`} 
              style={{ width: `${state.cover}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-secondary mb-1">
            <span>AGENCY TRUST</span>
            <span className="text-primary">{state.agencyTrust}%</span>
          </div>
          <div className="h-2 bg-background w-full">
            <div 
              className="h-full bg-accent" 
              style={{ width: `${state.agencyTrust}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <h3 className="font-display text-lg text-secondary uppercase tracking-widest mb-3">Active Assets</h3>
        <div className="flex flex-col gap-3">
          {state.assets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
          {state.assets.length === 0 && (
            <p className="text-secondary italic">No active assets.</p>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg text-secondary uppercase tracking-widest mb-3">Intel</h3>
        <div className="flex flex-col gap-3">
          {state.intel.map(item => (
            <div key={item.id} className="border border-border p-2">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold ${
                  item.classification === 'TOP SECRET' ? 'text-danger' : 'text-accent'
                }`}>{item.classification}</span>
                {item.verified && <span className="text-success text-xs">[VERIFIED]</span>}
              </div>
              <p className="text-primary mb-1">{item.summary}</p>
              <div className="text-secondary text-xs">Source: {item.source} (Turn {item.acquiredOnTurn})</div>
            </div>
          ))}
          {state.intel.length === 0 && (
            <p className="text-secondary italic">No verified intel.</p>
          )}
        </div>
      </div>
    </div>
  )
}

function AssetCard({ asset }: { asset: Asset }) {
  let statusColor = 'bg-success'
  let isCompromised = false

  if (asset.status === 'suspected') {
    statusColor = 'bg-accent'
  } else if (asset.status === 'compromised' || asset.status === 'burned' || asset.status === 'extracted') {
    statusColor = 'bg-danger'
    isCompromised = true
  }

  return (
    <div className="border border-border p-2">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className={`font-bold ${isCompromised ? 'line-through text-danger' : 'text-primary'}`}>
            {asset.codename}
          </span>
        </div>
        <span className="text-secondary text-xs">{asset.trustLevel}% Trust</span>
      </div>
      <div className="text-secondary text-xs mb-1">{asset.role}</div>
      <div className="text-secondary text-xs mb-1">Loc: {asset.location}</div>
      <div className="text-secondary text-xs">Last contact: {asset.lastContact}</div>
      {asset.notes.length > 0 && (
        <ul className="mt-2 text-xs list-disc pl-4 text-primary">
          {asset.notes.map((note, i) => <li key={i}>{note}</li>)}
        </ul>
      )}
    </div>
  )
}
