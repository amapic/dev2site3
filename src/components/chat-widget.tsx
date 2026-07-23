"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./chat-widget.module.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis l'assistant Dev2Site. Comment puis-je vous aider ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const apiMessages = nextMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || `Erreur ${response.status} lors de la réponse.`);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content || "Je n'ai pas compris, pouvez-vous reformuler ?" },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.widget}>
      {isOpen && (
        <div className={styles.window} role="dialog" aria-label="Discuter avec l'assistant Dev2Site">
          <div className={styles.header}>
            <span className={styles.title}>Assistant Dev2Site</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => setIsOpen(false)}
              aria-label="Fermer le chat"
            >
              ×
            </button>
          </div>

          <div className={styles.messages}>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${styles.bubble} ${
                  message.role === "user" ? styles.bubbleUser : styles.bubbleAssistant
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
                <span className={styles.typing}>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
            {error && <div className={styles.error}>{error}</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écrivez votre question..."
              className={styles.input}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.send}
              disabled={isLoading || !input.trim()}
              aria-label="Envoyer"
            >
              →
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {isOpen ? "Fermer" : "Assistant"}
      </button>
    </div>
  );
}
