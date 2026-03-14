const ZONES = [
  { key: "creatures", label: "🐉 Créatures" },
  { key: "planeswalkers", label: "✨ Planeswalkers" },
  { key: "enchantements", label: "🔮 Enchantements & Artefacts" },
  { key: "terrains", label: "🌲 Terrains" },
  { key: "nonpermanent", label: "⚡ Non-permanent" },
]

function ZoneMenu({ onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#1a0f0a",
          border: "1px solid #c9a84c",
          borderRadius: "16px",
          padding: "20px",
          minWidth: "260px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h3 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", fontSize: "0.9rem" }}>
            Jouer dans quelle zone ?
          </h3>
          <button onClick={onClose} style={{ color: "#888", background: "none", border: "none", cursor: "pointer", fontSize: "1.1rem" }}>✕</button>
        </div>

        {ZONES.map(zone => (
          <button
            key={zone.key}
            onClick={() => onSelect(zone.key)}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "10px",
              color: "#f0e6d3",
              fontFamily: "Crimson Text, serif",
              fontSize: "1rem",
              padding: "8px 16px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s"
            }}
            onMouseEnter={e => e.target.style.background = "rgba(201,168,76,0.15)"}
            onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.04)"}
          >
            {zone.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ZoneMenu