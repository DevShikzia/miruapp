let cachedRate: { value: number; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

export async function getTarjetaRate(): Promise<number> {
  const now = Date.now()
  if (cachedRate && now - cachedRate.timestamp < CACHE_TTL) {
    return cachedRate.value
  }
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/tarjeta')
    const data = await res.json() as { venta: number }
    cachedRate = { value: data.venta, timestamp: now }
    return data.venta
  } catch {
    if (cachedRate) return cachedRate.value
    return 1600
  }
}
