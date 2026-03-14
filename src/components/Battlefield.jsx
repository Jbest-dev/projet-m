import { useState } from "react"
import { useDrag, useDrop } from "react-dnd"
import Card from "./card"
import Graveyard from "./Graveyard"
import Library from "./Library"
import Exile from "./Exile"
import CounterMenu from "./CounterMenu"
import DiceRoller from "./DiceRoller"
import ZoneMenu from "./ZoneMenu"
import CommanderZone from "./CommanderZone"

function BattlefieldCard({ card, index, onTap, onCounterUpdate }) {
  const [{ isDragging }, drag] = useDrag({
    type: "CARD",
    item: () => ({ card, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  })

  return (
    <div
      ref={drag}
      className="flex flex-col items-center gap-1"
      style={{ opacity: isDragging ? 0.3 : 1, cursor: "grab" }}
    >
      <Card
        name={card.name}
        quantity={card.quantity}
        tapped={card.tapped}
        onClick={() => onTap(index)}
      />

      {card.counters && Object.entries(card.counters).some(([_, v]) => v > 0) && (
        <div className="flex flex-wrap gap-1 justify-center max-w-[128px]">
          {Object.entries(card.counters)
            .filter(([_, v]) => v > 0)
            .map(([key, value]) => {
              const types = {
                plus1: { label: `+${value}/+${value}`, color: "bg-green-700" },
                minus1: { label: `-${value}/-${value}`, color: "bg-red-700" },
                charge: { label: `⚡ x${value}`, color: "bg-yellow-700" },
                stun: { label: `😵 x${value}`, color: "bg-blue-700" },
                poison: { label: `☠️ x${value}`, color: "bg-purple-700" },
                loyalty: { label: `🛡️ x${value}`, color: "bg-orange-700" },
                xp: { label: `📖 x${value}`, color: "bg-pink-700" },
              }
              const type = types[key]
              return (
                <span key={key} className={`text-xs text-white font-bold px-1 rounded ${type.color}`}>
                  {type.label}
                </span>
              )
            })}
        </div>
      )}

      <CounterMenu
        counters={card.counters || {}}
        onUpdate={(key, amount) => onCounterUpdate(index, key, amount)}
      />
    </div>
  )
}

function BattleZone({ label, cards, onDrop, onTap, onCounterUpdate, minHeight = "120px" }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item) => onDrop(item.card, item.index),
    collect: (monitor) => ({ isOver: monitor.isOver() })
  }))

  return (
    <div
      ref={drop}
      style={{
        minHeight,
        background: isOver ? "rgba(201,168,76,0.08)" : "rgba(0,0,0,0.15)",
        border: isOver ? "1px solid #c9a84c" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "10px",
        transition: "all 0.2s",
        flex: 1
      }}
    >
      <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c99", fontSize: "0.7rem", letterSpacing: "0.08em", marginBottom: "8px" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-4">
        {cards.map((card) => (
          <BattlefieldCard
            key={card._globalIndex}
            card={card}
            index={card._globalIndex}
            onTap={onTap}
            onCounterUpdate={onCounterUpdate}
          />
        ))}
      </div>
    </div>
  )
}

function DropZone({ onDrop, children }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "CARD",
    drop: (item) => onDrop(item.card, item.index),
    collect: (monitor) => ({ isOver: monitor.isOver() })
  }))

  return (
    <div
      ref={drop}
      style={{
        transition: "all 0.2s",
        transform: isOver ? "scale(1.1)" : "scale(1)",
        outline: isOver ? "2px solid #c9a84c" : "none",
        borderRadius: "20px"
      }}
    >
      {children}
    </div>
  )
}

function Battlefield({ gameState, onDraw, setGameState, onReset }) {
  const [zoneMenu, setZoneMenu] = useState(null)

  function openZoneMenu(card, index) {
    setZoneMenu({ card, index, suggested: null })
  }

  function playCardToZone(zone) {
    const { card, index } = zoneMenu
    const newHand = gameState.hand.filter((_, i) => i !== index)
    setGameState(prev => ({
      ...prev,
      hand: newHand,
      battlefield: [...prev.battlefield, { ...card, tapped: false, zone }]
    }))
    setZoneMenu(null)
  }

  function tapCard(index) {
    setGameState(prev => ({
      ...prev,
      battlefield: prev.battlefield.map((card, i) =>
        i === index ? { ...card, tapped: !card.tapped } : card
      )
    }))
  }

  function moveToZone(card, fromIndex, toZone) {
    setGameState(prev => ({
      ...prev,
      battlefield: prev.battlefield.map((c, i) =>
        i === fromIndex ? { ...c, zone: toZone } : c
      )
    }))
  }

  function sendToGraveyard(card, index) {
    setGameState(prev => ({
      ...prev,
      battlefield: prev.battlefield.filter((_, i) => i !== index),
      graveyard: [...prev.graveyard, card]
    }))
  }

  function sendToExile(card, index) {
    setGameState(prev => ({
      ...prev,
      battlefield: prev.battlefield.filter((_, i) => i !== index),
      exile: [...prev.exile, card]
    }))
  }

  function untapAll() {
    setGameState(prev => ({
      ...prev,
      battlefield: prev.battlefield.map(c => ({ ...c, tapped: false }))
    }))
  }

  function newTurn() {
    setGameState(prev => {
      if (prev.library.length === 0) return prev
      const [drawn, ...rest] = prev.library
      return {
        ...prev,
        library: rest,
        hand: [...prev.hand, drawn],
        battlefield: prev.battlefield.map(c => ({ ...c, tapped: false }))
      }
    })
  }

  function updateCounter(index, key, amount) {
    setGameState(prev => ({
      ...prev,
      battlefield: prev.battlefield.map((card, i) =>
        i === index ? {
          ...card,
          counters: {
            ...(card.counters || {}),
            [key]: Math.max(0, (card.counters?.[key] || 0) + amount)
          }
        } : card
      )
    }))
  }

  function tapCommander() {
    setGameState(prev => ({
      ...prev,
      commander: { ...prev.commander, tapped: !prev.commander.tapped }
    }))
  }

  function playCommander() {
    setGameState(prev => ({
      ...prev,
      commander: {
        ...prev.commander,
        inPlay: true,
        tapped: false,
        timesPlayed: (prev.commander.timesPlayed || 0) + 1
      }
    }))
  }

  function sendToCommandZone() {
    setGameState(prev => ({
      ...prev,
      commander: { ...prev.commander, inPlay: false, tapped: false }
    }))
  }

  function takeFromLibrary(index) {
    setGameState(prev => {
      const card = prev.library[index]
      const newLibrary = prev.library.filter((_, i) => i !== index)
      return {
        ...prev,
        library: newLibrary,
        hand: [...prev.hand, card]
      }
    })
  }

  const indexedBattlefield = gameState.battlefield.map((card, i) => ({
    ...card,
    _globalIndex: i
  }))

  const zones = {
    creatures: indexedBattlefield.filter(c => c.zone === "creatures"),
    planeswalkers: indexedBattlefield.filter(c => c.zone === "planeswalkers"),
    enchantements: indexedBattlefield.filter(c => c.zone === "enchantements"),
    terrains: indexedBattlefield.filter(c => c.zone === "terrains"),
    nonpermanent: indexedBattlefield.filter(c => c.zone === "nonpermanent"),
  }

  return (
    <div className="w-full flex flex-col gap-3">

      <div className="flex justify-end">
        <button
          onClick={onReset}
          style={{ fontSize: "0.65rem", color: "#e63946", background: "none", border: "1px solid #e6394640", borderRadius: "20px", padding: "4px 10px", cursor: "pointer" }}
        >
          🔁 Recommencer
        </button>
      </div>

      <div className="control-bar flex gap-3 justify-center items-center flex-wrap px-4">
        <DiceRoller />
        <Library library={gameState.library} onTakeCard={takeFromLibrary} />
        <DropZone onDrop={sendToGraveyard}>
          <Graveyard graveyard={gameState.graveyard} />
        </DropZone>
        <DropZone onDrop={sendToExile}>
          <Exile exile={gameState.exile} />
        </DropZone>
        <div className="life-counter flex items-center gap-2">
          <button onClick={() => setGameState(prev => ({ ...prev, life: prev.life - 1 }))}
            style={{ color: "#e63946", fontWeight: "bold", fontSize: "1.2rem", background: "none", border: "none", cursor: "pointer" }}>−</button>
          <span style={{ fontFamily: "Cinzel, serif", fontWeight: 700, fontSize: "1rem" }}>❤️ {gameState.life}</span>
          <button onClick={() => setGameState(prev => ({ ...prev, life: prev.life + 1 }))}
            style={{ color: "#2dc653", fontWeight: "bold", fontSize: "1.2rem", background: "none", border: "none", cursor: "pointer" }}>+</button>
        </div>
        <button className="btn-gold" onClick={onDraw}>Piocher 🃏</button>
        <button className="btn-dark" onClick={untapAll}>🔄 Untap All</button>
        <button className="btn-gold" onClick={newTurn}>⏭️ Nouveau tour</button>
      </div>

      {gameState.commander && (
        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
          {gameState.commander.inPlay ? (
            <CommanderZone
              commander={gameState.commander}
              onTap={tapCommander}
              onSendToCommand={sendToCommandZone}
            />
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(201,168,76,0.05)",
              border: "2px dashed #c9a84c60",
              minWidth: "160px"
            }}>
              <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.7rem" }}>
                👑 COMMANDANT
              </p>
              <Card name={gameState.commander.name} />
              <button className="btn-gold" onClick={playCommander}>
                ⚔️ Jouer
              </button>
              <span style={{ color: "#c9a84c60", fontSize: "0.75rem", fontFamily: "Crimson Text, serif" }}>
                Fois joué : {gameState.commander.timesPlayed || 0}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="battlefield p-4">
        <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", marginBottom: "12px", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
          ⚔️ BATTLEFIELD
        </h2>

        <div className="flex gap-3 mb-3">
          <BattleZone
            label="🐉 CRÉATURES"
            cards={zones.creatures}
            onDrop={(card, index) => moveToZone(card, index, "creatures")}
            onTap={tapCard}
            onCounterUpdate={updateCounter}
            minHeight="140px"
          />
          <BattleZone
            label="✨ PLANESWALKERS"
            cards={zones.planeswalkers}
            onDrop={(card, index) => moveToZone(card, index, "planeswalkers")}
            onTap={tapCard}
            onCounterUpdate={updateCounter}
            minHeight="140px"
          />
        </div>

        <div className="mb-3">
          <BattleZone
            label="🔮 ENCHANTEMENTS & ARTEFACTS"
            cards={zones.enchantements}
            onDrop={(card, index) => moveToZone(card, index, "enchantements")}
            onTap={tapCard}
            onCounterUpdate={updateCounter}
            minHeight="120px"
          />
        </div>

        <div className="mb-3">
          <BattleZone
            label="🌲 TERRAINS"
            cards={zones.terrains}
            onDrop={(card, index) => moveToZone(card, index, "terrains")}
            onTap={tapCard}
            onCounterUpdate={updateCounter}
            minHeight="120px"
          />
        </div>

        <div>
          <BattleZone
            label="⚡ NON-PERMANENT"
            cards={zones.nonpermanent}
            onDrop={(card, index) => moveToZone(card, index, "nonpermanent")}
            onTap={tapCard}
            onCounterUpdate={updateCounter}
            minHeight="60px"
          />
        </div>
      </div>

      <div className="hand-zone p-4 min-h-36">
        <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", marginBottom: "12px", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
          🃏 MAIN ({gameState.hand.length})
        </h2>
        <div className="flex flex-wrap gap-3">
          {gameState.hand.map((card, i) => (
            <div key={i} onClick={() => openZoneMenu(card, i)} style={{ cursor: "pointer" }}>
              <Card name={card.name} quantity={card.quantity} />
            </div>
          ))}
        </div>
      </div>

      {zoneMenu && (
        <ZoneMenu
          suggestedZone={zoneMenu.suggested}
          onSelect={playCardToZone}
          onClose={() => setZoneMenu(null)}
        />
      )}

    </div>
  )
}

export default Battlefield