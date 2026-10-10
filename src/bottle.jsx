/* Hand-drawn Veloura Signature No.1 bottle: gold cap, amber liquid, moving light sweep */
export function HeroBottle() {
  return (
    <svg viewBox="0 0 300 430" className="hb" role="img" aria-label="Veloura Signature No.1 perfume bottle">
      <defs>
        <linearGradient id="gold" x1="0" x2="1">
          <stop offset="0" stopColor="#6b4a1e" /><stop offset=".35" stopColor="#f0cf8e" />
          <stop offset=".6" stopColor="#c99a4e" /><stop offset="1" stopColor="#5a3d17" />
        </linearGradient>
        <linearGradient id="liq" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d58f" stopOpacity=".95" /><stop offset="1" stopColor="#a8651f" stopOpacity=".95" />
        </linearGradient>
        <linearGradient id="shine" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".38" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="body"><path d="M62 160h176q16 0 16 16v212q0 26-26 26H72q-26 0-26-26V176q0-16 16-16z" /></clipPath>
      </defs>
      <ellipse cx="150" cy="418" rx="120" ry="9" fill="rgba(212,165,90,.3)" />
      <rect x="104" y="36" width="92" height="82" rx="8" fill="url(#gold)" />
      <path d="M118 36v82M150 36v82M182 36v82" stroke="#3a2810" strokeOpacity=".35" />
      <rect x="126" y="118" width="48" height="46" fill="url(#gold)" />
      <path d="M62 160h176q16 0 16 16v212q0 26-26 26H72q-26 0-26-26V176q0-16 16-16z" fill="#1b130b" stroke="#d4a55a" strokeWidth="2" />
      <g clipPath="url(#body)">
        <rect x="40" y="215" width="220" height="215" fill="url(#liq)" />
        <path d="M40 215q27-12 55 0t55 0 55 0 55 0v10H40z" fill="#fff3d0" fillOpacity=".5" />
        <rect x="-90" y="150" width="50" height="290" fill="url(#shine)" transform="skewX(-14)">
          <animate attributeName="x" from="-90" to="330" dur="6s" repeatCount="indefinite" />
        </rect>
      </g>
      <rect x="92" y="262" width="116" height="104" fill="#0d0a08" fillOpacity=".78" stroke="#d4a55a" strokeWidth="1" />
      <text x="150" y="296" textAnchor="middle" fill="#f0cf8e" fontSize="17" fontFamily="Cormorant Garamond, serif" letterSpacing="5">VELOURA</text>
      <path d="M118 308h64" stroke="#d4a55a" strokeOpacity=".6" />
      <text x="150" y="334" textAnchor="middle" fill="#f2e9dc" fontSize="22" fontFamily="Cormorant Garamond, serif">No. 1</text>
      <text x="150" y="354" textAnchor="middle" fill="#a39482" fontSize="8" letterSpacing="2">EAU DE PARFUM · 50 ML</text>
    </svg>
  );
}