"use client";

import { useEffect, useMemo, useState } from "react";

type ConsentPreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

const CONSENT_COOKIE_NAME = "dev2site3_cookie_consent";
const COOKIE_TTL_DAYS = 180;

function readConsentCookie(): ConsentPreferences | null {
  if (typeof document === "undefined") {
    return null;
  }

  const prefix = `${CONSENT_COOKIE_NAME}=`;
  const rawCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));

  if (!rawCookie) {
    return null;
  }

  const rawValue = rawCookie.slice(prefix.length);

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<ConsentPreferences>;

    if (typeof parsed.analytics !== "boolean" || typeof parsed.marketing !== "boolean") {
      return null;
    }

    return {
      essential: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeConsentCookie(consent: ConsentPreferences) {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date(Date.now() + COOKIE_TTL_DAYS * 24 * 60 * 60 * 1000).toUTCString();
  const encoded = encodeURIComponent(JSON.stringify(consent));

  document.cookie = `${CONSENT_COOKIE_NAME}=${encoded}; expires=${expires}; path=/; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent("cookie-consent-updated", { detail: consent }));
}

function buildConsent(analytics: boolean, marketing: boolean): ConsentPreferences {
  return {
    essential: true,
    analytics,
    marketing,
    updatedAt: new Date().toISOString(),
  };
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [hasSavedConsent, setHasSavedConsent] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const saved = readConsentCookie();

    if (!saved) {
      setIsVisible(true);
      return;
    }

    setHasSavedConsent(true);
    setAnalytics(saved.analytics);
    setMarketing(saved.marketing);
  }, []);

  const consentPreview = useMemo(
    () => ({ essential: true, analytics, marketing }),
    [analytics, marketing]
  );

  const saveConsent = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const consent = buildConsent(nextAnalytics, nextMarketing);
    writeConsentCookie(consent);
    setHasSavedConsent(true);
    setAnalytics(nextAnalytics);
    setMarketing(nextMarketing);
    setIsVisible(false);
    setIsCustomizing(false);
  };

  if (!isVisible) {
    if (!hasSavedConsent) {
      return null;
    }

    return (
      <button
        type="button"
        className="cookie-consent__launcher"
        onClick={() => {
          setIsCustomizing(true);
          setIsVisible(true);
        }}
        aria-label="Gerer les cookies"
      >
        Gerer les cookies
      </button>
    );
  }

  return (
    <aside
      className="cookie-consent"
      role="dialog"
      aria-modal="false"
      aria-label="Gestion des cookies"
    >
      <div className="cookie-consent__panel">
        <p className="cookie-consent__kicker">Cookies</p>
        <h2 className="cookie-consent__title">Votre consentement</h2>
        <p className="cookie-consent__copy">
          Nous utilisons des cookies essentiels pour le fonctionnement du site et,
          avec votre accord, des cookies d&apos;analyse et marketing pour ameliorer
          votre experience.
        </p>

        {isCustomizing ? (
          <div className="cookie-consent__options" aria-label="Preferences cookies">
            <label className="cookie-consent__option">
              <input type="checkbox" checked disabled />
              <span>
                <strong>Essentiels</strong>
                <small>Toujours actifs (securite et fonctionnement).</small>
              </span>
            </label>

            <label className="cookie-consent__option">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
              />
              <span>
                <strong>Analyse</strong>
                <small>Mesure d&apos;audience et performance.</small>
              </span>
            </label>

            <label className="cookie-consent__option">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(event) => setMarketing(event.target.checked)}
              />
              <span>
                <strong>Marketing</strong>
                <small>Contenu personnalise et campagnes.</small>
              </span>
            </label>
          </div>
        ) : null}

        <div className="cookie-consent__actions">
          <button
            type="button"
            className="cookie-btn cookie-btn--secondary"
            onClick={() => saveConsent(false, false)}
          >
            Tout refuser
          </button>

          {!isCustomizing ? (
            <button
              type="button"
              className="cookie-btn cookie-btn--ghost"
              onClick={() => setIsCustomizing(true)}
            >
              Personnaliser
            </button>
          ) : (
            <button
              type="button"
              className="cookie-btn cookie-btn--ghost"
              onClick={() => setIsCustomizing(false)}
            >
              Retour
            </button>
          )}

          <button
            type="button"
            className="cookie-btn cookie-btn--primary"
            onClick={() =>
              isCustomizing
                ? saveConsent(analytics, marketing)
                : saveConsent(true, true)
            }
          >
            {isCustomizing ? "Enregistrer" : "Tout accepter"}
          </button>
        </div>

        <p className="cookie-consent__meta" aria-live="polite">
          Choix actuel: essentiels {consentPreview.essential ? "oui" : "non"},
          analyse {consentPreview.analytics ? "oui" : "non"}, marketing{" "}
          {consentPreview.marketing ? "oui" : "non"}.
        </p>
      </div>
    </aside>
  );
}
