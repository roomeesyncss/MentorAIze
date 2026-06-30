"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { knowledgeApi } from "@/lib/knowledge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, StickyNote, Video, Globe } from "lucide-react";

export default function KnowledgePage() {
  const { data: docs, isLoading: docsLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => knowledgeApi.getDocuments(),
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => knowledgeApi.getNotes(),
  });

  const { data: transcripts, isLoading: transcriptsLoading } = useQuery({
    queryKey: ["transcripts"],
    queryFn: () => knowledgeApi.getTranscripts(),
  });

  const cards = [
    {
      title: "Documents",
      description: "Upload PDF and DOCX files",
      href: "/knowledge/documents",
      icon: FileText,
      count: (Array.isArray(docs?.data) ? docs.data : docs?.data?.documents || docs?.data?.data || docs?.data?.items || []).length,
      loading: docsLoading,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Training Notes",
      description: "Add custom training content",
      href: "/knowledge/notes",
      icon: StickyNote,
      count: (Array.isArray(notes?.data) ? notes.data : notes?.data?.notes || notes?.data?.data || notes?.data?.items || []).length,
      loading: notesLoading,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "YouTube Transcripts",
      description: "Transcribe YouTube videos",
      href: "/knowledge/transcripts",
      icon: Video,
      count: (Array.isArray(transcripts?.data) ? transcripts.data : transcripts?.data?.transcripts || transcripts?.data?.data || transcripts?.data?.items || []).length,
      loading: transcriptsLoading,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Web Sources",
      description: "Websites, audio & sitemaps",
      href: "/knowledge/websites",
      icon: Globe,
      count: null,
      loading: false,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">Manage your AI chatbot&apos;s training data</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-2">
                <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center mb-2`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardHeader>
              <CardContent>
                {card.loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl font-bold">{card.count ?? "→"}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">items uploaded</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
