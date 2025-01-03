<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ChatMessage as ChatMessageType } from '@/types/chat'
import ChatMessageComponent from './ChatMessage.vue'

const props = defineProps<{
  messages: ChatMessageType[]
  isTyping: boolean
}>()

const messagesContainer = ref<HTMLElement | null>(null)

watch(() => props.messages.length, () => {
  scrollToBottom()
})

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const emit = defineEmits<{
  edit: [content: string]
}>()

const handleEdit = (content: string) => {
  emit('edit', content)
}
</script>

<template>
  <div class="messages" ref="messagesContainer">
    <ChatMessageComponent
      v-for="message in messages"
      :key="message.id"
      :message="message"
      @edit="handleEdit"
    />
  </div>
</template>

<style scoped>
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--surface);
  transition: background-color var(--transition-speed);
}

.messages::-webkit-scrollbar {
  width: 4px;
}

.messages::-webkit-scrollbar-track {
  background: transparent;
}

.messages::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

.messages::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
</style> 