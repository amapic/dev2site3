export default function HeroMarqueeScroll() {
  const baseItems = ["DESIGN CREATIF", "DEVELOPPEMENT", "PERFORMANCE"];
  const repeatedItems = Array.from({ length: 18 }, (_, index) => {
    return baseItems[index % baseItems.length];
  });

  return (
    <div className="hero-marquee-scroll" aria-hidden="true">
      <div className="hero-marquee-track">
        <div className="hero-marquee-segment">
          {repeatedItems.map((item, index) => (
            <span key={`a-${index}-${item}`}>{item}</span>
          ))}
        </div>
        <div className="hero-marquee-segment">
          {repeatedItems.map((item, index) => (
            <span key={`b-${index}-${item}`}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
