"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Episode {
  title: string;
  description: string;
  date: string;
  duration: string;
}

export default function Home() {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    fetchEpisodesFromFile();
  }, []);

  const fetchEpisodesFromFile = async () => {
    try {
      const res = await fetch('/_data/episodes.json');
      if (res.ok) {
        const data = await res.json();
        setEpisodes(data as Episode[]);
        setStatus(`Loaded ${data.length} episodes from cache`);
      }
    } catch (error) {
      console.error('Error loading episodes:', error);
      setStatus('Failed to load cached episodes');
    }
  };

  const handleScrape = () => {
    setLoading(true);
    setStatus('Scraping started...');

    const eventSource = new EventSource('/api/scrape');

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'progress') {
        setEpisodes([...(data.episodes as Episode[])]);
        setStatus(`Loaded ${data.episodes.length} episodes...`);
      } else if (data.status === 'complete') {
        setStatus(`Scraping completed! Total: ${data.episodes?.length || episodes.length} episodes`);
        setLoading(false);
        eventSource.close();
      } else if (data.status === 'error') {
        setStatus(`Error: ${data.error}`);
        setLoading(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setStatus('Connection lost. Scraping may have failed.');
      setLoading(false);
      eventSource.close();
    };
  };

  return (
    <div className={cn('container mx-auto p-4 min-h-screen bg-background')}>
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-bold">Founders Podcast Episodes</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={handleScrape}
              disabled={loading}
              variant={loading ? 'secondary' : 'default'}
              className="w-40"
            >
              {loading ? 'Scraping...' : 'Start Scraping'}
            </Button>
            <Badge
              variant={loading ? 'secondary' : status.includes('Error') ? 'destructive' : 'outline'}
              className="px-3 py-1"
            >
              {status}
            </Badge>
          </div>
          {episodes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Title</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Duration</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {episodes.map((episode, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell>{episode.title}</TableCell>
                    <TableCell>{episode.date}</TableCell>
                    <TableCell>{episode.duration}</TableCell>
                    <TableCell>{episode.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <p className="text-muted-foreground">No episodes loaded yet. Click "Start Scraping" to fetch them.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}