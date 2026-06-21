"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/chat";
import { feedbackApi } from "@/lib/training";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function safeArray(raw: any, ...keys: string[]): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  for (const k of keys) {
    if (Array.isArray(raw[k])) return raw[k];
  }
  return [];
}

export default function ConversationDetailPage({ params }: { params: { uuid: string } }) {
  const [feedbackSent, setFeedbackSent] = useState<Record<string | number, "thumbs_up" | "thumbs_down">>({});

  const handleFeedback = async (messageId: number | string, rating: "thumbs_up" | "thumbs_down") => {
    try {
      await feedbackApi.sendFeedback(messageId, rating);
      setFeedbackSent((prev) => ({ ...prev, [messageId]: rating }));
      toast.success(rating === "thumbs_up" ? "Thanks for the positive feedback!" : "Feedback noted");
    } catch {
      toast.error("Failed to send feedback");
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ["conversation-messages", params.uuid],
    queryFn: () => chatApi.getConversation(params.uuid),
  });

  const messages = safeArray(data?.data, "messages", "data", "items", "results");

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/conversations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">Conversation</h1>
          <p className="text-xs text-muted-foreground font-mono">{params.uuid}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : messages.length === 0 ? (
        <p className="text-muted-foreground">No messages in this conversation.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg: any, i: number) => (
            <div key={msg.id ?? i} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
              >
                <p>{msg.content}</p>
                {msg.role === "assistant" && msg.response_time_ms > 0 && (
                  <p className="text-xs opacity-60 mt-1">{msg.response_time_ms}ms</p>
                )}
              </div>
              {msg.role === "assistant" && msg.id && (
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => handleFeedback(msg.id, "thumbs_up")}
                    disabled={!!feedbackSent[msg.id]}
                    className={cn(
                      "p-1 rounded hover:bg-muted transition-colors",
                      feedbackSent[msg.id] === "thumbs_up" ? "text-green-600" : "text-muted-foreground"
                    )}
                    title="Good response"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(msg.id, "thumbs_down")}
                    disabled={!!feedbackSent[msg.id]}
                    className={cn(
                      "p-1 rounded hover:bg-muted transition-colors",
                      feedbackSent[msg.id] === "thumbs_down" ? "text-red-600" : "text-muted-foreground"
                    )}
                    title="Bad response"
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
