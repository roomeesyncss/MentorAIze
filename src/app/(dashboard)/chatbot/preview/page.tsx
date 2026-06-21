"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { chatbotApi } from "@/lib/chatbot";
import { useChatStream } from "@/hooks/useChatStream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, RotateCcw, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatbotPreviewPage() {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isStreaming, sendMessage, resetChat } = useChatStream("/api/chat/message/stream");

  const { data: chatbotData, isLoading: chatbotLoading, error: chatbotError } = useQuery({
    queryKey: ["my-chatbot"],
    queryFn: () => chatbotApi.getMine(),
    retry: (failureCount, err: any) => {
      if (err?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const chatbot = chatbotData?.data;
  const noChatbot = (chatbotError as any)?.response?.status === 404;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (chatbotLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (noChatbot) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <div className="text-center">
          <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No chatbot yet</h2>
          <p className="text-muted-foreground mb-4">Create a chatbot first before testing</p>
          <Link href="/chatbot">
            <Button>Create Chatbot</Button>
          </Link>
        </div>
      </div>
    );
  }

  const firstBotIndex = messages.findIndex((m) => m.role === "assistant");

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <span className="font-semibold">{chatbot?.name || "Chatbot Preview"}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline">— test your bot</span>
        </div>
        <Button variant="ghost" size="sm" onClick={resetChat}>
          <RotateCcw className="h-4 w-4 mr-1" />
          New Chat
        </Button>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
            <Bot className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Test your chatbot! Send a message to start.</p>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <div key={msg.id}>
                {msg.role === "assistant" && i === firstBotIndex && (
                  <p className="text-xs text-muted-foreground mb-1 ml-1">{chatbot?.name}</p>
                )}
                <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {msg.content === "" && isStreaming && i === messages.length - 1 ? (
                      <span className="flex gap-1 items-center h-4">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      </span>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input bar */}
      <div className="px-4 py-3 border-t bg-background shrink-0">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
            disabled={isStreaming}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isStreaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
