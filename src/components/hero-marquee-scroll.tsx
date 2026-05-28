function TriangleSeparator() {
  return (
    <svg
      className="hero-marquee-separator"
      viewBox="0 0 80 60"
      aria-hidden="true"
      role="img"
      preserveAspectRatio="xMidYMid meet"
    >
      <polygon points="2,48 18,8 28,51" fill="currentColor" />
      <polygon points="35,22 52,12 58,47" fill="currentColor" />
      <polygon points="61,55 71,15 78,42" fill="currentColor" />
    </svg>
  );
}

export default function HeroMarqueeScroll() {
  const baseItems = ["DESIGN CREATIF", "DEVELOPPEMENT", "PERFORMANCE"];
  const repeatedItems = Array.from({ length: 18 }, (_, index) => {
    return baseItems[index % baseItems.length];
  });

  const buildSegment = (segmentId: string) =>
    repeatedItems.flatMap((item, index) => [
      <span key={`${segmentId}-${index}-${item}`}>{item}</span>,
      index < repeatedItems.length - 1 ? null : null,
    ]);

  return (
    <div className="hero-marquee-scroll" aria-hidden="true">
      <div className="hero-marquee-track">
        <div className="hero-marquee-segment">{buildSegment("a")}</div>
        <div className="hero-marquee-segment">{buildSegment("b")}</div>
      </div>
    </div>
  );
}
