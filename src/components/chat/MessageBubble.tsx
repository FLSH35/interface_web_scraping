import React from 'react';
import clsx from 'clsx';

type MessageBubbleProps = {
  text: string;
  isUserMessage?: boolean;
};

export function MessageBubble({ text, isUserMessage }: MessageBubbleProps) {
  return (
    <div
      className={clsx(
        // Hier wird `text-lg` für eine größere Schrift hinzugefügt.
        // Du kannst auch `text-xl`, `text-2xl`, usw. ausprobieren.
        'px-4 py-2 rounded-lg max-w-xs break-words text-lg',
        isUserMessage
          ? 'ml-auto bg-blue-500 text-white'
          : 'mr-auto bg-gray-200 text-gray-900'
      )}
      style={{ fontFamily: 'Calibri, sans-serif' }}
    >
      <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', fontSize : 22 }}>
        {text}
      </pre>
    </div>
  );
}
