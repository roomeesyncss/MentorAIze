"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { knowledgeApi } from "@/lib/knowledge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Globe, Mic, Map, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function WebsiteSourcesPage() {
  const qc = useQueryClient();

  // Website
  const { data: sitesData, isLoading: sitesLoading } = useQuery({ queryKey: ["websites"], queryFn: knowledgeApi.getWebsites });
  const [siteUrl, setSiteUrl] = useState("");
  const addSite = useMutation({
    mutationFn: () => knowledgeApi.addWebsite({ url: siteUrl }),
    onSuccess: () => { toast.success("Website scraped and indexed!"); setSiteUrl(""); qc.invalidateQueries({ queryKey: ["websites"] }); },
    onError: (e: any) => toast.error(e.response?.data?.detail || "Failed"),
  });
  const deleteSite = useMutation({
    mutationFn: knowledgeApi.deleteWebsite,
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["websites"] }); },
  });

  // Audio
  const { data: audioData, isLoading: audioLoading } = useQuery({ queryKey: ["audio"], queryFn: knowledgeApi.getAudioSources });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioTitle, setAudioTitle] = useState("");
  const addAudio = useMutation({
    mutationFn: () => knowledgeApi.uploadAudio(audioFile!, audioTitle),
    onSuccess: () => { toast.success("Audio transcribed and indexed!"); setAudioFile(null); setAudioTitle(""); qc.invalidateQueries({ queryKey: ["audio"] }); },
    onError: (e: any) => toast.error(e.response?.data?.detail || "Failed"),
  });
  const deleteAudio = useMutation({
    mutationFn: knowledgeApi.deleteAudio,
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["audio"] }); },
  });

  // Sitemap
  const { data: sitemapData, isLoading: sitemapLoading } = useQuery({ queryKey: ["sitemaps"], queryFn: knowledgeApi.getSitemaps });
  const [sitemapUrl, setSitemapUrl] = useState("");
  const crawlSitemap = useMutation({
    mutationFn: () => knowledgeApi.crawlSitemap({ url: sitemapUrl, max_pages: 20 }),
    onSuccess: () => { toast.success("Sitemap crawled and indexed!"); setSitemapUrl(""); qc.invalidateQueries({ queryKey: ["sitemaps"] }); },
    onError: (e: any) => toast.error(e.response?.data?.detail || "Failed"),
  });
  const deleteSitemap = useMutation({
    mutationFn: knowledgeApi.deleteSitemap,
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["sitemaps"] }); },
  });

  const sites = sitesData?.data?.sources || sitesData?.data || [];
  const audios = audioData?.data?.sources || audioData?.data || [];
  const sitemaps = sitemapData?.data?.sources || sitemapData?.data || [];

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Web Sources</h1>
        <p className="text-muted-foreground mt-1">Add websites, audio files, and sitemaps to your knowledge base</p>
      </div>

      <Tabs defaultValue="websites">
        <TabsList>
          <TabsTrigger value="websites" className="gap-2"><Globe className="h-3 w-3" />Websites</TabsTrigger>
          <TabsTrigger value="audio" className="gap-2"><Mic className="h-3 w-3" />Audio</TabsTrigger>
          <TabsTrigger value="sitemap" className="gap-2"><Map className="h-3 w-3" />Sitemap</TabsTrigger>
        </TabsList>

        {/* Websites */}
        <TabsContent value="websites" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Scraping</CardTitle>
              <CardDescription>Scrape any webpage and index it for your chatbot (max 3)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); addSite.mutate(); }} className="flex gap-2">
                <Input
                  placeholder="https://example.com/about"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  type="url"
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={addSite.isPending}>
                  {addSite.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" />Add</>}
                </Button>
              </form>
              {sitesLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
                <div className="space-y-2">
                  {sites.map((s: any) => (
                    <div key={s.uuid} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.title || s.url}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={s.url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3 w-3" /></Button>
                        </a>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteSite.mutate(s.uuid)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {sites.length === 0 && <p className="text-sm text-muted-foreground">No websites added yet</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio */}
        <TabsContent value="audio" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Audio Transcription</CardTitle>
              <CardDescription>Upload audio files and Whisper AI will transcribe them (max 2)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); if (audioFile) addAudio.mutate(); }} className="space-y-3">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="Podcast Episode 1" value={audioTitle} onChange={(e) => setAudioTitle(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Audio File</Label>
                  <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} required />
                  <p className="text-xs text-muted-foreground">MP3, WAV, M4A, OGG supported</p>
                </div>
                <Button type="submit" disabled={addAudio.isPending || !audioFile}>
                  {addAudio.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Transcribing...</> : "Upload & Transcribe"}
                </Button>
              </form>
              {audioLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
                <div className="space-y-2 border-t pt-4">
                  {audios.map((a: any) => (
                    <div key={a.uuid} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{a.title}</p>
                          <Badge variant="secondary" className="text-xs">{a.status}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteAudio.mutate(a.uuid)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {audios.length === 0 && <p className="text-sm text-muted-foreground">No audio files yet</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sitemap */}
        <TabsContent value="sitemap" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Crawl</CardTitle>
              <CardDescription>Crawl your entire website via sitemap.xml (up to 20 pages, max 2 sitemaps)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={(e) => { e.preventDefault(); crawlSitemap.mutate(); }} className="flex gap-2">
                <Input
                  placeholder="https://example.com/sitemap.xml"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  type="url"
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={crawlSitemap.isPending}>
                  {crawlSitemap.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Map className="h-4 w-4" />Crawl</>}
                </Button>
              </form>
              {sitemapLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : (
                <div className="space-y-2">
                  {sitemaps.map((s: any) => (
                    <div key={s.uuid} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Map className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{s.title || s.url}</p>
                          <p className="text-xs text-muted-foreground">{s.pages_crawled} pages indexed</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteSitemap.mutate(s.uuid)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {sitemaps.length === 0 && <p className="text-sm text-muted-foreground">No sitemaps crawled yet</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
