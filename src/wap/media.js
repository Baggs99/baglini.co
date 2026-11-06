import palmGallon from './media/PalmOil_Gallon_OnBlack.jpg'
import palmHalfJar from './media/PalmOil_Half_OnBlack.jpg'
import palm32 from './media/PalmOil_32_OnBlack.jpg'
import palm16 from './media/PalmOil_16_OnBlack.jpg'

export const PALM_FAMILY_SHOTS = [
  { label: '1 Gallon', src: palmGallon, alt: '1 gallon jug of Natural Red Palm Oil' },
  { label: '1/2 Gallon', src: palmHalfJar, alt: '1/2 gallon jar of Natural Red Palm Oil' },
  { label: '32 oz', src: palm32, alt: '32 ounce jar of Natural Red Palm Oil' },
  { label: '16 oz', src: palm16, alt: '16 ounce jar of Natural Red Palm Oil' },
]

function shotFromHay(hay) {
  if (/\b16\b/.test(hay)) return palm16
  if (/\b32\b/.test(hay)) return palm32
  if (hay.includes('1/2') || hay.includes('half')) return palmHalfJar
  if (/\b5\b/.test(hay)) return null
  if (hay.includes('gallon') || hay.includes('palm')) return palmGallon
  return null
}

export function packShotFor(product) {
  if (!product) return null
  const hay = `${product.sku ?? ''} ${product.unit ?? ''} ${product.name ?? ''}`.toLowerCase()
  if (product.category !== 'palm-oil' && !hay.includes('palm')) return null
  return shotFromHay(hay) ?? palmGallon
}

export function packShotForSizeLabel(name) {
  return shotFromHay((name ?? '').toLowerCase())
}
