import { useState } from "react"
import Card from "./card"

function Exile({ exile }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded-full text-sm"
      >
        🚀 Exil : {exile.length}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-purple-400 font-bold text-xl">🚀 Exil</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {exile.length === 0 ? (
              <p className="text-gray-400">L'exil est vide</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {exile.map((card, i) => (
                  <Card key={i} name={card.name} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Exile