"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/chat";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

function safeArray(raw: any, ...keys: string[]): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  for (const k of keys) {
    if (Array.isArray(raw[k])) return raw[k];
  }
  return [];
}

export default function ConversationsPage() {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApi.getConversations(),
  });

  const conversations = safeArray(data?.data, "conversations", "data", "items", "results").sort(
    (a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Conversations</h1>
        <p className="text-muted-foreground mt-1">All conversations with your chatbot users</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : conversations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm text-muted-foreground">
              Share your chatbot to start getting conversations!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Messages</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Created</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {conversations.map((conv: any) => (
                <tr
                  key={conv.conversation_uuid}
                  className="border-t hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => router.push(`/conversations/${conv.conversation_uuid}`)}
                >
                  <td className="px-4 py-3 font-mono text-xs">{conv.conversation_uuid?.slice(0, 8)}...</td>
                  <td className="px-4 py-3">{conv.message_count ?? "—"}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{conv.created_at ? formatDateTime(conv.created_at) : "—"}</td>
                  <td className="px-4 py-3">{conv.updated_at ? formatDateTime(conv.updated_at) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
