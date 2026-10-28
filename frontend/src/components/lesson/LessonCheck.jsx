import { useState } from 'react'
import { Feedback, PredictionPanel } from '../PredictionPanel.jsx'
import styles from './Lesson.module.css'

const same = (option) => option

/**
 * A question at the end of a lesson. It reuses the visualizer's prediction panel and feedback, so
 * predicting feels the same everywhere, but checks the answer right here: a lesson is practice,
 * not an exam, and has no server session.
 *
 * @param question {id, prompt, options, correctAnswer, explanation, optionFeedback}
 */
export function LessonCheck({ question }) {
  const [answer, setAnswer] = useState(null)
  const choose = (choice) =>
    setAnswer({
      status: 'done',
      choice,
      correct: choice === question.correctAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      choiceFeedback: question.optionFeedback?.[choice] ?? null,
    })

  return (
    <div className={styles.check}>
      <PredictionPanel question={question} answer={answer} labelOf={same} onAnswer={choose} hint={null} autoScroll={false} keys={false} />
      {answer && <Feedback answer={answer} labelOf={same} canContinue={false} />}
    </div>
  )
}
