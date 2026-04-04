'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Memory {
  id: string
  memory_type: string
  content: string
  confidence: number
  created_at: string
}

/**
 * /dashboard/copilot — Chat IA con memoria personal del trader
 */
export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy tu Copilot de INbig Finanzas. Puedo ayudarte con análisis de mercados, revisión de tus trades, estrategias y más. ¿En qué te puedo ayudar hoy?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [memories, setMemories] = useState<Memory[]>([])
  const [showMemories, setShowMemories] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    fetchMemories()
  }, [])

  async function fetchMemories() {
    try {
      const res = await fetch('/api/copilot/memory')
      const data = await res.json()
      setMemories(data.memories || [])
    } catch {
      // silent fail
    }
  }

  async function deleteMemory(id: string) {
    await fetch(`/api/copilot/memory?id=${id}`, { method: 'DELETE' })
    setMemories((prev) => prev.filter((m) => m.id !== id))
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: newMessages.slice(-10, -1),
        }),
      })

      const data = await res.json()
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
        // Refresh memories after response
        setTimeout(fetchMemories, 1000)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error al conectar con el Copilot. Intenta de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-zinc-950">
      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div>
            <h1 className="text-lg font-semibold text-white">Copilot</h1>
            <p className="text-xs text-zinc-500">Asistente de trading con memoria personal</p>
          </div>
          <button
            onClick={() => setShowMemories(!showMemories)}
            className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-md transition-colors"
          >
            {showMemories ? 'Ocultar' : 'Ver'} memoria ({memories.length})
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-zinc-800 text-zinc-100 rounded-bl-sm'
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-zinc-800">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta sobre mercados, analiza un trade, pide una estrategia..."
              rows={2}
              className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-3 text-sm resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors"
            >
              Enviar
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            Enter para enviar · Shift+Enter para nueva línea · Contenido educativo, no asesoramiento financiero
          </p>
        </div>
      </div>

      {/* Memory panel */}
      {showMemories && (
        <div className="w-72 border-l border-zinc-800 flex flex-col">
          <div className="px-4 py-4 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-white">Memoria del Copilot</h2>
            <p className="text-xs text-zinc-500 mt-1">Lo que el Copilot recuerda de ti</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {memories.length === 0 ? (
              <p className="text-xs text-zinc-600 text-center mt-8">
                Sin memorias aún. El Copilot aprenderá de tus preferencias al chatear.
              </p>
            ) : (
              memories.map((m) => (
                <div key={m.id} className="bg-zinc-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-400 font-medium">{m.memory_type}</span>
                    <button
                      onClick={() => deleteMemory(m.id)}
                      className="text-zinc-600 hover:text-red-400 text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{m.content.slice(0, 120)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
