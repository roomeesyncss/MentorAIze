"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeApi } from "@/lib/knowledge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Video, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/utils";

export default function TranscriptsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", video_url: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["transcripts"],
    queryFn: () => knowledgeApi.getTranscripts(),
  });

  const raw = data?.data;
  const transcripts = Array.isArray(raw) ? raw : (raw?.transcripts || raw?.data || raw?.items || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await knowledgeApi.createTranscript(formData);
      toast.success("Transcript added!");
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
      setDialogOpen(false);
      setFormData({ title: "", video_url: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to add transcript");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    try {
      await knowledgeApi.deleteTranscript(uuid);
      toast.success("Transcript deleted");
      queryClient.invalidateQueries({ queryKey: ["transcripts"] });
    } catch {
      toast.error("Failed to delete transcript");
    }
  };

  const statusVariant = (status: string): "default" | "secondary" | "destructive" => {
    if (status === "completed") return "default";
    if (status === "error") return "destructive";
    return "secondary";
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">YouTube Transcripts</h1>
          <p className="text-sm text-muted-foreground mt-1">Transcribe YouTube videos for your chatbot</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Transcript
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : transcripts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Video className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No transcripts yet</p>
            <p className="text-sm text-muted-foreground">Add a YouTube video URL to transcribe it</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transcripts.map((transcript: any) => (
            <Card key={transcript.transcript_uuid}>
              <CardContent className="flex items-start justify-between py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                  <Video className="h-8 w-8 text-red-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">{transcript.title}</p>
                    <div className="mt-1">
                      <a
                        href={transcript.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate max-w-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="truncate">{transcript.video_url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={statusVariant(transcript.status)} className="text-xs">
                        {transcript.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(transcript.created_at)}</span>
                    </div>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Transcript?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &quot;{transcript.title}&quot;.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(transcript.transcript_uuid)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add YouTube Transcript</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                placeholder="e.g., How to Deadlift"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video_url">YouTube URL</Label>
              <Input
                id="video_url"
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Transcript"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
