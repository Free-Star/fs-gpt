export interface ChatSession {
  id: number
  title: string
  lastMessage: string
  timestamp: string
}

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: number
  role: ChatRole
  content: string
  timestamp: string
  status?: 'sending' | 'sent' | 'error'
} 