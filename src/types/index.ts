export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "user" | "super_admin" | "end_user";
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export interface Chatbot {
  id: number;
  user_id: number;
  name: string;
  tone_description?: string;
  expertise_areas?: string;
  response_style?: string;
  is_active: boolean;
  share_token?: string;
  share_enabled: boolean;
  created_at: string;
}

export interface Document {
  id: number;
  document_uuid: string;
  filename: string;
  file_type: string;
  file_size: number;
  token_count: number;
  status: "processing" | "completed" | "error";
  created_at: string;
}

export interface TrainingNote {
  id: number;
  note_uuid: string;
  title: string;
  content: string;
  token_count: number;
  created_at: string;
}

export interface Transcript {
  id: number;
  transcript_uuid: string;
  title: string;
  video_url: string;
  status: "processing" | "completed" | "error";
  created_at: string;
}

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  response_time_ms: number;
  timestamp: string;
}

export interface Conversation {
  conversation_uuid: string;
  chatbot_name: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatStreamEvent {
  token?: string;
  done?: boolean;
  conversation_uuid?: string;
  response_time_ms?: number;
  error?: string;
}

export interface AnalyticsOverview {
  total_conversations: number;
  total_messages: number;
  unique_users: number;
  avg_response_time_ms: number;
}

export interface UsageDataPoint {
  date: string;
  conversations: number;
  messages: number;
}

export interface TopUser {
  end_user_identifier: string;
  message_count: number;
  conversation_count: number;
  last_active: string;
}

export interface ConversationDetail {
  conversation_uuid: string;
  end_user_identifier: string;
  message_count: number;
  created_at: string;
  last_message_at: string;
}

export interface EngagementMetrics {
  avg_messages_per_conversation: number;
  avg_session_duration_minutes: number;
  returning_user_rate: number;
}
