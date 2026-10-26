import { useCallback, useEffect, useReducer, useRef } from 'react'
import { answerQuestion, startSession } from '../api/cody.js'

/*
 * State of one walk through an algorithm.
 *
 * The server only sends steps up to the next unanswered question, so `steps` grows as the user
 * answers. Answers are optimistic: the chosen option is locked and shown at once ("pending"),
 * and the request result only fills in whether it was right. If the request fails, the choice is
 * rolled back so the user can try again.
 */

const initialState = {
  status: 'loading', // loading | ready | error
  sessionId: null,
  scenarioId: null,
  total: 0,
  steps: [],
  cursor: 0,
  finished: false,
  answers: {}, // questionId -> { choice, status: 'pending' | 'done', correct, correctAnswer, explanation }
  score: { correct: 0, wrong: 0 },
  error: null,
  answerError: null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'start':
      // Keep the previous scenario and steps on screen (dimmed) until the new session arrives
      return { ...state, status: 'loading', error: null, answerError: null }
    case 'started':
      return {
        ...initialState,
        status: 'ready',
        sessionId: action.session.sessionId,
        scenarioId: action.session.scenarioId,
        total: action.session.totalSteps,
        steps: action.session.steps,
        finished: action.session.finished,
      }
    case 'failed':
      return { ...state, status: 'error', error: action.error }
    case 'go':
      return { ...state, cursor: Math.max(0, Math.min(action.index, state.steps.length - 1)), answerError: null }
    case 'answer':
      return {
        ...state,
        answerError: null,
        answers: { ...state.answers, [action.questionId]: { choice: action.choice, status: 'pending' } },
      }
    case 'answered': {
      const { response, questionId } = action
      const steps = [...state.steps, ...response.steps]
      return {
        ...state,
        steps,
        finished: response.finished,
        // Reveal: move to the step right after the question, where the answer shows up
        cursor: response.steps.length > 0 ? Math.min(state.cursor + 1, steps.length - 1) : state.cursor,
        score: { correct: response.correctCount, wrong: response.wrongCount },
        answers: {
          ...state.answers,
          [questionId]: {
            choice: state.answers[questionId]?.choice,
            status: 'done',
            correct: response.correct,
            correctAnswer: response.correctAnswer,
            explanation: response.explanation,
          },
        },
      }
    }
    case 'answerFailed': {
      const answers = { ...state.answers }
      delete answers[action.questionId] // rollback of the optimistic choice
      return { ...state, answers, answerError: action.error }
    }
    default:
      return state
  }
}

export function useSession(algorithmCode) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const controller = useRef(null)

  const start = useCallback(
    (scenarioId) => {
      controller.current?.abort() // a newer choice wins over a slower older request
      const current = new AbortController()
      controller.current = current
      dispatch({ type: 'start', scenarioId })
      startSession(algorithmCode, scenarioId, current.signal)
        .then((session) => dispatch({ type: 'started', session }))
        .catch((error) => {
          if (error.name !== 'AbortError') dispatch({ type: 'failed', error })
        })
    },
    [algorithmCode],
  )

  useEffect(() => () => controller.current?.abort(), [])

  const go = useCallback((index) => dispatch({ type: 'go', index }), [])

  const answer = useCallback(
    (questionId, choice) => {
      if (state.answers[questionId]) return // already answered or in flight
      dispatch({ type: 'answer', questionId, choice })
      answerQuestion(state.sessionId, questionId, choice)
        .then((response) => dispatch({ type: 'answered', questionId, response }))
        .catch((error) => dispatch({ type: 'answerFailed', questionId, error }))
    },
    [state.sessionId, state.answers],
  )

  const step = state.steps[state.cursor] ?? null
  const question = step?.question ?? null
  const questionAnswer = question ? state.answers[question.id] ?? null : null
  // The user must answer before moving past a question step
  const blocked = Boolean(question && questionAnswer?.status !== 'done')
  const atLastReceived = state.cursor >= state.steps.length - 1
  const asked = Object.values(state.answers).filter((a) => a.status === 'done').length

  return {
    ...state,
    step,
    question,
    questionAnswer,
    blocked,
    canGoNext: !blocked && !atLastReceived,
    canGoPrev: state.cursor > 0,
    done: state.finished && atLastReceived,
    asked,
    start,
    go,
    answer,
  }
}
