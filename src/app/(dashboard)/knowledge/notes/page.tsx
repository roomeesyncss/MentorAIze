"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { knowledgeApi } from "@/lib/knowledge";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { formatDate, truncateText } from "@/lib/utils";

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editNote, setEditNote] = useState<any>(null);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: () => knowledgeApi.getNotes(),
  });

  const raw = data?.data;
  const notes = Array.isArray(raw) ? raw : (raw?.notes || raw?.data || raw?.items || []);

  const openCreate = () => {
    setEditNote(null);
    setFormData({ title: "", content: "" });
    setDialogOpen(true);
  };

  const openEdit = (note: any) => {
    setEditNote(note);
    setFormData({ title: note.title, content: note.content });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editNote) {
        await knowledgeApi.updateNote(editNote.note_uuid, formData);
        toast.success("Note updated!");
      } else {
        await knowledgeApi.createNote(formData);
        toast.success("Note created!");
      }
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (uuid: string) => {
    try {
      await knowledgeApi.deleteNote(uuid);
      toast.success("Note deleted");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    } catch {
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Training Notes</h1>
          <p className="text-sm text-muted-foreground mt-1">Max 2 notes</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No training notes yet</p>
            <p className="text-sm text-muted-foreground">Add notes to teach your chatbot specific knowledge</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note: any) => (
            <Card key={note.note_uuid}>
              <CardContent className="flex items-start justify-between py-4">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="font-medium">{note.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{truncateText(note.content, 100)}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(note.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(note)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{note.title}&quot;.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(note.note_uuid)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editNote ? "Edit Note" : "Add Training Note"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                required
                rows={6}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
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
                    Saving...
                  </>
                ) : (
                  editNote ? "Update" : "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
