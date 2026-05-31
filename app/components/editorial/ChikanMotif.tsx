type Props = {className?: string};

// Stylised chikankari floral motif divider
export function ChikanMotif({className = ''}: Props) {
  return (
    <svg
      viewBox="0 0 240 60"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        opacity="0.85"
      >
        <path d="M0 30 L90 30" />
        <path d="M150 30 L240 30" />
        <circle cx="120" cy="30" r="2" fill="currentColor" />
        <circle cx="120" cy="30" r="6" />
        <circle cx="120" cy="30" r="12" />
        <path
          d="M120 16 C 124 20, 124 24, 120 28 C 116 24, 116 20, 120 16 Z"
          fill="currentColor"
        />
        <path
          d="M120 44 C 124 40, 124 36, 120 32 C 116 36, 116 40, 120 44 Z"
          fill="currentColor"
        />
        <path
          d="M104 30 C 108 26, 112 26, 116 30 C 112 34, 108 34, 104 30 Z"
          fill="currentColor"
        />
        <path
          d="M136 30 C 132 26, 128 26, 124 30 C 128 34, 132 34, 136 30 Z"
          fill="currentColor"
        />
        <circle cx="90" cy="30" r="1.5" fill="currentColor" />
        <circle cx="150" cy="30" r="1.5" fill="currentColor" />
        <circle cx="78" cy="30" r="1" fill="currentColor" />
        <circle cx="162" cy="30" r="1" fill="currentColor" />
      </g>
    </svg>
  );
}

