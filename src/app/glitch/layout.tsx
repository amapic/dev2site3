import {
  geistColor,
  playfair,
  liebeheide,
  grahamo,
  randoPosca,
} from "./fonts";

export default function GlitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${geistColor.variable} ${playfair.variable} ${liebeheide.variable} ${grahamo.variable} ${randoPosca.variable}`}
    >
      {children}
    </div>
  );
}
