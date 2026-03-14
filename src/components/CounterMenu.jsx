import { useState } from "react"

const COUNTER_TYPES = [
  { label: "+1/+1", color: "text-green-400", key: "plus1" },
  { label: "-1/-1", color: "text-red-400", key: "minus1" },
  { label: "⚡ Charge", color: "text-yellow-400", key: "charge" },
  { label: "😵 Étourdi", color: "text-blue-400", key: "stun" },
  { label: "☠️ Poison", color: "text-purple-400", key: "poison" },
  { label: "🛡️ Loyauté", color: "text-orange-400", key: "loyalty" },
  { label: "📖 Expérience", color: "text-pink-400", key: "xp" },
]

function CounterMenu({ counters = {}, onUpdate }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded-full"
      >
        🪙 Compteurs
      </button>

      {open && (
        <div
          className="absolute bottom-8 left-0 bg-gray-800 border border-gray-600 rounded-xl p-3 z-50 flex flex-col gap-2 shadow-2xl"
          style={{ minWidth: "160px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400 font-bold">Compteurs</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
              }}
              className="text-gray-400 hover:text-white text-xs"
            >✕</button>
          </div>

          {COUNTER_TYPES.map((type) => (
            <div key={type.key} className="flex items-center justify-between gap-2">
              <span className={`text-xs font-bold ${type.color}`}>{type.label}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdate(type.key, -1)}
                  className="text-xs bg-gray-600 hover:bg-gray-500 w-5 h-5 rounded-full flex items-center justify-center"
                >−</button>
                <span className="text-xs text-white w-4 text-center">
                  {counters[type.key] || 0}
                </span>
                <button
                  onClick={() => onUpdate(type.key, 1)}
                  className="text-xs bg-gray-600 hover:bg-gray-500 w-5 h-5 rounded-full flex items-center justify-center"
                >+</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CounterMenu