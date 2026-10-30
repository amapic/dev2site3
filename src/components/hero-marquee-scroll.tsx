type TriangleSeparatorProps = { seed?: number };

function TriangleSeparator({ seed }: TriangleSeparatorProps) {
  const w = 80;
  const h = 60;
  const s = typeof seed === "number" ? (seed >>> 0) : 1;

  function mulberry32(a: number) {
    let t = a >>> 0;
    return function () {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), t | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rnd = mulberry32(s);
  const band = w / 3;

  const shapes = [0, 1, 2].map((i) => {
    const bandStart = i * band;
    const leftX = bandStart + rnd() * (band * 0.25);
    const rightX = bandStart + band - rnd() * (band * 0.25);
    const tipX = bandStart + (0.12 + rnd() * 0.76) * band;
    const tipY = 6 + rnd() * (h - 12);
    const bottomY = h;
    const points = `${leftX.toFixed(3)},${bottomY.toFixed(3)} ${tipX.toFixed(3)},${tipY.toFixed(3)} ${rightX.toFixed(3)},${bottomY.toFixed(3)}`;
    return <polygon key={i} points={points} fill="currentColor" />;
  });

  // compute a small deterministic number based on seed (separate rng so shapes unaffected)
  const rndBadge = mulberry32((s + 1234567) | 0);
  const resultNumber = Math.floor(rndBadge() * 100) + 1;

  return (
    <span className="hero-marquee-separator-wrap" data-number={resultNumber} aria-hidden="true">
      <svg
        className="hero-marquee-separator"
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        {shapes}
      </svg>
      <span className="hero-marquee-separator-badge">{resultNumber}</span>
    </span>
  );
}

export default function HeroMarqueeScroll() {
  const baseItems = ["DESIGN CREATIF", "DEVELOPPEMENT", "PERFORMANCE"];
  const repeatedItems = Array.from({ length: 18 }, (_, index) => {
    return baseItems[index % baseItems.length];
  });

  const buildSegment = (segmentId: string) =>
    repeatedItems.flatMap((item, index) => {
      const itemKey = `${segmentId}-${index}-${item}`;
      const sepKey = `sep-${segmentId}-${index}-${item}`;
      const seed = (segmentId.charCodeAt(0) || 0) * 100000 + index;
      return index < repeatedItems.length - 1
        ? [
            <span key={itemKey}>{item}</span>,
            <TriangleSeparator key={sepKey} seed={seed} />,
          ]
        : [<span key={itemKey}>{item}</span>];
    });

  return (
    <div className="hero-marquee-scroll" aria-hidden="true">
      <div className="hero-marquee-track">
        <div className="hero-marquee-segment">{buildSegment("a")}</div>
        <div className="hero-marquee-segment">{buildSegment("b")}</div>
      </div>
    </div>
  );
}
