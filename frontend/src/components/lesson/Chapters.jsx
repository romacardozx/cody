import { useEffect, useState } from 'react'
import styles from './Lesson.module.css'

/** One chapter of a lesson: a short title, one line of lead, then the piece to play with. */
export function Chapter({ id, number, title, lead, children }) {
  return (
    <section id={id} className={styles.block} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.heading}>
        <span className={styles.chapterNumber}>{number}</span> {title}
      </h2>
      {lead && <p className={styles.prose}>{lead}</p>}
      {children}
    </section>
  )
}

/**
 * The lesson's index, beside the text on wide screens: where you are and how much is left. It
 * follows the chapter closest to the top of the screen.
 */
export function ChapterRail({ chapters }) {
  const [current, setCurrent] = useState(chapters[0]?.id)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setCurrent(visible[0].target.id)
      },
      { rootMargin: '-15% 0px -60% 0px' },
    )
    chapters.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })
    return () => observer.disconnect()
  }, [chapters])

  return (
    <nav className={styles.rail} aria-label="Capítulos">
      <ol className={styles.railList}>
        {chapters.map(({ id, title }, i) => (
          <li key={id}>
            <a href={`#${id}`} className={styles.railLink} aria-current={id === current ? 'step' : undefined}>
              <span className={styles.railNumber}>{i + 1}</span>
              {title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
