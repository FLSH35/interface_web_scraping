import React from 'react';
import { MessageBubble } from './MessageBubble';

export interface ChatMessage {
  id: string;
  text: string;           // Text bleibt ein string (keine ReactNode)
  isUserMessage?: boolean;
}

interface ChatWindowProps {
  messages: ChatMessage[];
}

export function ChatWindow({ messages }: ChatWindowProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((msg) => (
        <div key={msg.id} className="mb-4">
          <MessageBubble
            text={msg.text}
            isUserMessage={msg.isUserMessage}
          />
        </div>
      ))}
    </div>
  );
}
