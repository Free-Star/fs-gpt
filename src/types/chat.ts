export interface ChatSession {
  id: number
  title: string
  lastMessage: string
  timestamp: string
}

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  status?: 'sending' | 'sent' | 'error'
} 