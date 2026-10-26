import { useEffect, useRef } from 'react'

const BASE_DELAY_MS = 1100

/**
 * Auto-advance while playing. Stops by itself at a question (remembering to resume after it is
 * answered) or at the end of what the server has sent.
 */
export function usePlayback({ playing, setPlaying, speed, canGoNext, blocked, next }) {
  const resumeAfterAnswer = useRef(false)

  useEffect(() => {
    if (!playing) return
    if (blocked) {
      resumeAfterAnswer.current = true
      setPlaying(false)
      return
    }
    if (!canGoNext) {
      setPlaying(false)
      return
    }
    const timer = setTimeout(next, BASE_DELAY_MS / speed)
    return () => clearTimeout(timer)
  }, [playing, blocked, canGoNext, speed, next, setPlaying])

  // Once the question is answered, keep going if the user was playing
  useEffect(() => {
    if (!blocked && resumeAfterAnswer.current) {
      resumeAfterAnswer.current = false
      setPlaying(true)
    }
  }, [blocked, setPlaying])

  return {
    cancelResume() {
      resumeAfterAnswer.current = false
    },
  }
}
