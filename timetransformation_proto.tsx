'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input'; 
import { Button } from '@/components/ui/button'; 
import { ChatWindow } from '@/components/chat/ChatWindow'; 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; 

type Message = {
  id: string;
  text: string;          // muss ein string bleiben
  isUserMessage?: boolean;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Beispielhafte 5 Fragen (stabil via useMemo, leeres Dep-Array)
  const questions = useMemo(() => [
    "Frage 1: Wie ist die Verteilung deiner Wochenstunden?",
    "Frage 2: Wie bewertest du Ablenkungen in deinem Alltag?",
    "Frage 3: Wie schätzt du deine Effektivität ein?",
    "Frage 4: Wie würdest du deine Zeitgewohnheiten beschreiben?",
    "Frage 5: Wie beurteilst du deine wertvollen Zeiteinheiten?",
  ], []);

  // Beispielhaftes Endergebnis
  const finalResultString = `WIRKSAMKEITSFAKTOR:
------------------------------------
Messwert 1: 85
Messwert 2: 90
Durchschnitt: 87.5

WOCHENSTUNDEN:
------------------------------------
Arbeitszeit: 40h
Freizeit: 20h

ABLENKUNGEN:
------------------------------------
Smartphone: 15%
Soziale Medien: 10%
Sonstiges: 5%

EFFEKTIVITÄT:
------------------------------------
Produktivität: 80%
Pausen: 20%

ZEITGEWOHNHEITEN:
------------------------------------
Frühaufsteher: Ja
Schlafrhythmus: Regelmäßig

WERTVOLLE ZEITEINHEITEN:
------------------------------------
Fokuszeiten: 4 Stunden
Ablenkungszeiten: 2 Stunden

CHRONOTYP:
------------------------------------
Typ: Morgenmensch
Chronotyp-Verschiebung: +1 Stunde

Du lebst tendenziell 1 Stunde versetzt zu deinem Chronotyp.
Du schläfst ungefähr 30 Minuten zu wenig.`;

  // Beim Laden der Seite: eine Einleitung + erste Frage
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: crypto.randomUUID(),
        text: "Willkommen im Chat! Bitte beantworte die folgenden 5 Fragen. Nachdem du die letzte Frage beantwortet hast, wirst du gebeten, deine Email anzugeben, um dein Ergebnis zu erhalten.",
        isUserMessage: false,
      };
      setMessages([welcomeMessage]);

      setTimeout(() => {
        const firstQuestion: Message = {
          id: crypto.randomUUID(),
          text: questions[0],
          isUserMessage: false,
        };
        setMessages((prev) => [...prev, firstQuestion]);
      }, 500);
    }
  // Jetzt nur noch von "messages" abhängig, weil questions stabil ist
  }, [messages, questions]);

  // User schickt Antwort
  const handleSend = () => {
    if (!userInput.trim()) return;

    // Speichere User-Antwort
    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: userInput,
      isUserMessage: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');

    // Nächste Frage oder Email-Abfrage
    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      const nextQuestion: Message = {
        id: crypto.randomUUID(),
        text: questions[nextStep],
        isUserMessage: false,
      };
      setTimeout(() => {
        setMessages((prev) => [...prev, nextQuestion]);
      }, 500);
    } else {
      setShowEmailPrompt(true);
    }
  };

  // Email-Submit => Ergebnis anzeigen
  const handleEmailSubmit = () => {
    if (email.trim() === '') return;
    setShowEmailPrompt(false);

    const resultMessage: Message = {
      id: crypto.randomUUID(),
      text: finalResultString, // Hier nur als string
      isUserMessage: false,
    };
    setTimeout(() => {
      setMessages((prev) => [...prev, resultMessage]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto border rounded shadow">
      <ChatWindow messages={messages} />

      <Dialog open={showEmailPrompt} onOpenChange={setShowEmailPrompt}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bitte gib deine Email-Adresse ein, um dein Ergebnis zu erhalten</DialogTitle>
          </DialogHeader>
          <Input
            type="email"
            placeholder="Email eingeben..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleEmailSubmit}>Submit</Button>
        </DialogContent>
      </Dialog>

      <div className="p-3 border-t flex space-x-2">
        <Input
          type="text"
          placeholder="Deine Antwort..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="flex-1"
          disabled={showEmailPrompt}
        />
        <Button onClick={handleSend} disabled={showEmailPrompt}>
          Send
        </Button>
      </div>
    </div>
  );
}
