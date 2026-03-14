import Card from "./card"
import { useDrag } from "react-dnd"

function CommanderCard({ commander }) {
  const [{ isDragging }, drag] = useDrag({
    type: "CARD",
    item: () => ({ card: commander, index: -1 }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  })

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.3 : 1, cursor: "grab" }}
    >
      <Card
        name={commander.name}
        tapped={commander.tapped}
        onClick={commander.onClick}
      />
    </div>
  )
}

function CommanderZone({ commander, onTap, onSendToCommand }) {
  if (!commander) return null

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
      padding: "12px",
      borderRadius: "12px",
      background: "rgba(201,168,76,0.08)",
      border: "2px solid #c9a84c",
      boxShadow: "0 0 20px rgba(201,168,76,0.2)",
      minWidth: "160px"
    }}>
      <p style={{
        fontFamily: "Cinzel, serif",
        color: "#c9a84c",
        fontSize: "0.7rem",
        letterSpacing: "0.1em"
      }}>
        👑 COMMANDANT
      </p>

      <CommanderCard
        commander={{ ...commander, onClick: () => onTap() }}
      />

      {/* Compteur de fois joué */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#c9a84c80", fontSize: "0.75rem", fontFamily: "Crimson Text, serif" }}>
          Fois joué :
        </span>
        <span style={{ color: "#f0d080", fontWeight: "bold", fontSize: "0.85rem", fontFamily: "Cinzel, serif" }}>
          {commander.timesPlayed || 0}
        </span>
      </div>

      <button
        onClick={onSendToCommand}
        style={{
          background: "rgba(201,168,76,0.15)",
          border: "1px solid #c9a84c60",
          borderRadius: "8px",
          color: "#c9a84c",
          fontFamily: "Crimson Text, serif",
          fontSize: "0.8rem",
          padding: "4px 10px",
          cursor: "pointer"
        }}
      >
        ↩️ Retour zone de commande
      </button>
    </div>
  )
}

export default CommanderZone