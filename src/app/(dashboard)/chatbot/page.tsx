"use client";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatbotApi } from "@/lib/chatbot";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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

export default function ChatbotPage() {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tone_description: "",
    expertise_areas: "",
    response_style: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-chatbot"],
    queryFn: () => chatbotApi.getMine(),
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const chatbot = data?.data;
  const hasNoChatbot = (error as any)?.response?.status === 404;

  useEffect(() => {
    if (chatbot) {
      setFormData({
        name: chatbot.name || "",
        tone_description: chatbot.tone_description || "",
        expertise_areas: chatbot.expertise_areas || "",
        response_style: chatbot.response_style || "",
      });
    }
  }, [chatbot]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await chatbotApi.create(formData);
      toast.success("Chatbot created!");
      queryClient.invalidateQueries({ queryKey: ["my-chatbot"] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create chatbot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await chatbotApi.update(formData);
      toast.success("Changes saved!");
      queryClient.invalidateQueries({ queryKey: ["my-chatbot"] });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update chatbot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await chatbotApi.delete();
      toast.success("Chatbot deleted");
      setFormData({ name: "", tone_description: "", expertise_areas: "", response_style: "" });
      queryClient.invalidateQueries({ queryKey: ["my-chatbot"] });
    } catch {
      toast.error("Failed to delete chatbot");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const formFields = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Chatbot Name *</Label>
        <Input
          id="name"
          required
          placeholder="e.g., FitCoach AI"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tone">Tone / Personality</Label>
        <Textarea
          id="tone"
          placeholder="e.g., Friendly and encouraging"
          value={formData.tone_description}
          onChange={(e) => setFormData({ ...formData, tone_description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expertise">Expertise Areas</Label>
        <Input
          id="expertise"
          placeholder="e.g., Fitness, Nutrition, Mindset"
          value={formData.expertise_areas}
          onChange={(e) => setFormData({ ...formData, expertise_areas: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="style">Response Style</Label>
        <Textarea
          id="style"
          placeholder="e.g., Keep answers concise, use bullet points"
          value={formData.response_style}
          onChange={(e) => setFormData({ ...formData, response_style: e.target.value })}
          rows={3}
        />
      </div>
    </div>
  );

  if (hasNoChatbot) {
    return (
      <div className="p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create Your AI Chatbot</CardTitle>
            <CardDescription>Set up your personalized AI assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {formFields}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Chatbot"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chatbot Settings</CardTitle>
          <CardDescription>Update your AI chatbot configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            {formFields}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {chatbot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Share Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Share Token:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{chatbot.share_token || "—"}</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Sharing:</span>
              <Badge variant={chatbot.share_enabled ? "default" : "secondary"}>
                {chatbot.share_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete Chatbot</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Chatbot?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your chatbot and all its data. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
