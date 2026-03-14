import { useEffect, useState } from "react"
import { fetchCard } from "../services/scryfall"

function card({ name, quantity, tapped, onClick }) {
  const [cardData, setCardData] = useState(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    fetchCard(name).then(setCardData)
  }, [name])

  if (!cardData) return (
    <div style={{ width: "128px", height: "176px", background: "#2d1810", borderRadius: "8px" }} />
  )

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer"
    >
      <div style={{
        transform: tapped ? "rotate(90deg)" : "rotate(0deg)",
        transition: "transform 0.2s"
      }}>
        <img
          src={cardData.image_uris?.normal}
          alt={name}
          style={{ width: "128px", height: "176px", borderRadius: "8px", pointerEvents: "none", display: "block" }}
        />
      </div>

      {quantity > 1 && (
        <span style={{
          position: "absolute", top: "4px", right: "4px",
          background: "#9b5de5", color: "white", fontSize: "0.7rem",
          fontWeight: "bold", borderRadius: "50%", width: "20px", height: "20px",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {quantity}
        </span>
      )}

      {hovered && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          pointerEvents: "none"
        }}>
          <img
            src={cardData.image_uris?.large || cardData.image_uris?.normal}
            alt={name}
            style={{ width: "300px", height: "auto", borderRadius: "12px", boxShadow: "0 8px 40px rgba(0,0,0,0.8)", border: "2px solid #c9a84c" }}
          />
        </div>
      )}
    </div>
  )
}

export default card