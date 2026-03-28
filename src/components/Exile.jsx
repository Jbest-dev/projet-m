import { useState } from "react"
import { createPortal } from "react-dom"
import Card from "./card"

const RECOVERY_OPTIONS = [
  { key: "hand", label: "🃏 Mettre en main" },
  { key: "battlefield", label: "⚔️ Jouer sur le battlefield" },
  { key: "library", label: "📚 Remettre dans le deck" },
]

function Exile({ exile, onRecoverCard }) {
  const [open, setOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  function handleRecover(destination) {
    onRecoverCard(selectedCard.index, destination, "exile")
    setSelectedCard(null)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-dark">
        🌀 Exil : {exile.length}
      </button>

      {open && createPortal(
        <div
          onClick={() => { setOpen(false); setSelectedCard(null) }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#1a0f0a",
              border: "1px solid #c9a84c",
              borderRadius: "16px",
              padding: "24px",
              width: "90vw",
              maxWidth: "900px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              gap: "16px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c" }}>🌀 Exil</h2>
              <button
                onClick={() => { setOpen(false); setSelectedCard(null) }}
                style={{ background: "none", border: "none", color: "#f0e6d3", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1 }}
              >✕</button>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {exile.length === 0 ? (
                <p style={{ color: "#c9a84c60", fontFamily: "Crimson Text, serif" }}>L'exil est vide</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {exile.map((card, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedCard({ card, index: i })}
                      style={{
                        cursor: "pointer",
                        outline: selectedCard?.index === i ? "2px solid #c9a84c" : "none",
                        borderRadius: "8px"
                      }}
                    >
                      <Card name={card.name} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedCard && (
              <div style={{
                borderTop: "1px solid rgba(201,168,76,0.3)",
                paddingTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", fontSize: "0.8rem" }}>
                  Récupérer "{selectedCard.card.name}" :
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {RECOVERY_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      className="btn-gold"
                      onClick={() => {
                        handleRecover(opt.key)
                        setOpen(false)
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Exile