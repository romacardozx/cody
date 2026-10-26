import { request } from './http.js'
import { learnerId } from '../lib/learner.js'

// Read-only resources are cached as promises: the same request is never made twice, prefetching
// on hover makes the next page instant, and React's use() can suspend on them.
const cache = new Map()

function cached(key, load) {
  if (!cache.has(key)) {
    const promise = load().catch((error) => {
      cache.delete(key) // let the next render retry
      throw error
    })
    cache.set(key, promise)
  }
  return cache.get(key)
}

export const getAlgorithms = () => cached('algorithms', () => request('/api/algorithms'))

export const getAlgorithm = (code) =>
  cached(`algorithm:${code}`, () => request(`/api/algorithms/${encodeURIComponent(code)}`))

export const getScenarios = (type) => cached(`scenarios:${type}`, () => request(`/api/scenarios?type=${type}`))

/** Warms up everything the visualizer needs, e.g. while hovering a card. */
export function prefetchVisualizer(algorithm) {
  getAlgorithm(algorithm.code).catch(() => {})
  getScenarios(algorithm.scenarioType).catch(() => {})
}

export const startSession = (algorithmCode, scenarioId, signal) =>
  request('/api/sessions', { method: 'POST', body: { algorithmCode, scenarioId, learnerId: learnerId() }, signal })

export const answerQuestion = (sessionId, questionId, answer) =>
  request(`/api/sessions/${sessionId}/predictions`, { method: 'POST', body: { questionId, answer } })

// History is not cached: it changes every time the user answers
export const getHistory = () => request(`/api/sessions?learnerId=${encodeURIComponent(learnerId())}`)

export const getSessionDetail = (sessionId) => request(`/api/sessions/${sessionId}`)
