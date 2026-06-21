import { useState, useCallback, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";
import { Message } from "@/types";

export function useChatStream(endpoint: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationUuid, setConversationUuid] = useState<string | null>(null);
  const streamingContentRef = useRef("");

  const sendMessage = useCallback(
    async (message: string, endUserIdentifier?: string) => {
      // Add user message immediately
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "user", content: message, response_time_ms: 0, timestamp: new Date().toISOString() },
      ]);

      setIsStreaming(true);
      streamingContentRef.current = "";

      // Add empty assistant message that we'll fill via streaming
      const assistantMsgId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, role: "assistant", content: "", response_time_ms: 0, timestamp: new Date().toISOString() },
      ]);

      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            message,
            conversation_uuid: conversationUuid,
            ...(endUserIdentifier ? { end_user_identifier: endUserIdentifier } : {}),
          }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("No reader available");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.token) {
                  streamingContentRef.current += data.token;
                  const currentContent = streamingContentRef.current;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId ? { ...msg, content: currentContent } : msg
                    )
                  );
                }

                if (data.done) {
                  setConversationUuid(data.conversation_uuid);
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMsgId 
                        ? { ...msg, response_time_ms: data.response_time_ms || 0 } 
                        : msg
                    )
                  );
                }

                if (data.error) {
                  console.error("Stream error:", data.error);
                }
              } catch (parseError) {
                // Ignore parse errors for incomplete JSON
              }
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: "Sorry, an error occurred. Please try again." }
              : msg
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [endpoint, conversationUuid]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setConversationUuid(null);
  }, []);

  return { 
    messages, 
    isStreaming, 
    conversationUuid, 
    sendMessage, 
    resetChat, 
    setMessages, 
    setConversationUuid 
  };
}
