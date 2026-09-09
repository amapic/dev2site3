import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réserver un appel découverte gratuit | Dev2Site",
  description:
    "Réservez un appel de 20 minutes gratuit et sans engagement avec Amaury Pichat, fondateur de Dev2Site, pour discuter de votre projet web.",
};

export default function ReservationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
