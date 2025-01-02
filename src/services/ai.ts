const API_URL = 'https://api.deepseek.com/v1/chat/completions'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function* streamMessage(messages: ChatMessage[]) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    if (!reader) {
      throw new Error('无法获取响应流')
    }

    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        if (buffer) {
          const lines = buffer.split('\n')
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine || trimmedLine === 'data: [DONE]') continue
            
            if (trimmedLine.startsWith('data: ')) {
              try {
                const jsonStr = trimmedLine.slice(6)
                const data = JSON.parse(jsonStr)
                const content = data.choices?.[0]?.delta?.content
                if (content) {
                  yield content
                }
              } catch (e) {
                console.error('解析最后数据块失败:', e)
              }
            }
          }
        }
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue

        if (trimmedLine.startsWith('data: ')) {
          try {
            const jsonStr = trimmedLine.slice(6)
            const data = JSON.parse(jsonStr)
            const content = data.choices?.[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch (e) {
            console.error('解析数据失败:', e)
          }
        }
      }
    }
  } catch (error) {
    console.error('AI 响应错误:', error)
    throw error
  }
} 