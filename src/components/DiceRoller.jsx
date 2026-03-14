import { useState } from "react"

const DICE = [4, 6, 8, 10, 12, 20, 100]

function DiceRoller() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState(null)
  const [lastDice, setLastDice] = useState(null)

  function roll(faces) {
    const value = Math.floor(Math.random() * faces) + 1
    setLastDice(faces)
    setResult(value)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-sm"
      >
        🎲 Dés
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-80">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-purple-400 font-bold text-xl">🎲 Lancer un dé</h2>
              <button
                onClick={() => { setOpen(false); setResult(null) }}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >✕</button>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {DICE.map(faces => (
                <button
                  key={faces}
                  onClick={() => roll(faces)}
                  className="bg-purple-700 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-lg"
                >
                  d{faces}
                </button>
              ))}
            </div>

            {result && (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">d{lastDice}</p>
                <p className="text-6xl font-bold text-white">{result}</p>
                {lastDice === 20 && result === 20 && (
                  <p className="text-yellow-400 font-bold mt-2">🎉 Nat 20 !</p>
                )}
                {lastDice === 20 && result === 1 && (
                  <p className="text-red-400 font-bold mt-2">💀 Nat 1...</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default DiceRoller