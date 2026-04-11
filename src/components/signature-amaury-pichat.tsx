export default function SignatureAmauryPichat() {
  return (
    <svg
      viewBox="0 0 1200 260"
      className="signature-svg"
      role="img"
      aria-labelledby="signature-title signature-desc"
    >
      <title id="signature-title">Signature Amaury PICHAT</title>
      <desc id="signature-desc">
        Signature manuscrite animee avec un effet d&apos;ecriture progressive.
      </desc>

      <style>{`
        .signature-svg {
          width: 100%;
          height: auto;
          overflow: visible;
          color: #111111;
        }

        .signature-svg__layer {
          transform-origin: center;
        }

        .signature-svg__ghost,
        .signature-svg__stroke {
          font-family: "Segoe Script", "Brush Script MT", "Snell Roundhand", cursive;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .signature-svg__ghost {
          fill: rgba(17, 17, 17, 0.08);
        }

        .signature-svg__ghost--first,
        .signature-svg__stroke--first {
          font-size: 112px;
        }

        .signature-svg__ghost--last,
        .signature-svg__stroke--last {
          font-size: 94px;
          letter-spacing: 0.035em;
        }

        .signature-svg__stroke {
          fill: transparent;
          stroke: currentColor;
          stroke-width: 2.6;
          stroke-linecap: round;
          stroke-linejoin: round;
          paint-order: stroke;
          stroke-dasharray: 2200;
          stroke-dashoffset: 2200;
          animation: signature-write 2.2s cubic-bezier(0.65, 0, 0.25, 1) forwards;
        }

        .signature-svg__stroke--last {
          animation-delay: 0.85s;
        }

        .signature-svg__underline {
          fill: none;
          stroke: currentColor;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-dasharray: 420;
          stroke-dashoffset: 420;
          animation: signature-write 0.95s cubic-bezier(0.65, 0, 0.25, 1) 1.7s forwards;
        }

        .signature-svg__spark {
          fill: currentColor;
          opacity: 0;
          animation: signature-pop 0.4s ease-out 2.45s forwards;
        }

        @keyframes signature-write {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes signature-pop {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 0.9;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .signature-svg__stroke,
          .signature-svg__underline,
          .signature-svg__spark {
            animation: none;
            stroke-dashoffset: 0;
            opacity: 0.9;
          }
        }
      `}</style>

      <g className="signature-svg__layer" transform="translate(28 10) rotate(-4 560 110)">
        <text x="24" y="126" className="signature-svg__ghost signature-svg__ghost--first">
          Amaury
        </text>
        <text x="26" y="126" className="signature-svg__stroke signature-svg__stroke--first">
          Amaury
        </text>

        <text x="550" y="162" className="signature-svg__ghost signature-svg__ghost--last">
          PICHAT
        </text>
        <text x="552" y="162" className="signature-svg__stroke signature-svg__stroke--last">
          PICHAT
        </text>

        <path
          className="signature-svg__underline"
          d="M560 182 C655 210 790 214 980 186"
        />

        <circle className="signature-svg__spark" cx="990" cy="184" r="3.8" />
      </g>
    </svg>
  );
}