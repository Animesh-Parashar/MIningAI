import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

// -------------------------
// Types
// -------------------------
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// -------------------------
// Chat Component
// -------------------------
const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your Digital Mine Safety Officer. I can help you analyze accident data, provide safety recommendations, and answer questions about mining safety protocols. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);

  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when new messages appear
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // -------------------------
  // Send message handler
  // -------------------------
  const handleSend = async (): Promise<void> => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content }),
      });

      let botContent = "Sorry, I had trouble with that request.";

      if (response.ok) {
        try {
          const result = await response.json();
          if (result?.ok && result?.out) {
            botContent = result.out;
          }
        } catch {
          botContent = "Received empty or invalid response from the server.";
        }
      } else {
        botContent = `Error: ${response.statusText}`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: botContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      console.error("Chat API error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, an error occurred: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // -------------------------
  // Enter key handler
  // -------------------------
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-white">
        Digital Mine Safety Officer (AI Chat)
      </h1>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-[600px] flex flex-col">
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" ? "bg-[#00BFA5]" : "bg-[#2A2A2A]"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-[#00BFA5]" />
                  )}
                </div>

                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-[#00BFA5] text-white"
                      : "bg-[#0D0D0D] border border-[#2A2A2A] text-[#E0E0E0]"
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-5 my-2" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-5 my-2" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="leading-relaxed my-2" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong
                            className="font-semibold text-white"
                            {...props}
                          />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic text-gray-300" {...props} />
                        ),
                        table: ({ node, ...props }) => (
                          <table
                            className="table-auto border-collapse border border-gray-600 text-sm my-3"
                            {...props}
                          />
                        ),
                        th: ({ node, ...props }) => (
                          <th
                            className="border border-gray-600 px-3 py-1 bg-gray-800 font-semibold"
                            {...props}
                          />
                        ),
                        td: ({ node, ...props }) => (
                          <td
                            className="border border-gray-600 px-3 py-1"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#2A2A2A]">
                  <Bot className="w-5 h-5 text-[#00BFA5]" />
                </div>
                <div className="px-4 py-3 rounded-lg bg-[#0D0D0D] border border-[#2A2A2A]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="border-t border-[#2A2A2A] p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask: 'Show roof fall incidents in 2021' or 'Suggest preventive actions for coal mines'"
              className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:border-[#00BFA5]"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isTyping ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
