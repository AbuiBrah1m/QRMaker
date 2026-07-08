export function LogoMark({ size = 32 }: { size?: number }) {
  const gid = 'qrs-grad'
  return (
    <svg width={ size } height={ size } viewBox="0 0 48 48" fill="none">
      <defs>
        <linearGradient id={ gid } x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b6eff" />
          <stop offset="1" stopColor="#38d6ff" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill={ `url(#${gid})` } />
      <g>
        {/* Three finder patterns */}
        {(
          [
            [5, 5],
            [29, 5],
            [5, 29],
          ] as const
        ).map(([x, y]) => (
          <g key={ `${x}-${y}` }>
            <rect x={ x } y={ y } width="14" height="14" rx="4" fill="#ffffff" />
            <rect x={ x + 3 } y={ y + 3 } width="8" height="8" rx="2.5" fill={ `url(#${gid})` } />
            <rect x={ x + 5 } y={ y + 5 } width="4" height="4" rx="1.3" fill="#ffffff" />
          </g>
        ))}
        {/* Scattered data modules */}
        {(
          [
            [30, 30],
            [35, 30],
            [40, 30],
            [30, 35],
            [40, 35],
            [30, 40],
            [35, 40],
            [40, 40],
          ] as const
        ).map(([x, y]) => (
          <rect key={ `${x}.${y}` } x={ x } y={ y } width="3" height="3" rx="1" fill="#ffffff" />
        ))}
      </g>
    </svg>
  )
}
