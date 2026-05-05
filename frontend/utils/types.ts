type MessageRole = "user" | "assistant" | "tool" | "system";
type MessageStatus = "pending" | "streaming" | "completed" | "error";

interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  createdAt: string;
  model?: string;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}