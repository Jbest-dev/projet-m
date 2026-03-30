import { useState, useEffect } from "react"

function DeckImport({ onDeckLoaded }) {
  const [deckText, setDeckText] = useState("")
  const [deckName, setDeckName] = useState("")
  const [commander, setCommander] = useState("")
  const [savedDecks, setSavedDecks] = useState([])
  const [archidektUrl, setArchidektUrl] = useState("")
  const [loadingArchidekt, setLoadingArchidekt] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("edhplay-decks")
      if (stored) setSavedDecks(JSON.parse(stored))
    } catch (e) {
      console.error("Erreur localStorage", e)
    }
  }, [])

  function parseDeck(text) {
    const lines = text.trim().split("\n")
    const cards = []
    for (const line of lines) {
      const match = line.match(/^(\d+)x?\s+(.+)$/)
      if (match) {
        const quantity = parseInt(match[1])
        const name = match[2].trim()
        for (let i = 0; i < quantity; i++) {
          cards.push({ quantity: 1, name })
        }
      }
    }
    return cards
  }

  async function importFromArchidekt() {
    setError(null)
    setLoadingArchidekt(true)
    try {
      const match = archidektUrl.match(/archidekt\.com\/decks\/(\d+)/)
      if (!match) {
        setError("URL Archidekt invalide ! Ex: https://archidekt.com/decks/12345")
        setLoadingArchidekt(false)
        return
      }

      const deckId = match[1]
      const response = await fetch(`https://corsproxy.io/?https://archidekt.com/api/decks/${deckId}/`)
      const data = await response.json()

      // Récupérer le nom du deck
      const name = data.name || "Deck importé"

      // Récupérer les cartes
      const cards = []
      let detectedCommander = ""

      for (const card of data.cards) {
        const cardName = card.card?.oracleCard?.name
        const quantity = card.quantity || 1
        const categories = card.categories || []

        if (!cardName) continue

        // Détecter le commandant
        if (categories.includes("Commander")) {
          detectedCommander = cardName
        }

        for (let i = 0; i < quantity; i++) {
          cards.push({ quantity: 1, name: cardName })
        }
      }

      // Remplir les champs
      const deckList = [...new Set(cards.map(c => c.name))].map(name => {
        const count = cards.filter(c => c.name === name).length
        return `${count} ${name}`
      }).join("\n")

      setDeckText(deckList)
      setDeckName(name)
      setCommander(detectedCommander)
      setArchidektUrl("")

    } catch (e) {
      setError("Erreur lors de l'import. Vérifie que le deck est public !")
      console.error(e)
    }
    setLoadingArchidekt(false)
  }

  function saveDeck() {
    if (!deckName.trim() || !deckText.trim()) return
    const newDeck = { name: deckName.trim(), list: deckText.trim(), commander: commander.trim() }
    const updated = [...savedDecks.filter(d => d.name !== newDeck.name), newDeck]
    setSavedDecks(updated)
    localStorage.setItem("edhplay-decks", JSON.stringify(updated))
    setDeckName("")
    setCommander("")
  }

  function deleteDeck(name) {
    const updated = savedDecks.filter(d => d.name !== name)
    setSavedDecks(updated)
    localStorage.setItem("edhplay-decks", JSON.stringify(updated))
  }

  function loadDeck(deck) {
    setDeckText(deck.list)
    setCommander(deck.commander || "")
  }

  function startGame() {
    const cards = parseDeck(deckText)
    if (cards.length === 0) return
    onDeckLoaded(cards, commander.trim())
  }

  return (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "1400px" }}>
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
        <p style={{ color: "#c9a84c99", fontFamily: "Crimson Text, serif" }}>
          Importe ton deck et joue !
        </p>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", padding: "20px", borderRadius: "12px", background: "rgba(45,24,16,0.9)", border: "1px solid #c9a84c" }}>
          <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", fontSize: "0.9rem" }}>📋 Importer un deck</h2>

          {/* Import Archidekt */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <p style={{ color: "#c9a84c80", fontFamily: "Crimson Text, serif", fontSize: "0.85rem" }}>
              🔗 Importer depuis Archidekt
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="https://archidekt.com/decks/12345..."
                value={archidektUrl}
                onChange={(e) => setArchidektUrl(e.target.value)}
                style={{ flex: 1, background: "rgba(0,0,0,0.3)", color: "#f0e6d3", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "8px", padding: "6px 12px", fontFamily: "Crimson Text, serif", fontSize: "0.9rem" }}
              />
              <button
                className="btn-dark"
                onClick={importFromArchidekt}
                disabled={loadingArchidekt || !archidektUrl.trim()}
              >
                {loadingArchidekt ? "⏳" : "📥 Importer"}
              </button>
            </div>
            {error && <p style={{ color: "#e63946", fontFamily: "Crimson Text, serif", fontSize: "0.85rem" }}>{error}</p>}
          </div>

          <div style={{ borderTop: "1px solid rgba(201,168,76,0.2)", paddingTop: "8px" }}>
            <p style={{ color: "#c9a84c80", fontFamily: "Crimson Text, serif", fontSize: "0.85rem", marginBottom: "6px" }}>
              ✍️ Ou colle ta liste manuellement
            </p>
            <textarea
              style={{ background: "rgba(0,0,0,0.3)", color: "#f0e6d3", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "8px", padding: "12px", height: "280px", resize: "none", fontFamily: "Crimson Text, serif", fontSize: "1rem", width: "100%" }}
              placeholder={"1 Sol Ring\n1 Command Tower\n1 Lightning Bolt..."}
              value={deckText}
              onChange={(e) => setDeckText(e.target.value)}
            />
          </div>

          <input
            type="text"
            placeholder="👑 Nom du commandant..."
            value={commander}
            onChange={(e) => setCommander(e.target.value)}
            style={{ background: "rgba(0,0,0,0.3)", color: "#f0d080", border: "1px solid rgba(201,168,76,0.5)", borderRadius: "8px", padding: "6px 12px", fontFamily: "Crimson Text, serif", fontSize: "0.95rem" }}
          />

          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Nom du deck..."
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              style={{ flex: 1, background: "rgba(0,0,0,0.3)", color: "#f0e6d3", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "8px", padding: "6px 12px", fontFamily: "Crimson Text, serif", fontSize: "0.9rem" }}
            />
            <button className="btn-dark" onClick={saveDeck}>💾 Sauver</button>
          </div>

          <button className="btn-gold" onClick={startGame}>⚔️ Jouer !</button>
        </div>

        <div style={{ width: "200px", display: "flex", flexDirection: "column", gap: "12px", padding: "20px", borderRadius: "12px", background: "rgba(45,24,16,0.9)", border: "1px solid rgba(201,168,76,0.3)" }}>
          <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", fontSize: "0.9rem" }}>📚 Mes decks</h2>

          {savedDecks.length === 0 ? (
            <p style={{ color: "#c9a84c60", fontFamily: "Crimson Text, serif", fontSize: "0.9rem" }}>Aucun deck sauvegardé</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {savedDecks.map(deck => (
                <div key={deck.name} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(201,168,76,0.15)" }}>
                  <button
                    onClick={() => loadDeck(deck)}
                    style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: "#f0e6d3", fontFamily: "Crimson Text, serif", fontSize: "0.95rem", cursor: "pointer" }}
                  >
                    {deck.name}
                    {deck.commander && (
                      <span style={{ display: "block", color: "#c9a84c80", fontSize: "0.8rem" }}>
                        👑 {deck.commander}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => deleteDeck(deck.name)}
                    style={{ background: "none", border: "none", color: "#e63946", cursor: "pointer" }}
                  >🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default DeckImport