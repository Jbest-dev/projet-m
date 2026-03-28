import { useState, useRef } from "react"
import { createPortal } from "react-dom"
import Card from "./card"

function Library({ library, onTakeCard, onDrawX, onLookX, onShuffle }) {
  const [open, setOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)
  const [drawCount, setDrawCount] = useState(1)
  const [lookMode, setLookMode] = useState(false)
  const [lookCards, setLookCards] = useState([])
  const [lookCount, setLookCount] = useState(3)
  const buttonRef = useRef(null)

  function handleRightClick(e) {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  function closeContextMenu() {
    setContextMenu(null)
  }

  function handleDrawX() {
    onDrawX(drawCount)
    setContextMenu(null)
  }

  function handleLookX() {
    const cards = library.slice(0, lookCount)
    setLookCards(cards)
    setLookMode(true)
    setContextMenu(null)
  }

  function handleShuffle() {
    onShuffle()
    setContextMenu(null)
  }

  function putOnTop(index) {
    const card = lookCards[index]
    const newLookCards = lookCards.filter((_, i) => i !== index)
    setLookCards([card, ...newLookCards])
  }

  function putOnBottom(index) {
    const card = lookCards[index]
    const newLookCards = lookCards.filter((_, i) => i !== index)
    setLookCards([...newLookCards, card])
  }

  function sendToGraveyard(index) {
    const newLookCards = lookCards.filter((_, i) => i !== index)
    setLookCards(newLookCards)
  }

  function confirmLook() {
    onLookX(lookCards)
    setLookMode(false)
    setLookCards([])
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(true)}
        onContextMenu={handleRightClick}
        className="btn-dark"
      >
        📚 Bibliothèque : {library.length}
      </button>

      {/* Menu contextuel clic droit */}
      {contextMenu && createPortal(
        <div
          onClick={closeContextMenu}
          style={{ position: "fixed", inset: 0, zIndex: 9998 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              background: "#1a0f0a",
              border: "1px solid #c9a84c",
              borderRadius: "12px",
              padding: "12px",
              zIndex: 9999,
              minWidth: "220px",
              display: "flex",
              flexDirection: "column",
              gap: "10px"
            }}
          >
            {/* Piocher X */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#f0e6d3", fontFamily: "Crimson Text, serif", fontSize: "0.9rem", flex: 1 }}>
                🃏 Piocher
              </span>
              <input
                type="number"
                min="1"
                max={library.length}
                value={drawCount}
                onChange={e => setDrawCount(parseInt(e.target.value))}
                style={{ width: "48px", background: "rgba(0,0,0,0.3)", color: "#f0e6d3", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "6px", padding: "2px 6px", textAlign: "center" }}
              />
              <button className="btn-gold" onClick={handleDrawX}>OK</button>
            </div>

            {/* Regarder X */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#f0e6d3", fontFamily: "Crimson Text, serif", fontSize: "0.9rem", flex: 1 }}>
                👁️ Regarder
              </span>
              <input
                type="number"
                min="1"
                max={library.length}
                value={lookCount}
                onChange={e => setLookCount(parseInt(e.target.value))}
                style={{ width: "48px", background: "rgba(0,0,0,0.3)", color: "#f0e6d3", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "6px", padding: "2px 6px", textAlign: "center" }}
              />
              <button className="btn-gold" onClick={handleLookX}>OK</button>
            </div>

            {/* Mélanger */}
            <button
              className="btn-dark"
              onClick={handleShuffle}
              style={{ width: "100%" }}
            >
              🔀 Mélanger le deck
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Mode regarder X cartes */}
      {lookMode && createPortal(
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div style={{
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
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c" }}>
                👁️ Cartes du dessus ({lookCards.length})
              </h2>
              <button className="btn-gold" onClick={confirmLook}>
                ✅ Confirmer l'ordre
              </button>
            </div>

            <p style={{ color: "#c9a84c80", fontFamily: "Crimson Text, serif", fontSize: "0.85rem" }}>
              L'ordre affiché sera l'ordre du dessus du deck. #1 = prochaine carte piochée.
            </p>

            <div style={{ overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {lookCards.map((card, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <div style={{
                      background: "rgba(201,168,76,0.1)",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontFamily: "Cinzel, serif",
                      color: "#c9a84c",
                      fontSize: "0.65rem"
                    }}>
                      #{i + 1}
                    </div>
                    <Card name={card.name} />
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                      <button
                        className="btn-dark"
                        style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                        onClick={() => putOnTop(i)}
                      >
                        ⬆️ Dessus
                      </button>
                      <button
                        className="btn-dark"
                        style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                        onClick={() => putOnBottom(i)}
                      >
                        ⬇️ Dessous
                      </button>
                      <button
                        className="btn-dark"
                        style={{ fontSize: "0.65rem", padding: "2px 6px" }}
                        onClick={() => {
                          onTakeCard(library.findIndex(c => c.name === card.name))
                          setLookCards(lookCards.filter((_, idx) => idx !== i))
                        }}
                      >
                        🃏 En main
                      </button>
                      <button
                        style={{ fontSize: "0.65rem", padding: "2px 6px", background: "none", border: "1px solid #e6394640", borderRadius: "20px", color: "#e63946", cursor: "pointer" }}
                        onClick={() => sendToGraveyard(i)}
                      >
                        💀 Cimetière
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Popup bibliothèque normale */}
      {open && createPortal(
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 50,
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
              <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c" }}>📚 Bibliothèque</h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", color: "#f0e6d3", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1 }}
              >✕</button>
            </div>

            <div style={{ overflowY: "auto", flex: 1 }}>
              {library.length === 0 ? (
                <p style={{ color: "#c9a84c60", fontFamily: "Crimson Text, serif" }}>La bibliothèque est vide !</p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {library.map((card, i) => (
                    <div
                      key={i}
                      onClick={(e) => {
                        e.stopPropagation()
                        onTakeCard(i)
                        setOpen(false)
                      }}
                      style={{ cursor: "pointer", position: "relative" }}
                    >
                      <Card name={card.name} />
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(201,168,76,0.85)",
                        color: "#1a0f0a",
                        fontFamily: "Cinzel, serif",
                        fontSize: "0.6rem",
                        textAlign: "center",
                        padding: "2px",
                        borderRadius: "0 0 8px 8px",
                        fontWeight: "bold"
                      }}>
                        → MAIN
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default Library