interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      {/* Center hub - represents the pool/distribution center */}
      <circle cx="50" cy="50" r="12" fill="url(#logoGradient)" />

      {/* Distribution arrows - representing fee routing to investors */}
      {/* Top arrow */}
      <path
        d="M 50 38 L 50 8 M 45 13 L 50 8 L 55 13"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Top-right arrow */}
      <path
        d="M 59 41 L 79 21 M 75 26 L 79 21 L 84 25"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Bottom-right arrow */}
      <path
        d="M 59 59 L 79 79 M 84 75 L 79 79 L 75 74"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Bottom arrow */}
      <path
        d="M 50 62 L 50 92 M 55 87 L 50 92 L 45 87"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Bottom-left arrow */}
      <path
        d="M 41 59 L 21 79 M 16 75 L 21 79 L 25 74"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Top-left arrow */}
      <path
        d="M 41 41 L 21 21 M 25 26 L 21 21 L 16 25"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
