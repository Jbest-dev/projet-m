import { useState } from "react"
import Lobby from "./components/Lobby"
import DeckImport from "./components/DeckImport"
import Battlefield from "./components/Battlefield"

function App() {
  const [roomCode, setRoomCode] = useState(undefined)
  const [gameState, setGameState] = useState(null)

  function handleGameStart(room) {
    setRoomCode(room)
  }

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
    <div style={{ height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {roomCode === undefined ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Lobby onGameStart={handleGameStart} />
        </div>
      ) : !gameState ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
          <DeckImport onDeckLoaded={startGame} />
        </div>
      ) : (
        <Battlefield
          gameState={gameState}
          onDraw={drawCard}
          setGameState={setGameState}
          onReset={resetGame}
          roomCode={roomCode}
        />
      )}
    </div>
  )
}

export default App