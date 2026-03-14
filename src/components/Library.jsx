import { useState } from "react"
import Card from "./card"

function Library({ library, onTakeCard }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-dark"
      >
        📚 Bibliothèque : {library.length}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div style={{ background: "#1a0f0a", border: "1px solid #c9a84c", borderRadius: "16px", padding: "24px", maxWidth: "800px", width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <div className="flex justify-between items-center mb-4">
              <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c" }}>📚 Bibliothèque</h2>
              <button onClick={() => setOpen(false)} style={{ color: "#888", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
            </div>

            {library.length === 0 ? (
              <p style={{ color: "#c9a84c60" }}>La bibliothèque est vide !</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {library.map((card, i) => (
                  <div
                     key={i}
                        onClick={(e) => {
  e.stopPropagation()
  console.log("clic carte index:", i)
  onTakeCard(i)
  setOpen(false)
}}
                         style={{ cursor: "pointer", position: "relative" }}
                         title="Clic → mettre en main"
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
      )}
    </>
  )
}

export default Library