import { useState, useEffect } from "react"
import socket from "../services/socket"

function Lobby({ onGameStart }) {
  const [playerName, setPlayerName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [currentRoom, setCurrentRoom] = useState(null)
  const [players, setPlayers] = useState([])
  const [error, setError] = useState(null)
  const [mode, setMode] = useState(null) // "create" ou "join"

  useEffect(() => {
    socket.connect()

    socket.on("room_created", ({ roomCode }) => {
      setCurrentRoom(roomCode)
      setPlayers([{ name: playerName }])
    })

    socket.on("room_joined", ({ roomCode, players }) => {
  setCurrentRoom(roomCode)
  setPlayers(players)
  // Demander les états existants
  socket.emit("request_states", { roomCode })
})

    socket.on("player_joined", ({ players }) => {
      setPlayers(players)
    })

    socket.on("player_left", ({ players }) => {
      setPlayers(players)
    })

    socket.on("error", ({ message }) => {
      setError(message)
    })

    return () => {
      socket.off("room_created")
      socket.off("room_joined")
      socket.off("player_joined")
      socket.off("player_left")
      socket.off("error")
    }
  }, [playerName])

  function createRoom() {
    if (!playerName.trim()) return
    socket.emit("create_room", { playerName })
  }

  function joinRoom() {
    if (!playerName.trim() || !roomCode.trim()) return
    socket.emit("join_room", { roomCode: roomCode.toUpperCase(), playerName })
  }

  function startSolo() {
    onGameStart(null)
  }

  if (currentRoom) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "24px", borderRadius: "16px", background: "rgba(45,24,16,0.9)", border: "1px solid #c9a84c", minWidth: "320px" }}>
        <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c" }}>🏰 Room : {currentRoom}</h2>
        <p style={{ color: "#c9a84c60", fontFamily: "Crimson Text, serif", fontSize: "0.85rem" }}>
          Partage ce code à tes amis !
        </p>

        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "12px 24px", border: "2px solid #c9a84c" }}>
          <span style={{ fontFamily: "Cinzel, serif", fontSize: "2rem", color: "#f0d080", letterSpacing: "0.2em" }}>
            {currentRoom}
          </span>
        </div>

        <div style={{ width: "100%" }}>
          <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.75rem", marginBottom: "8px" }}>
            JOUEURS ({players.length}/4)
          </p>
          {players.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", marginBottom: "4px" }}>
              <span style={{ color: "#2dc653" }}>●</span>
              <span style={{ color: "#f0e6d3", fontFamily: "Crimson Text, serif" }}>{p.name}</span>
            </div>
          ))}
        </div>

        <button className="btn-gold" onClick={() => onGameStart(currentRoom)}>
          ⚔️ Lancer la partie !
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", width: "100%", maxWidth: "400px" }}>

      <div style={{ textAlign: "center" }}>
        <h1 style={{
          fontFamily: "Cinzel, serif",
          fontSize: "2rem",
          fontWeight: 900,
          background: "linear-gradient(135deg, #c9a84c, #f0d080, #c9a84c)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "0.1em"
        }}>
          ⚔️ EDH Play Local
        </h1>
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px", padding: "20px", borderRadius: "12px", background: "rgba(45,24,16,0.9)", border: "1px solid #c9a84c" }}>

        <input
          type="text"
          placeholder="Ton nom de joueur..."
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          style={{ background: "rgba(0,0,0,0.3)", color: "#f0e6d3", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "8px", padding: "8px 12px", fontFamily: "Crimson Text, serif", fontSize: "1rem" }}
        />

        {error && (
          <p style={{ color: "#e63946", fontFamily: "Crimson Text, serif", fontSize: "0.9rem" }}>{error}</p>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-gold" style={{ flex: 1 }} onClick={createRoom}>
            🏰 Créer une room
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Code de la room..."
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            style={{ flex: 1, background: "rgba(0,0,0,0.3)", color: "#f0d080", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "8px", padding: "8px 12px", fontFamily: "Crimson Text, serif", fontSize: "1rem", letterSpacing: "0.1em" }}
          />
          <button className="btn-dark" onClick={joinRoom}>
            🚪 Rejoindre
          </button>
        </div>

        <div style={{ borderTop: "1px solid rgba(201,168,76,0.2)", paddingTop: "12px", textAlign: "center" }}>
          <button className="btn-dark" onClick={startSolo}>
            🧙 Jouer en solo
          </button>
        </div>

      </div>
    </div>
  )
}

export default Lobby