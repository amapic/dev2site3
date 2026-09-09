"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const CALENDLY_LINK = "https://calendly.com/amaury-pichat/30min";

const BENEFITS = [
  { icon: "✍", label: "Analyse de vos besoins" },
  { icon: "💡", label: "Conseils personnalisés" },
  { icon: "🤝", label: "Sans engagement" },
  { icon: "📹", label: "Visio ou téléphone" },
];

const STEPS = [
  {
    number: "01",
    title: "Présentation mutuelle",
    duration: "3 min",
    text: "Je me présente brièvement, je vous laisse présenter votre activité, votre poste et votre cible client.",
  },
  {
    number: "02",
    title: "Compréhension du besoin",
    duration: "8 min",
    text: "Vous me décrivez ce que vous cherchez : nouveau site, refonte, SEO, audit. Je pose des questions sur les délais, le budget et les fonctionnalités.",
  },
  {
    number: "03",
    title: "Vos questions",
    duration: "6 min",
    text: "Vous me posez toutes vos questions : ma méthode, mes tarifs, mes références, mes délais et ma façon de travailler avec vous.",
  },
  {
    number: "04",
    title: "Suite à donner",
    duration: "3 min",
    text: "Je vous dis honnêtement si Dev2Site est le bon partenaire pour vous. Si oui, on enchaîne sur un devis sous 24-48h.",
  },
];

const FAQS = [
  {
    question: "Comment se déroule l'appel découverte ?",
    answer:
      "Échange de 20 minutes par téléphone ou visio (Google Meet). Je pose des questions sur votre activité, vos objectifs, vos contraintes et votre budget. À la fin, je vous dis honnêtement si Dev2Site est le bon partenaire ou si je vous oriente ailleurs.",
  },
  {
    question: "L'appel est-il vraiment gratuit ?",
    answer:
      "Oui, l'appel découverte est 100 % gratuit et sans engagement. Aucune relance commerciale ne suit si vous n'êtes pas intéressé.",
  },
  {
    question: "Faut-il préparer quelque chose avant ?",
    answer:
      "Pas obligatoire. Avoir une idée de votre besoin, de votre délai et de votre budget approximatif aide à avancer plus vite, mais on peut aussi partir de zéro.",
  },
  {
    question: "Que se passe-t-il après l'appel ?",
    answer:
      "Si le fit est bon, je vous envoie un devis détaillé sous 24 à 48h. Sinon, je vous indique des ressources ou des prestataires plus adaptés.",
  },
  {
    question: "Avec qui se passe l'appel ?",
    answer:
      "L'appel se passe avec Amaury Pichat, fondateur de Dev2Site. C'est lui qui accompagne chaque projet de bout en bout.",
  },
];

function CalendlyInlineEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initCalendly = () => {
      const Calendly = (window as any).Calendly;
      if (Calendly && containerRef.current) {
        containerRef.current.innerHTML = "";
        Calendly.initInlineWidget({
          url: CALENDLY_LINK,
          parentElement: containerRef.current,
        });
      }
    };

    const existingScript = document.getElementById("calendly-widget-script") as HTMLScriptElement | null;
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "calendly-widget-script";
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      script.onload = initCalendly;
      document.body.appendChild(script);
    } else {
      initCalendly();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="calendly-inline-widget"
      style={{ minWidth: "320px", height: "700px" }}
    />
  );
}

export default function ReservationPage() {
  return (
    <main
      id="main-content"
      className="w-full"
      style={{ backgroundColor: "var(--page-background)", color: "var(--em-ink)" }}
    >
      {/* Hero */}
      <section className="home-section px-6 py-14 sm:px-10 lg:px-14" aria-label="Réserver un appel découverte">
        <div className="mx-auto w-full max-w-7xl">
          <nav aria-label="Fil d'Ariane" className="mb-8 text-sm text-black/50">
            <Link href="/" className="hover:text-[var(--em-blue)] hover:underline">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span className="text-black/80">Réserver un appel</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-16">
            <div className="space-y-6">
              <p className="inline-flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em] text-black/55">
                <span>Gratuit</span>
                <span aria-hidden="true">·</span>
                <span>20 min</span>
                <span aria-hidden="true">·</span>
                <span>Sans engagement</span>
              </p>

              <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Discutons de votre projet
              </h1>

              <p className="max-w-2xl text-lg leading-relaxed text-black/75 sm:text-xl">
                Un appel de 20 minutes avec Amaury Pichat, fondateur de Dev2Site, pour faire connaissance,
                comprendre vos besoins et voir si on peut bien travailler ensemble. 100 % gratuit, sans engagement,
                sans relance commerciale.
              </p>

              <ul className="grid gap-3 sm:grid-cols-2">
                {BENEFITS.map((benefit) => (
                  <li key={benefit.label} className="flex items-center gap-3 rounded-xl bg-white/70 px-4 py-3 shadow-sm">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--em-yellow)] text-base">
                      {benefit.icon}
                    </span>
                    <span className="font-semibold text-black/85">{benefit.label}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#cal-embed"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--em-ink)] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Voir les créneaux disponibles
                <span aria-hidden="true">↓</span>
              </a>
            </div>

            <aside className="relative rounded-3xl border border-black/5 bg-white/80 p-6 shadow-xl sm:p-8">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[var(--em-blue)] to-[var(--em-cyan)] text-2xl font-black text-white">
                  AP
                </div>
                <div>
                  <h2 className="text-2xl font-black">Amaury Pichat</h2>
                  <p className="text-black/60">Fondateur & Développeur créatif</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3 border-t border-black/8 pt-6 text-black/80">
                <li className="flex items-center gap-2">
                  <strong className="text-[var(--em-blue)]">5 ans</strong>
                  <span>d&apos;expérience web</span>
                </li>
                <li className="flex items-center gap-2">
                  <strong className="text-[var(--em-blue)]">40+</strong>
                  <span>sites livrés</span>
                </li>
                <li className="flex items-center gap-2">
                  <strong className="text-[var(--em-blue)]">Lyon</strong>
                  <span>et remote</span>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {/* Slots */}
      <section
        id="cal-embed"
        className="home-section px-6 py-16 sm:px-10 lg:px-14"
        style={{ backgroundColor: "rgba(15, 34, 70, 0.03)" }}
        aria-label="Créneaux disponibles"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-black/50">Réservez votre créneau</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Choisissez un créneau qui vous convient</h2>
            <p className="mx-auto mt-3 max-w-2xl text-black/65">
              Calendrier en temps réel · Disponibilités sous 48-72h en général · Du lundi au vendredi 9h-18h.
            </p>
          </div>

          <div className="mx-auto max-w-3xl rounded-3xl border border-black/5 bg-white p-6 shadow-xl sm:p-10">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/50">Prendre rendez-vous</p>
              <h3 className="mt-1 text-2xl font-black">Prochains créneaux disponibles</h3>
              <p className="mt-1 text-black/65">Consultations 20 minutes par téléphone ou visioconférence.</p>
            </div>

            <CalendlyInlineEmbed />

            <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl bg-black/[0.03] p-5 sm:flex-row">
              <p className="text-sm text-black/60">Disponibilités en temps réel</p>
              <a
                href={CALENDLY_LINK}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-black text-[var(--em-blue)] hover:underline"
              >
                Voir tous les créneaux →
              </a>
            </div>

            <p className="mt-6 text-center text-sm text-black/55">
              Le calendrier ne se charge pas ?{" "}
              <a
                href={CALENDLY_LINK}
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[var(--em-blue)] hover:underline"
              >
                Ouvrez-le directement sur Calendly →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="home-section px-6 py-16 sm:px-10 lg:px-14" aria-label="Déroulement de l'appel">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-black/50">Au programme</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Comment se déroulent ces 20 minutes</h2>
            <p className="mx-auto mt-3 max-w-2xl text-black/65">
              Un déroulé simple, en 4 étapes, pour optimiser votre temps.
            </p>
          </div>

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li
                key={step.number}
                className="relative rounded-3xl border border-black/5 bg-white p-6 shadow-md transition-transform hover:-translate-y-1"
              >
                <span
                  className="absolute right-5 top-5 text-4xl font-black leading-none opacity-[0.08]"
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <p className="mb-3 text-3xl font-black text-[var(--em-cyan)]">{step.number}</p>
                <h3 className="text-lg font-black">{step.title}</h3>
                <p className="mb-3 mt-1 text-xs font-bold uppercase tracking-wider text-[var(--em-blue)]">
                  {step.duration}
                </p>
                <p className="text-sm leading-relaxed text-black/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="home-section px-6 py-16 sm:px-10 lg:px-14" aria-label="Foire aux questions">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-black/50">FAQ</p>
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Questions fréquentes sur l&apos;appel</h2>
            <p className="mx-auto mt-3 max-w-2xl text-black/65">Les réponses claires aux questions qu&apos;on me pose le plus.</p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <details
                key={faq.question}
                className="reservation-details group rounded-2xl border border-black/6 bg-white p-5 shadow-sm open:shadow-md"
                {...(index === 0 ? { open: true } : {})}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-black sm:text-lg">
                  {faq.question}
                  <span
                    className="ml-4 text-2xl leading-none text-[var(--em-blue)] transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="reservation-faq-answer mt-4 leading-relaxed text-black/75">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="home-section px-6 py-16 sm:px-10 lg:px-14" aria-label="Autres moyens de contact">
        <div className="mx-auto w-full max-w-4xl rounded-3xl bg-[var(--em-ink)] p-8 text-center text-white shadow-2xl sm:p-12">
          <h2 className="text-2xl font-black sm:text-3xl">Pas envie d&apos;attendre un appel ?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Vous pouvez aussi me contacter directement par mail ou par téléphone pour échanger sur votre projet.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:amo@dev2site.net"
              className="inline-flex min-w-[12rem] items-center justify-center rounded-full bg-white px-7 py-3.5 text-sm font-black uppercase tracking-wider text-[var(--em-ink)] shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Envoyer un email
            </a>
            <a
              href="tel:+33688918019"
              className="inline-flex min-w-[12rem] items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-0.5 hover:bg-white/10"
            >
              Appeler
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
