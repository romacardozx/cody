// Numbers and times the way a person says them, shared by the Big O pieces

/** Operations per second of the computer the lesson talks about. */
export const OPS_PER_SECOND = 1e8

const number = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
const decimal = (value) => value.toFixed(1).replace('.', ',')

export const formatNumber = (value) => number.format(value)

/** Seconds as a person would say them, from "al instante" to "más que la edad del universo". */
export function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds > 4.3e17) return 'más que la edad del universo'
  if (seconds < 0.001) return 'al instante'
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`
  if (seconds < 60) return `${decimal(seconds)} s`
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`
  if (seconds < 86400) return `${decimal(seconds / 3600)} h`
  if (seconds < 3.15e7) return `${Math.round(seconds / 86400)} días`
  return `${formatNumber(seconds / 3.15e7)} años`
}
