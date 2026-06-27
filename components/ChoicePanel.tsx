import { Choice } from '@/types/game'

export function ChoicePanel({
  choices,
  onChoiceSelect,
  disabled
}: {
  choices: Choice[]
  onChoiceSelect: (choice: Choice) => void
  disabled: boolean
}) {
  if (choices.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-6 border-t border-border bg-surface min-h-[160px] justify-center items-center">
        {disabled && <p className="text-secondary animate-pulse">TRANSMITTING...</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-6 border-t border-border bg-surface">
      {choices.map((choice) => {
        let riskColorClass = 'border-accent text-accent hover:bg-accent/10'
        if (choice.risk === 'medium') {
          riskColorClass = 'border-[#7a5c00] text-[#7a5c00] hover:bg-[#7a5c00]/10'
        } else if (choice.risk === 'high') {
          riskColorClass = 'border-danger text-danger hover:bg-danger/10'
        }

        return (
          <button
            key={choice.id}
            onClick={() => onChoiceSelect(choice)}
            disabled={disabled}
            className={`px-4 py-3 border text-left font-sans text-sm transition-colors ${riskColorClass} ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title={choice.description}
          >
            <span className="font-bold mr-2">[{choice.risk.toUpperCase()}]</span>
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}
