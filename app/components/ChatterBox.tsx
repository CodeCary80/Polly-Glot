"use client"

import { languages } from "@/app/lib/translatetion"
import { useState, useRef, useEffect } from 'react'
import { Message } from "@/app/types"
import { marked } from "marked"
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ChatterBoxProps } from "@/app/types"


export default function ChatterBox({onBack, incrementUsage, userApiKey, onInvalidKey}: ChatterBoxProps) {
  const [language, setLanguage] = useState(() => {
  try {
    return localStorage.getItem("language") || languages[0].id
  } catch {
    return languages[0].id
  }
})
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>(() => {
  try {
    const saved = localStorage.getItem("messages")
    if (saved) return JSON.parse(saved) 
    return [{ role: "assistant", content: "Hi! Select a language and start chatting with me!" }]
  } catch {
    return [{ role: "assistant", content: "Hi! Select a language and start chatting with me!" }] 
  }
})
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend(){
            if(input.trim()==="") return
            setMessages(prev=>[...prev,{ role: "user", content: input }])
            setIsLoading(true)
            setError(null)

            const key = userApiKey || localStorage.getItem("userApiKey") || ""

            try{
              if(key){
                  const res = await fetch("https://api.anthropic.com/v1/messages", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "x-api-key": key,
                          "anthropic-version": "2023-06-01",
                          "anthropic-dangerous-direct-browser-access": "true"
                        },
                        body: JSON.stringify({
                          model: "claude-haiku-4-5-20251001",
                            max_tokens: 1024,
                            temperature: 1,
                            system: `
                                      You are a helpful and engaging AI conversation partner. Your task is to communicate with the user exclusively in the language specified: ${language}.

                                      Follow these strict rules:

                                      Language Consistency: Always respond in the language specified by the user. If the user sends a message in a different language, reply to their intent but do it using the target language.

                                      Natural Interaction: Maintain a tone that is appropriate for a chat application—friendly, clear, and helpful.

                                      Grammar & Expression Feedback: If the user's message contains grammatical errors or sounds unnatural/non-native, provide a brief correction at the very beginning of your response. Use the format: *Correction: [Corrected sentence]*. If the input is correct, do not include this section.

                                      Formatting: Use Markdown (bolding, lists, or headers) where appropriate to make long responses easy to read on a mobile screen.

                                      No Conversational Filler: Do not include meta-talk like "I understand" or "Here is my response." Start your reply immediately with the content of the conversation.

                                      Technical Integrity: If the conversation involves technical topics, preserve the accuracy of terminology. If code snippets are discussed, do not translate the functional code; only explain it in the target language.
                                  `,
                          messages: [...messages, { role: "user", content: input }]
                        })
                      })
                      const data = await res.json()
                      if (data.error) {
                        setError("Invalid API key. Please try again.")
                        onInvalidKey()
                        return
                      }
                      const reply = data.content[0].text
                      setMessages(prev => [...prev, { role: "assistant", content: reply }])
                      incrementUsage()
              }else{
            const res = await fetch("/api/chatterbox",{
                        method:"POST",
                        headers:{"Content-Type":"application/json"},
                        body:JSON.stringify({ messages: [...messages, { role: "user", content: input }], language })
                    })
            const data = await res.json()

            if(data.error){setError("Sorry, something went wrong. Please try again.")}else{
            setMessages(prev=>[...prev,{ role: "assistant", content: data.reply }])
            incrementUsage()
            }
          }
          }catch(err){setError("Network error. Please check your connection.")}
          finally{
            setInput('')
            setIsLoading(false)
          }
  }

  function clearMemory(){
    localStorage.removeItem("messages")
    setMessages([{ role: "assistant", content: "Hi! Select a language and start chatting with me!" }])
  }

  useEffect(()=>{
  bottomRef.current?.scrollIntoView({behavior:"smooth"})
},[messages])

useEffect(()=>{
  bottomRef.current?.scrollIntoView({behavior:"smooth"})
},[isLoading])

useEffect(() => {
  localStorage.setItem("messages", JSON.stringify(messages))
}, [messages])

useEffect(() => {
  localStorage.setItem("language", language)
}, [language])

  return (
    <div className="flex flex-col h-[767px] px-4 py-4">
     <div className="w-[360px] h-[660px] border-2 border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
      {/* 1. chat bubbles area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`px-4 py-3 rounded-2xl max-w-[80%] font-semibold text-[16px] ${
            msg.role === "user"
              ? "bg-[#32CD32] self-end text-black"
              : "bg-[#035A9D] self-start text-white"
          }`}>
            {msg.role === "assistant" ? (
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: marked(msg.content) as string }} />
            ) : (
              msg.content
            )}
            <div ref={bottomRef}></div>
          </div>
        ))}
        {isLoading && (
            <DotLottieReact
              src="https://lottie.host/bd63b2af-6d31-48a5-8bdc-36ce3dc1c4da/1DXFlVCtui.lottie"
              loop
              autoplay
              style={{ width: 200, height: 110 }}
              onError={() => console.error("Lottie animation failed to load")}
            />
          
        )}
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      {/* 2. input + send button */}
      <div className="flex gap-2 mb-4 ">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 outline-none resize-none text-[18px]"
          rows={2}
        />
        <button 
            className="bg-[#035A9D] text-white px-4 rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50"
            onClick={handleSend}
            disabled={isLoading || input.trim() === ""}
            >
          Send
        </button>
      </div>

      {/* 3. language selector */}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border border-gray-200 bg-gray-100 rounded-lg px-4 py-2 text-[18px]"
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>{lang.label}</option>
        ))}
      </select>

      <button 
                className="w-full bg-[#035A9D] text-white font-bold text-xl py-2 rounded-xl mt-8 -mb-6 hover:bg-blue-800 text-[24px]"
                onClick={()=>clearMemory()}
                >
          Clear chat
        </button>

       <button 
                className="w-full bg-[#035A9D] text-white font-bold text-xl py-2 rounded-xl mt-8 hover:bg-blue-800 text-[24px]"
                onClick={onBack}
                >
          Back to home page
        </button>
      </div>
    </div>
  )
}