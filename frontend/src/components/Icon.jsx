// Small stroke icon set (24x24, currentColor) so the bundle carries no icon library.
const PATHS = {
  play: <path d="M7 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  prev: <path d="M15 6l-6 6 6 6" />,
  next: <path d="M9 6l6 6-6 6" />,
  restart: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4v4.5h4.5" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  graph: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <circle cx="9" cy="18" r="2.5" />
      <path d="M8.3 7l7.4.8M7 8.3l1.4 7.3M16.6 10l-5.8 6.4" />
    </>
  ),
  bars: <path d="M5 20V13M10 20V8M15 20v-5M20 20V4" />,
  layers: <path d="M12 3l9 4.5-9 4.5-9-4.5zM3 12l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />,
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8" />
      <circle cx="12" cy="17.2" r="0.6" fill="currentColor" />
    </>
  ),
}

export function Icon({ name, size = 18, className, title }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  )
}
