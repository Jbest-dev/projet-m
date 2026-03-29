import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import Card from "./card"
import Graveyard from "./Graveyard"
import Library from "./Library"
import Exile from "./Exile"
import CounterMenu from "./CounterMenu"
import DiceRoller from "./DiceRoller"
import ZoneMenu from "./ZoneMenu"
import CommanderZone from "./CommanderZone"
import socket from "../services/socket"
import { fetchCard } from "../services/scryfall"

function MiniCard({ name, tapped }) {
  const [cardData, setCardData] = useState(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    fetchCard(name).then(setCardData)
  }, [name])

  if (!cardData) return (
    <div style={{ width: "40px", height: "56px", background: "#2d1810", borderRadius: "4px" }} />
  )

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: "pointer",
        transform: tapped ? "rotate(90deg)" : "none",
        transition: "transform 0.2s",
        position: "relative"
      }}
    >
      <img
        src={cardData.image_uris?.small || cardData.image_uris?.normal}
        alt={name}
        style={{ width: "40px", height: "56px", borderRadius: "4px", display: "block", pointerEvents: "none" }}
      />
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

function OpponentBoard({ state }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div style={{ padding: "8px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(201,168,76,0.3)", flex: 1 }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
          <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", fontSize: "0.7rem" }}>🧙 Adversaire</p>
          <span style={{ color: "#e63946", fontSize: "0.7rem" }}>❤️ {state.life}</span>
          <span style={{ color: "#f0e6d3", fontSize: "0.7rem" }}>🃏 {state.hand?.length}</span>
          <span style={{ color: "#f0e6d3", fontSize: "0.7rem" }}>📚 {state.library?.length}</span>
          {state.commander && <span style={{ color: "#c9a84c", fontSize: "0.7rem" }}>👑 {state.commander.name}</span>}
          <button
            onClick={() => setExpanded(true)}
            style={{ marginLeft: "auto", background: "rgba(201,168,76,0.15)", border: "1px solid #c9a84c60", borderRadius: "8px", color: "#c9a84c", fontFamily: "Cinzel, serif", fontSize: "0.65rem", padding: "2px 8px", cursor: "pointer" }}
          >
            🔍 Voir battlefield
          </button>
        </div>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {state.battlefield?.map((card, i) => (
            <MiniCard key={i} name={card.name} tapped={card.tapped} />
          ))}
        </div>
      </div>

      {expanded && createPortal(
        <div
          onClick={() => setExpanded(false)}
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
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "#1a0f0a",
              border: "1px solid #c9a84c",
              borderRadius: "16px",
              padding: "24px",
              width: "95vw",
              maxWidth: "1200px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              overflowY: "auto"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c" }}>🧙 Battlefield adversaire</h2>
                <span style={{ color: "#e63946" }}>❤️ {state.life}</span>
                <span style={{ color: "#f0e6d3", fontSize: "0.85rem" }}>🃏 {state.hand?.length} cartes en main</span>
                <span style={{ color: "#f0e6d3", fontSize: "0.85rem" }}>📚 {state.library?.length} cartes</span>
                {state.commander && <span style={{ color: "#c9a84c" }}>👑 {state.commander.name}</span>}
              </div>
              <button
                onClick={() => setExpanded(false)}
                style={{ background: "none", border: "none", color: "#f0e6d3", cursor: "pointer", fontSize: "1.5rem" }}
              >✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <div style={{ flex: 3, background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "12px", minHeight: "120px" }}>
                  <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.7rem", marginBottom: "8px" }}>🐉 CRÉATURES</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {state.battlefield?.filter(c => c.zone === "creatures").map((card, i) => (
                      <MiniCard key={i} name={card.name} tapped={card.tapped} />
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1, background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "12px", minHeight: "120px" }}>
                  <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.7rem", marginBottom: "8px" }}>✨ PLANESWALKERS</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {state.battlefield?.filter(c => c.zone === "planeswalkers").map((card, i) => (
                      <MiniCard key={i} name={card.name} tapped={card.tapped} />
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "12px", minHeight: "80px" }}>
                <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.7rem", marginBottom: "8px" }}>🔮 ENCHANTEMENTS & ARTEFACTS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {state.battlefield?.filter(c => c.zone === "enchantements").map((card, i) => (
                    <MiniCard key={i} name={card.name} tapped={card.tapped} />
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "12px", minHeight: "80px" }}>
                <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.7rem", marginBottom: "8px" }}>🌲 TERRAINS</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {state.battlefield?.filter(c => c.zone === "terrains").map((card, i) => (
                    <MiniCard key={i} name={card.name} tapped={card.tapped} />
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "12px", minHeight: "60px" }}>
                <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.7rem", marginBottom: "8px" }}>⚡ NON-PERMANENT</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {state.battlefield?.filter(c => c.zone === "nonpermanent").map((card, i) => (
                    <MiniCard key={i} name={card.name} tapped={card.tapped} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function DraggableCard({ card, index, onTap, onCounterUpdate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `card-${index}`,
    data: { card, index, fromHand: false }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
    touchAction: "none"
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex flex-col items-center gap-1"
    >
      <Card
        name={card.name}
        quantity={card.quantity}
        tapped={card.tapped}
        onClick={() => !isDragging && onTap(index)}
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

      <div onPointerDown={e => e.stopPropagation()}>
        <CounterMenu
          counters={card.counters || {}}
          onUpdate={(key, amount) => onCounterUpdate(index, key, amount)}
        />
      </div>
    </div>
  )
}

function DraggableHandCard({ card, index, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `hand-card-${index}`,
    data: { card, index, fromHand: true }
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    cursor: "grab",
    touchAction: "none",
    flexShrink: 0
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onClick()}
    >
      <Card name={card.name} quantity={card.quantity} />
    </div>
  )
}

function DroppableZone({ id, label, cards, onTap, onCounterUpdate, minHeight = "80px", style = {} }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight,
        background: isOver ? "rgba(201,168,76,0.12)" : "rgba(0,0,0,0.15)",
        border: isOver ? "2px solid #c9a84c" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: "12px",
        padding: "6px",
        transition: "all 0.15s",
        flex: 1,
        ...style
      }}
    >
      <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c99", fontSize: "0.65rem", letterSpacing: "0.08em", marginBottom: "4px" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {cards.map((card) => (
          <DraggableCard
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

function DroppableControlZone({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transition: "all 0.15s",
        transform: isOver ? "scale(1.1)" : "scale(1)",
        outline: isOver ? "2px solid #c9a84c" : "none",
        borderRadius: "20px"
      }}
    >
      {children}
    </div>
  )
}

function Battlefield({ gameState, onDraw, setGameState, onReset, roomCode }) {
  const [zoneMenu, setZoneMenu] = useState(null)
  const [otherPlayers, setOtherPlayers] = useState({})
  const [activeCard, setActiveCard] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  useEffect(() => {
    if (!roomCode) return
    socket.emit("sync_state", { roomCode, playerId: socket.id, gameState })
  }, [])

  useEffect(() => {
    if (!roomCode) return
    socket.emit("sync_state", { roomCode, playerId: socket.id, gameState })
  }, [gameState, roomCode])

  useEffect(() => {
    if (!roomCode) return
    socket.emit("request_states", { roomCode })
    socket.on("state_updated", ({ playerId, gameState: otherState }) => {
      if (playerId !== socket.id) {
        setOtherPlayers(prev => ({ ...prev, [playerId]: otherState }))
      }
    })
    return () => socket.off("state_updated")
  }, [roomCode])

  function handleDragStart(event) {
    const { data } = event.active
    setActiveCard(data.current)
  }

  function handleDragEnd(event) {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    const { card, index, fromHand } = active.data.current
    const destination = over.id

    if (fromHand) {
      if (["creatures", "planeswalkers", "enchantements", "terrains", "nonpermanent"].includes(destination)) {
        const newHand = gameState.hand.filter((_, i) => i !== index)
        setGameState(prev => ({
          ...prev,
          hand: newHand,
          battlefield: [...prev.battlefield, { ...card, tapped: false, zone: destination }]
        }))
      }
      return
    }

    if (destination === "graveyard") {
      sendToGraveyard(card, index)
    } else if (destination === "exile") {
      sendToExile(card, index)
    } else if (["creatures", "planeswalkers", "enchantements", "terrains", "nonpermanent"].includes(destination)) {
      moveToZone(card, index, destination)
    }
  }

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

  function recoverCard(index, destination, source) {
    setGameState(prev => {
      const sourceList = source === "graveyard" ? prev.graveyard : prev.exile
      const card = sourceList[index]
      const newSourceList = sourceList.filter((_, i) => i !== index)
      if (destination === "hand") {
        return { ...prev, [source]: newSourceList, hand: [...prev.hand, card] }
      } else if (destination === "library") {
        return { ...prev, [source]: newSourceList, library: [...prev.library, card] }
      } else if (destination === "battlefield") {
        return { ...prev, [source]: newSourceList, battlefield: [...prev.battlefield, { ...card, tapped: false, zone: "creatures" }] }
      }
      return prev
    })
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
      battlefield: [...prev.battlefield, {
        name: prev.commander.name,
        tapped: false,
        zone: "creatures",
        quantity: 1,
        counters: {}
      }],
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
      battlefield: prev.battlefield.filter(c => c.name !== prev.commander.name),
      commander: { ...prev.commander, inPlay: false, tapped: false }
    }))
  }

  function takeFromLibrary(index) {
    setGameState(prev => {
      const card = prev.library[index]
      const newLibrary = prev.library.filter((_, i) => i !== index)
      return { ...prev, library: newLibrary, hand: [...prev.hand, card] }
    })
  }

  function drawX(count) {
    setGameState(prev => {
      if (prev.library.length === 0) return prev
      const drawn = prev.library.slice(0, count)
      const rest = prev.library.slice(count)
      return { ...prev, library: rest, hand: [...prev.hand, ...drawn] }
    })
  }

  function lookX(reorderedCards) {
    setGameState(prev => {
      const remaining = prev.library.slice(reorderedCards.length)
      return { ...prev, library: [...reorderedCards, ...remaining] }
    })
  }

  function shuffleDeck() {
    setGameState(prev => ({
      ...prev,
      library: [...prev.library].sort(() => Math.random() - 0.5)
    }))
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
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "6px",
        overflow: "hidden"
      }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          {roomCode && (
            <span style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.7rem" }}>
              🏰 Room : {roomCode} — {Object.keys(otherPlayers).length + 1} joueur(s)
            </span>
          )}
          <button
            onClick={onReset}
            style={{ fontSize: "0.6rem", color: "#e63946", background: "none", border: "1px solid #e6394640", borderRadius: "20px", padding: "3px 8px", cursor: "pointer", marginLeft: "auto" }}
          >
            🔁 Recommencer
          </button>
        </div>

        {/* Plateaux des autres joueurs */}
        {Object.entries(otherPlayers).length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flexShrink: 0 }}>
            {Object.entries(otherPlayers).map(([playerId, state]) => (
              <OpponentBoard key={playerId} state={state} />
            ))}
          </div>
        )}

        {/* Barre de contrôles */}
        <div className="control-bar" style={{ display: "flex", gap: "6px", justifyContent: "center", alignItems: "center", flexWrap: "wrap", flexShrink: 0 }}>
          <DiceRoller />
          <Library
            library={gameState.library}
            onTakeCard={takeFromLibrary}
            onDrawX={drawX}
            onLookX={lookX}
            onShuffle={shuffleDeck}
          />
          <DroppableControlZone id="graveyard">
            <Graveyard graveyard={gameState.graveyard} onRecoverCard={recoverCard} />
          </DroppableControlZone>
          <DroppableControlZone id="exile">
            <Exile exile={gameState.exile} onRecoverCard={recoverCard} />
          </DroppableControlZone>
          <div className="life-counter" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button onClick={() => setGameState(prev => ({ ...prev, life: prev.life - 1 }))}
              style={{ color: "#e63946", fontWeight: "bold", fontSize: "1rem", background: "none", border: "none", cursor: "pointer" }}>−</button>
            <span style={{ fontFamily: "Cinzel, serif", fontWeight: 700, fontSize: "0.9rem" }}>❤️ {gameState.life}</span>
            <button onClick={() => setGameState(prev => ({ ...prev, life: prev.life + 1 }))}
              style={{ color: "#2dc653", fontWeight: "bold", fontSize: "1rem", background: "none", border: "none", cursor: "pointer" }}>+</button>
          </div>
          <button className="btn-gold" onClick={onDraw}>Piocher 🃏</button>
          <button className="btn-dark" onClick={untapAll}>🔄 Untap All</button>
          <button className="btn-gold" onClick={newTurn}>⏭️ Nouveau tour</button>
        </div>

        {/* Battlefield */}
        <div className="battlefield p-2" style={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", height: "100%" }}>

            <div style={{ display: "flex", gap: "4px", flex: 2 }}>
              <DroppableZone id="creatures" label="🐉 CRÉATURES" cards={zones.creatures} onTap={tapCard} onCounterUpdate={updateCounter} style={{ flex: 3 }} />
              <DroppableZone id="planeswalkers" label="✨ PLANESWALKERS" cards={zones.planeswalkers} onTap={tapCard} onCounterUpdate={updateCounter} style={{ flex: 1 }} />
            </div>

            <div style={{ display: "flex", gap: "4px", flex: 1 }}>
              <DroppableZone id="enchantements" label="🔮 ENCHANTEMENTS & ARTEFACTS" cards={zones.enchantements} onTap={tapCard} onCounterUpdate={updateCounter} />
            </div>

            <div style={{ display: "flex", gap: "4px", flex: 1 }}>
              <DroppableZone id="terrains" label="🌲 TERRAINS" cards={zones.terrains} onTap={tapCard} onCounterUpdate={updateCounter} />
            </div>

            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
              {gameState.commander && (
                gameState.commander.inPlay ? (
                  <CommanderZone
                    commander={gameState.commander}
                    onTap={tapCommander}
                    onSendToCommand={sendToCommandZone}
                  />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "8px", borderRadius: "12px", background: "rgba(201,168,76,0.05)", border: "2px dashed #c9a84c60", minWidth: "140px" }}>
                    <p style={{ fontFamily: "Cinzel, serif", color: "#c9a84c80", fontSize: "0.65rem" }}>👑 COMMANDANT</p>
                    <Card name={gameState.commander.name} />
                    <button className="btn-gold" onClick={playCommander}>⚔️ Jouer</button>
                    <span style={{ color: "#c9a84c60", fontSize: "0.7rem", fontFamily: "Crimson Text, serif" }}>
                      Fois joué : {gameState.commander.timesPlayed || 0}
                    </span>
                  </div>
                )
              )}
              <div style={{ flex: 1 }}>
                <DroppableZone id="nonpermanent" label="⚡ NON-PERMANENT" cards={zones.nonpermanent} onTap={tapCard} onCounterUpdate={updateCounter} minHeight="60px" />
              </div>
            </div>

          </div>
        </div>

        {/* Main */}
        <div className="hand-zone p-2" style={{
          height: "160px",
          minHeight: "160px",
          overflowX: "auto",
          overflowY: "hidden",
          flexShrink: 0
        }}>
          <h2 style={{ fontFamily: "Cinzel, serif", color: "#c9a84c", marginBottom: "6px", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
            🃏 MAIN ({gameState.hand.length})
          </h2>
          <div style={{ display: "flex", gap: "8px" }}>
            {gameState.hand.map((card, i) => (
              <DraggableHandCard
                key={i}
                card={card}
                index={i}
                onClick={() => openZoneMenu(card, i)}
              />
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

      <DragOverlay>
        {activeCard ? (
          <div style={{ opacity: 0.9, transform: "rotate(3deg)", cursor: "grabbing" }}>
            <Card name={activeCard.card.name} />
          </div>
        ) : null}
      </DragOverlay>

    </DndContext>
  )
}

export default Battlefield