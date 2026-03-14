import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import DeckImport from "./components/DeckImport"
import Battlefield from "./components/Battlefield"

function App() {
  const [gameState, setGameState] = useState(null)

  function startGame(cards, commanderName) {
  const shuffled = [...cards].sort(() => Math.random() - 0.5)
  setGameState({
    library: shuffled.slice(7),
    hand: shuffled.slice(0, 7),
    battlefield: [],
    graveyard: [],
    exile: [],
    life: 40,
    commander: commanderName ? { name: commanderName, tapped: false, timesPlayed: 0, inPlay: false } : null
  })
}

  function drawCard() {
    if (gameState.library.length === 0) return
    const [drawn, ...rest] = gameState.library
    setGameState({ ...gameState, library: rest, hand: [...gameState.hand, drawn] })
  }

  function resetGame() {
    const allCards = [
      ...gameState.hand,
      ...gameState.battlefield,
      ...gameState.graveyard,
      ...gameState.exile,
      ...gameState.library
    ]
    startGame(allCards)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen p-4 flex flex-col gap-4">
        {!gameState ? (
          <div className="flex items-center justify-center flex-1 min-h-screen">
            <DeckImport onDeckLoaded={startGame} />
          </div>
        ) : (
          <Battlefield
            gameState={gameState}
            onDraw={drawCard}
            setGameState={setGameState}
            onReset={resetGame}
          />
        )}
      </div>
    </DndProvider>
  )
}

export default App