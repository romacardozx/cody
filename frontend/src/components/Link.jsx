import { navigate } from '../lib/router.js'

/** Anchor that navigates without reloading; modified clicks (new tab, etc.) keep browser behavior. */
export function Link({ to, onClick, ...props }) {
  function handleClick(event) {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || props.target) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(to)
  }
  return <a href={to} onClick={handleClick} {...props} />
}
