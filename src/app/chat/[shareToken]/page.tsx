"use client";
import { useEffect, useRef, useState } from "react";
import { useChatStream } from "@/hooks/useChatStream";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api";

interface ChatbotInfo {
  name: string;
  is_active: boolean;
}

interface LeadConfig {
  enabled: boolean;
  ask_after_messages: number;
  collect_name: boolean;
  collect_email: boolean;
  collect_phone: boolean;
  form_title?: string;
  form_description?: string;
}

export default function PublicChatPage({ params }: { params: { shareToken: string } }) {
  const [chatbot, setChatbot] = useState<ChatbotInfo | null>(null);
  const [leadConfig, setLeadConfig] = useState<LeadConfig | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoadingChatbot, setIsLoadingChatbot] = useState(true);
  const [input, setInput] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", email: "", phone: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, isStreaming, sendMessage } = useChatStream(
    `/api/chat/shared/${params.shareToken}/message/stream`
  );

  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/shared/${params.shareToken}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setChatbot(data);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoadingChatbot(false);
      }
    };
    const fetchLeadConfig = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat/shared/${params.shareToken}/lead-config`);
        if (res.ok) {
          const data = await res.json();
          setLeadConfig(data);
        }
      } catch {
        // lead capture is optional — silently ignore
      }
    };
    fetchChatbot();
    fetchLeadConfig();
  }, [params.shareToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show lead form after N messages (counting user messages only)
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  useEffect(() => {
    if (
      leadConfig?.enabled &&
      !leadSubmitted &&
      !showLeadForm &&
      userMessageCount > 0 &&
      userMessageCount >= leadConfig.ask_after_messages
    ) {
      setShowLeadForm(true);
    }
  }, [userMessageCount, leadConfig, leadSubmitted, showLeadForm]);

  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    try {
      await fetch(`${API_BASE_URL}/api/chat/shared/${params.shareToken}/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leadData),
      });
    } catch {
      // silently fail
    } finally {
      setIsSubmittingLead(false);
      setLeadSubmitted(true);
      setShowLeadForm(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim(), "visitor");
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoadingChatbot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Chatbot not found</h1>
          <p className="text-gray-500">This chatbot is not found or sharing is disabled.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
          <Bot className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h1 className="font-semibold text-sm">{chatbot?.name}</h1>
          <p className="text-xs text-gray-400">Powered by MentorAIze</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Welcome message */}
          <div className="flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm bg-white shadow-sm border">
              Hi! I&apos;m {chatbot?.name}. How can I help you today?
            </div>
          </div>

          {messages.map((msg, i) => (
            <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white shadow-sm border"
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
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Lead capture modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold mb-1">
              {leadConfig?.form_title || "Before we continue..."}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {leadConfig?.form_description || "Please share your details so we can follow up."}
            </p>
            <form onSubmit={handleSubmitLead} className="space-y-3">
              {leadConfig?.collect_name && (
                <div className="space-y-1">
                  <Label htmlFor="lead-name">Name</Label>
                  <Input
                    id="lead-name"
                    placeholder="Your name"
                    value={leadData.name}
                    onChange={(e) => setLeadData((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
              )}
              {leadConfig?.collect_email && (
                <div className="space-y-1">
                  <Label htmlFor="lead-email">Email</Label>
                  <Input
                    id="lead-email"
                    type="email"
                    placeholder="you@example.com"
                    value={leadData.email}
                    onChange={(e) => setLeadData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              )}
              {leadConfig?.collect_phone && (
                <div className="space-y-1">
                  <Label htmlFor="lead-phone">Phone</Label>
                  <Input
                    id="lead-phone"
                    type="tel"
                    placeholder="+1 555 000 0000"
                    value={leadData.phone}
                    onChange={(e) => setLeadData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => { setShowLeadForm(false); setLeadSubmitted(true); }}
                >
                  Skip
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmittingLead}
                >
                  {isSubmittingLead ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white border-t px-4 py-3">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isStreaming}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
