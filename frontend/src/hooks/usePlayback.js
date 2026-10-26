import { useEffect } from 'react'

const BASE_DELAY_MS = 1200

/**
 * Auto-advance while playing. Stops by itself at a question or at the end of what the server has
 * sent. It does not resume after an answer: the feedback stays on screen until the user moves on.
 */
export function usePlayback({ playing, setPlaying, speed, canGoNext, blocked, next }) {
  useEffect(() => {
    if (!playing) return
    if (blocked || !canGoNext) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(next, BASE_DELAY_MS / speed)
    return () => clearTimeout(timer)
  }, [playing, blocked, canGoNext, speed, next, setPlaying])
}
