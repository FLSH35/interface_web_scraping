import { scrapeEpisodes } from '@/lib/scraper';
import { NextResponse } from 'next/server';

interface Episode {
  title: string;
  description: string;
  date: string;
  duration: string;
}

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendUpdate = (data: { episodes?: Episode[]; status: string; error?: string }) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        await scrapeEpisodes((episodes: Episode[]) => {
          sendUpdate({ episodes, status: 'progress' });
        });
        sendUpdate({ status: 'complete' });
        controller.close();
      } catch (error) {
        sendUpdate({ status: 'error', error: (error as Error).message });
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}