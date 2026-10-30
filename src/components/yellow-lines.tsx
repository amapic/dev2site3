'use client';

import { useEffect, useRef } from 'react';

const SVG_CONTENT = `<svg class="zappy" width="100%" height="1619" viewBox="0 0 1421 1619" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
<defs>
<linearGradient id="yellowStrokeA" x1="160" y1="920" x2="560" y2="1020" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#FFF9C4"></stop>
<stop offset="0.55" stop-color="#F6FF77"></stop>
<stop offset="1" stop-color="#D7E94B"></stop>
</linearGradient>
<linearGradient id="yellowStrokeB" x1="0" y1="520" x2="910" y2="1320" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#FFFDE7"></stop>
<stop offset="0.5" stop-color="#F6FF77"></stop>
<stop offset="1" stop-color="#C8DE36"></stop>
</linearGradient>
<linearGradient id="yellowStrokeC" x1="-620" y1="200" x2="820" y2="1550" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#FFFFFF"></stop>
<stop offset="0.45" stop-color="#F6FF77"></stop>
<stop offset="1" stop-color="#C2D934"></stop>
</linearGradient>
<linearGradient id="yellowStrokeD" x1="-760" y1="580" x2="400" y2="980" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#FFFDE7"></stop>
<stop offset="0.5" stop-color="#F6FF77"></stop>
<stop offset="1" stop-color="#D3E63D"></stop>
</linearGradient>
<linearGradient id="yellowStrokeE" x1="-120" y1="640" x2="1320" y2="1320" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#FFFDE7"></stop>
<stop offset="0.45" stop-color="#F6FF77"></stop>
<stop offset="1" stop-color="#C2D934"></stop>
</linearGradient>
</defs>
<path d="M549.703 1042.05C549.104 1042.35 548.505 1042.64 547.907 1042.93C545.833 1041.22 544.227 1039.28 543.069 1037.07C538.117 1027.61 533.22 1018.46 527.928 1009.37C522.108 999.385 515.97 989.74 508.958 980.442C484.387 947.958 454.226 920.143 424.77 892.218C396.383 865.361 367.732 838.822 336.595 815.11C221.621 728.435 91.7308 658.517 -48.7951 624.663C-61.4803 621.686 -74.4167 619.02 -87.2215 616.783" stroke="url(#yellowStrokeA)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.95"></path>
<path d="M-15.8115 504.863C-15.9355 505.518 -16.0596 506.173 -16.1837 506.828C-12.7028 508.619 -9.05407 509.994 -5.14129 510.969C11.3481 515.115 27.1115 520.318 42.8823 526.259C60.0902 532.773 77.1331 540.238 93.3566 548.511C151.674 578.463 204.614 615.861 258.387 652.973C309.589 688.449 360.654 724.546 409.44 763.616C587.468 909.022 760.082 1067.8 884.112 1262.52C895.049 1280.56 905.261 1299.04 914.098 1317.44" stroke="url(#yellowStrokeB)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"></path>
<path d="M-583.858 194.311C-583.839 194.978 -583.821 195.644 -583.802 196.311C-577.435 197.238 -570.429 197.827 -564.026 198.02C-536.101 198.896 -508.575 201.879 -480.967 206.084C-450.896 210.709 -420.959 216.923 -391.546 224.769C-287.653 252.722 -188.319 296.597 -94.6156 348.789C-29.1917 385.348 33.6572 426.873 90.9142 475.421C111.721 493.153 131.323 514.147 149.682 535.3C388.047 832.954 576.595 1167.53 759.719 1501.27" stroke="url(#yellowStrokeC)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"></path>
<path d="M-743.471 624.99C-743.155 625.577 -742.84 626.165 -742.524 626.752C-738.32 625.754 -734.291 624.291 -730.399 622.34C-714.466 614.353 -697.897 606.647 -681.444 599.692C-663.465 592.09 -644.743 585.052 -626.134 579.294C-559.443 558.755 -490.525 548.418 -421.549 541.426C-355.382 534.807 -288.437 532.225 -222.096 539.266C-146.651 547.329 -71.7803 565.62 -3.3345 598.632C149.28 673.867 275.405 798.967 360.985 945.414C371.842 964.961 381.881 985.073 388.989 1005.99" stroke="url(#yellowStrokeD)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"></path>
<path d="M1307.44 1331.44C1307.2 1331.52 1306.97 1331.6 1306.73 1331.68C1297.22 1304.81 1285.44 1278.54 1272.6 1253.07C1152.19 1026.38 966.9 829.973 736.816 713.807C704.09 697.774 670.387 683.735 635.847 672.137C425.76 603.507 196.813 596.991 -18.6378 644.268C-46.5117 651.023 -74.1789 658.914 -100.211 670.238" stroke="url(#yellowStrokeE)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"></path>
</svg>`;

export default function YellowLines() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const paths = Array.from(containerRef.current.querySelectorAll('path')) as SVGPathElement[];
    if (!paths.length) return;

    const cleanups: Array<() => void> = [];

    paths.forEach((path, index) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
      path.style.opacity = '0';
      path.style.transition = [
        'stroke-dashoffset 1800ms cubic-bezier(0.22, 1, 0.36, 1)',
        'opacity 320ms ease-out',
      ].join(', ');

      const timer = window.setTimeout(() => {
        path.style.opacity = path.getAttribute('opacity') ?? '1';
        path.style.strokeDashoffset = '0';
      }, 200 + index * 220);

      cleanups.push(() => window.clearTimeout(timer));
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <div className="yellow-lines w-embed" ref={containerRef} dangerouslySetInnerHTML={{ __html: SVG_CONTENT }} />
  );
}
