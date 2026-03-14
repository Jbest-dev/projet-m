export async function fetchCard(cardName) {
  // On cherche la carte en français via /cards/search
  const responseFr = await fetch(
    `https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(cardName)}" lang:fr&unique=prints`
  )

  if (responseFr.ok) {
    const dataFr = await responseFr.json()
    if (dataFr.data && dataFr.data.length > 0 && dataFr.data[0].image_uris) {
      return dataFr.data[0]
    }
  }

  // Fallback anglais
  const responseEn = await fetch(
    `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`
  )
  return responseEn.json()
}