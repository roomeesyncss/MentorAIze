"use client";
import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatbotApi } from "@/lib/chatbot";
import { toast } from "sonner";
import { Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export default function SharePage() {
  const queryClient = useQueryClient();
  const [isToggling, setIsToggling] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-chatbot"],
    queryFn: () => chatbotApi.getMine(),
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const chatbot = data?.data;
  const noChatbot = (error as any)?.response?.status === 404;

  const handleToggle = async (enabled: boolean) => {
    setIsToggling(true);
    try {
      await chatbotApi.updateShare(enabled);
      toast.success(enabled ? "Sharing enabled!" : "Sharing disabled");
      queryClient.invalidateQueries({ queryKey: ["my-chatbot"] });
    } catch {
      toast.error("Failed to update sharing settings");
    } finally {
      setIsToggling(false);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (noChatbot) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You need to create a chatbot before sharing.</p>
          <Link href="/chatbot">
            <Button>Create a Chatbot</Button>
          </Link>
        </div>
      </div>
    );
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = chatbot?.share_token ? `${origin}/chat/${chatbot.share_token}` : "";
  const embedCode = chatbot?.share_token
    ? `<iframe src="${origin}/chat/${chatbot.share_token}" width="400" height="600" frameborder="0"></iframe>`
    : "";

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Share Your Chatbot</h1>
        <p className="text-muted-foreground mt-1">Share or embed your chatbot on your website</p>
      </div>

      {/* Share toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Public Sharing</CardTitle>
          <CardDescription>Allow others to access your chatbot via a link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              id="share-toggle"
              checked={chatbot?.share_enabled || false}
              onCheckedChange={handleToggle}
              disabled={isToggling}
            />
            <Label htmlFor="share-toggle">
              {chatbot?.share_enabled ? "Sharing is enabled" : "Sharing is disabled"}
            </Label>
          </div>
        </CardContent>
      </Card>

      {chatbot?.share_enabled && chatbot?.share_token && (
        <>
          {/* Share link */}
          <Card>
            <CardHeader>
              <CardTitle>Shareable Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded-md truncate">{shareUrl}</code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(shareUrl, "Link copied!")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Embed code */}
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Add this iframe to your website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <pre className="flex-1 text-xs bg-muted px-3 py-2 rounded-md overflow-auto whitespace-pre-wrap break-all">
                  {embedCode}
                </pre>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(embedCode, "Embed code copied!")}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
