import { Component } from 'react'
import styles from './ErrorBoundary.module.css'

/** Shows API or render errors where the content would be, with a retry button. */
export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  retry = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className={styles.box} role="alert">
        <p className={styles.title}>{this.props.title ?? 'No pudimos cargar esto'}</p>
        <p className={styles.detail}>{this.state.error.message}</p>
        <button type="button" className={styles.retry} onClick={this.retry}>
          Reintentar
        </button>
      </div>
    )
  }
}
