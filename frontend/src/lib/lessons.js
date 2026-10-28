import { lazy } from 'react'

/*
 * Concept lessons: explorable readings (short text and pieces to play with) written in the
 * frontend, since they need no engine trace. The catalog in the database stays the source of name,
 * family and order; a concept becomes usable when its lesson is listed here.
 */
export const LESSONS = {
  BIG_O: lazy(() => import('../lessons/BigOLesson.jsx')),
}

export const hasLesson = (code) => code in LESSONS

/** Whether there is something to do with an entry now: predict its steps, or explore its lesson. */
export const isPlayable = (algorithm) => algorithm.available || hasLesson(algorithm.code)
